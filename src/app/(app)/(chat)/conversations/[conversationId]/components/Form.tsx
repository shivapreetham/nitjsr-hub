'use client'

import React, { useState, useRef } from 'react';
import useConversation from '@/app/(app)/(chat)/(comp)/hooks/useConversation';
import axios from 'axios';
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { HiPhoto, HiPaperAirplane } from 'react-icons/hi2';
import { Video, Phone } from 'lucide-react';
import MessageInput from './MessageInput';
import { createClient } from '@supabase/supabase-js';
import { messageSchema } from '@/shared/schemas/messageSchema';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useStreamVideoClient } from '@stream-io/video-react-sdk';
import { useCurrentUserContext } from '@/context/CurrentUserProvider';
import { useToast } from '@/app/hooks/use-toast';
import useOtherUser from '@/app/hooks/useOtherUser';
import { Conversation, User } from '@prisma/client';
import { useMessages } from '@/context/MessagesProvider';
import { FullMessageType } from '@/shared/types';
import ReplyInput from './ReplyInput';
import { useReply } from '@/context/ReplyProvider';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!
);

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

interface FormProps {
  conversation: Conversation & {
    users: User[];
  };
}

const Form: React.FC<FormProps> = ({ conversation }) => {
  const { conversationId } = useConversation();
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isStartingCall, setIsStartingCall] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const isSubmitting = useRef(false);
  
  const router = useRouter();
  const client = useStreamVideoClient();
  const { currentUser } = useCurrentUserContext();
  const { toast } = useToast();
  const otherUser = useOtherUser(conversation);
  const { addOptimisticMessage, updateOptimisticMessage, removeOptimisticMessage } = useMessages();
  const { replyTo, setReplyTo } = useReply();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    watch,
    reset
  } = useForm<FieldValues>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      message: ''
    }
  });

  const message = watch('message');

  // Function to cancel reply
  const cancelReply = () => {
    setReplyTo(null);
  };

  const startVideoCall = async () => {
    console.log('Video call button clicked!');
    console.log('Debug data:', {
      currentUser: !!currentUser,
      conversation: !!conversation,
      isGroup: conversation?.isGroup,
      otherUser: !!otherUser,
      conversationId,
      client: !!client
    });
    
    if (!currentUser || !otherUser) {
      console.log('Call blocked:', { currentUser: !!currentUser, otherUser: !!otherUser });
      toast({ title: 'Cannot start call - missing user data', variant: 'destructive' });
      return;
    }
    
    if (!client) {
      console.log('Call blocked: Stream client not available');
      toast({ title: 'Video chat is not available at the moment', variant: 'destructive' });
      return;
    }
    
    setIsStartingCall(true);
    try {
      console.log('Starting video call...');
      
      // Create a Stream call
      const callId = `chat-${conversationId}-${Date.now()}`;
      
      // Create the call using Stream client
      const call = client.call("default", callId);
      
      if (!call) {
        throw new Error("Failed to create call");
      }
      
      console.log('Stream call created:', call);
      
      // Get or create the call
      await call.getOrCreate({
        data: {
          custom: {
            conversationId: conversationId,
            createdBy: currentUser.id,
            participants: [currentUser.id, otherUser.id]
          }
        }
      });
      
      const meetingLink = `${window.location.origin}/videoChat/meeting/${callId}`;
      
      console.log('Meeting details:', { callId, meetingLink });
      
      // Send the meeting link to the conversation with optimistic update
      const tempId = `temp-video-${Date.now()}-${Math.random()}`;
      const optimisticVideoMessage = {
        tempId,
        body: `📞 Video call started! Join here: ${meetingLink}`,
        image: null,
        createdAt: new Date(),
        senderId: currentUser?.id || '',
        seenIds: [currentUser?.id || ''],
        conversationId,
        replyToId: null,
        sender: currentUser,
        seen: currentUser ? [currentUser] : [],
      };

      // Add optimistic message immediately
      addOptimisticMessage(optimisticVideoMessage);

      // Make API call in background (without blocking the UI)
      axios.post('/api/chat/messages', {
        message: `📞 Video call started! Join here: ${meetingLink}`,
        conversationId: conversationId,
        image: null,
      }).then(response => {
        // Update optimistic message with real message
        if (response.data) {
          updateOptimisticMessage(tempId, response.data);
        }
      }).catch(error => {
        console.error('Error sending video call message:', error);
        removeOptimisticMessage(tempId);
      });
      
      console.log('Message sent successfully');
      
      // Navigate to the meeting page
      router.push(`/videoChat/meeting/${callId}?fromChat=true&conversationId=${conversationId}`);
      
      toast({ title: 'Video call started!' });
    } catch (error) {
      console.error('Error starting call:', error);
      toast({ title: 'Failed to start call', variant: 'destructive' });
    } finally {
      setIsStartingCall(false);
    }
  };

  const processAICommand = async (prompt: string) => {
    setIsProcessingAI(true);
    try {
      const response = await axios.post('/api/chat/ai-autofill', {
        topic: prompt.substring(1)
      });
      setValue('message', response.data.message);
    } catch (error) {
      console.error('AI processing failed:', error);
    } finally {
      setIsProcessingAI(false);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      console.error('Invalid file type');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      console.error('File too large');
      return;
    }

    setIsUploadingFile(true);
    try {
      const fileName = `${conversationId}-${Date.now()}.jpg`;

      const { error } = await supabase.storage
        .from('chat-images')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('chat-images')
        .getPublicUrl(fileName);

      // Automatically submit the message with image
      await onSubmit({ message: message || '', imageUrl: publicUrl });
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setImageUrl(null);

    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploadingFile(false);
    }
  };

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    // Prevent multiple submissions
    if (isSubmitting.current) return;
    isSubmitting.current = true;
    setIsSendingMessage(true);

    try {
      if (data.message.startsWith('@')) {
        await processAICommand(data.message);
        setIsSendingMessage(false);
        return;
      }

      // Create optimistic message
      const tempId = `temp-${Date.now()}-${Math.random()}`;
      const optimisticMessage = {
        tempId,
        body: data.message,
        image: data.imageUrl || imageUrl,
        createdAt: new Date(),
        senderId: currentUser?.id || '',
        seenIds: [currentUser?.id || ''],
        conversationId,
        replyToId: replyTo?.id || null,
        sender: currentUser,
        seen: currentUser ? [currentUser] : [],
        replyTo: replyTo || undefined,
      };

      // Add optimistic message immediately
      addOptimisticMessage(optimisticMessage);
      console.log('Added optimistic message:', tempId);

      // Reset form immediately for better UX
      reset();
      setImageUrl(null);
      setReplyTo(null); // Clear reply when message is sent
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Re-enable the input immediately after optimistic update
      setIsSendingMessage(false);

      // Add a small delay to ensure optimistic update is processed before API call
      await new Promise(resolve => setTimeout(resolve, 50));

      // Make API call in background (without blocking the UI)
      axios.post('/api/chat/messages', {
        message: data.message,
        image: data.imageUrl || imageUrl,
        conversationId,
        replyToId: replyTo?.id
      }).then(response => {
        // Update optimistic message with real message
        if (response.data) {
          console.log('Updating optimistic message with real message:', { tempId, realId: response.data.id });
          updateOptimisticMessage(tempId, response.data);
        }
      }).catch(error => {
        console.error('Error sending message:', error);
        // Remove optimistic message if API call failed
        removeOptimisticMessage(tempId);
        toast({
          title: 'Failed to send message',
          description: 'Your message could not be sent. Please try again.',
          variant: 'destructive',
        });
      });
    } catch (error) {
      console.error('Error in form submission:', error);
      setIsSendingMessage(false);
    } finally {
      isSubmitting.current = false;
    }
  };

  return (
    <div className="theme-transition relative">
      <ReplyInput replyTo={replyTo} onCancelReply={cancelReply} />
      <div className="py-4 px-4 bg-white dark:bg-gray-900 backdrop-blur-sm border-t border-border dark:border-border/50 flex items-center gap-2 lg:gap-4 w-full shadow-card">
        <div className="flex items-center gap-2">
          {/* Photo Upload Button */}
          <div className="relative">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept={ACCEPTED_IMAGE_TYPES.join(',')}
              className="hidden"
              id="file-upload"
              disabled={isUploadingFile || isSendingMessage}
            />
            <label
              htmlFor="file-upload"
              className={`cursor-pointer p-2 rounded-full hover:bg-muted transition-colors duration-200 block ${
                (isUploadingFile || isSendingMessage) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isUploadingFile ? (
                <div className="w-[30px] h-[30px] rounded-full border-2 border-primary border-t-transparent animate-spin" />
              ) : (
                <HiPhoto 
                  size={30} 
                  className="text-primary hover:text-primary/80 transition-colors" 
                />
              )}
            </label>
          </div>

          {/* Video Call Button */}
          <Button
            variant="ghost"
            size="sm"
            className="p-2 rounded-full hover:bg-muted transition-colors duration-200"
            onClick={startVideoCall}
            disabled={isStartingCall || isUploadingFile || isSendingMessage}
            title="Start video call"
          >
            {isStartingCall ? (
              <div className="w-[30px] h-[30px] rounded-full border-2 border-primary border-t-transparent animate-spin" />
            ) : (
              <Video 
                size={30} 
                className="text-primary hover:text-primary/80 transition-colors" 
              />
            )}
          </Button>
        </div>
        
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex items-center gap-2 lg:gap-4 w-full"
        >
          <MessageInput
            id="message"
            register={register}
            errors={errors}
            required
            placeholder={message?.startsWith('@') ? "Enter AI prompt (max 20 words)" : "Type a message..."}
            disabled={isProcessingAI || isUploadingFile || isSendingMessage}
          />
          
          <button
            type="submit"
            disabled={isProcessingAI || isUploadingFile || isSendingMessage}
            className="rounded-full p-3 bg-primary hover:bg-primary/90 transition-colors duration-200 shadow-card hover:shadow-card-hover disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSendingMessage ? (
              <div className="w-5 h-5 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
            ) : (
              <HiPaperAirplane 
                size={20} 
                className="text-primary-foreground" 
              />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Form;