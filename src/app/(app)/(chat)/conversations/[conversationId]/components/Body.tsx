// Body.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { FullMessageType } from '@/shared/types';
import useConversation from '@/app/(app)/(chat)/(comp)/hooks/useConversation';
import MessageBubble from './MessageBubble';
import axios from 'axios';
import { pusherClient } from '@/shared/lib/pusher';
import { find } from 'lodash';
import { FullConversationType } from '@/shared/types';
import { useMessages } from '@/context/MessagesProvider';
import { useSession } from 'next-auth/react';
import { useReply } from '@/context/ReplyProvider';

interface BodyProps {
  conversation: FullConversationType;
}

const Body: React.FC<BodyProps> = ({ conversation }) => {
  const { messages, setMessages } = useMessages();
  const [isAnonymous, setIsAnonymous] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { conversationId } = useConversation();
  const session = useSession();
  const { setReplyTo } = useReply();

  useEffect(() => {
    const loadConversation = async () => {
      try {
        if (conversation) {
          setIsAnonymous(!!conversation.isGroup && !!conversation.isAnonymous);
        }
      } catch (error) {
        console.error('Error loading conversation:', error);
      }
    };

    loadConversation();
  }, [conversationId]);

  useEffect(() => {
    axios.post(`/api/chat/conversations/${conversationId}/seen`);
  }, [conversationId]);

  useEffect(() => {
    pusherClient.subscribe(conversationId);
    bottomRef?.current?.scrollIntoView();

    const messageHandler = (message: FullMessageType) => {
      axios.post(`/api/chat/conversations/${conversationId}/seen`);

      console.log('Pusher message received:', message.id, message.body);

      setMessages((prevMessages) => {
        // Check if message already exists by id
        if (find(prevMessages, { id: message.id })) {
          console.log('Message already exists by id, skipping');
          return prevMessages;
        }
        
        // Check if there's an optimistic message with the same content and sender
        // that was just sent (within last 5 seconds) to prevent duplicates
        const recentOptimisticMessage = prevMessages.find(msg => 
          'tempId' in msg && 
          msg.body === message.body && 
          msg.senderId === message.senderId &&
          msg.createdAt && 
          new Date().getTime() - new Date(msg.createdAt).getTime() < 5000
        );
        
        if (recentOptimisticMessage) {
          console.log('Found matching optimistic message, replacing:', (recentOptimisticMessage as any).tempId);
          // Replace the optimistic message with the real one
          return prevMessages.map(msg => 
            msg === recentOptimisticMessage ? message : msg
          );
        }
        
        console.log('Adding new message from Pusher');
        return [...prevMessages, message];
      });

      bottomRef?.current?.scrollIntoView();
    };

    const updateMessageHandler = (newMessage: FullMessageType) => {
      setMessages((prevMessages) =>
        prevMessages.map((message) => {
          if ('id' in message && message.id === newMessage.id) return newMessage;
          return message;
        })
      );
    };

    // Add message deletion handler
    const deleteMessageHandler = (messageId: string) => {
      setMessages((prevMessages) => 
        prevMessages.filter((message) => !('id' in message) || message.id !== messageId)
      );
    };

    // Add reaction update handler
    const reactionUpdateHandler = (data: { messageId: string; reactions: any[] }) => {
      setMessages((prevMessages) =>
        prevMessages.map((message) => {
          if ('id' in message && message.id === data.messageId) {
            return { ...message, reactions: data.reactions };
          }
          return message;
        })
      );
    };

    pusherClient.bind('messages:new', messageHandler);
    pusherClient.bind('message:update', updateMessageHandler);
    pusherClient.bind('message:delete', deleteMessageHandler);
    pusherClient.bind('message:reaction-update', reactionUpdateHandler);

    return () => {
      pusherClient.unsubscribe(conversationId);
      pusherClient.unbind('messages:new', messageHandler);
      pusherClient.unbind('message:update', updateMessageHandler);
      pusherClient.unbind('message:delete', deleteMessageHandler);
      pusherClient.unbind('message:reaction-update', reactionUpdateHandler);
    };
  }, [conversationId]);

  // Add local message deletion handler
  const handleMessageDelete = async (messageId: string) => {
    try {
      // Optimistically update UI
      setMessages((prevMessages) => 
        prevMessages.filter((message) => !('id' in message) || message.id !== messageId)
      );
      
      // Make API call
      await axios.delete(`/api/chat/messages/${messageId}`);
      
      // No need for router.refresh() as Pusher will handle the update
    } catch (error) {
      console.error('Error deleting message:', error);
      // Revert the optimistic update if the deletion failed
      const deletedMessage = messages.find((message) => 'id' in message && message.id === messageId);
      if (deletedMessage) {
        setMessages((prevMessages) => [...prevMessages, deletedMessage]);
      }
    }
  };

  // Add reaction handler
  const handleReaction = async (messageId: string, emoji: string) => {
    try {
      await axios.post(`/api/chat/messages/${messageId}/reactions`, { emoji });
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  // Add reply handler (this will be passed to Form component)
  const handleReply = (message: FullMessageType) => {
    setReplyTo(message);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#efeae2] dark:bg-[#0b141a]">
      <div className="flex flex-col space-y-4 p-4 font-['Inter']">
        {messages.map((message, i) => {
          const isOwn = session?.data?.user?.email === message.sender?.email;
          
          return (
                         <MessageBubble
               key={'id' in message ? message.id : (message as any).tempId}
               message={message as FullMessageType}
               isOwn={isOwn}
               isLast={i === messages.length - 1}
               onReply={handleReply}
               onDelete={handleMessageDelete}
               onReaction={handleReaction}
             />
          );
        })}
      </div>
      <div ref={bottomRef} className="pt-24" />
    </div>
  );
};

export default Body;
