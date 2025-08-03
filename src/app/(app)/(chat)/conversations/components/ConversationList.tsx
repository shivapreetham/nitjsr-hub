'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import { MdOutlineGroupAdd } from 'react-icons/md';
import { FullConversationType } from '@/shared/types';
import useConversation from '@/app/hooks/useConversation';
import ConversationBox from './ConversationBox';
import GroupChatModal from './GroupChatModal';
import { User } from '@prisma/client';
import { useSession } from 'next-auth/react';
import { pusherClient } from '@/lib/pusher';
import { find } from 'lodash';

interface ConversationListProps {
  initialConversations: FullConversationType[];
  users: User[];
}

const ConversationList: React.FC<ConversationListProps> = ({
  initialConversations,
  users,
}) => {

  // console.log("got the initial conversations", initialConversations);
  // console.log("users ",users)
  const session = useSession();
  const [conversations, setConversations] = useState(initialConversations);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const { conversationId, isOpen } = useConversation();

  const pusherKey = useMemo(() => {
    return session.data?.user?.email;
  }, [session.data?.user?.email]);

  useEffect(() => {
    if (!pusherKey) return;
    pusherClient.subscribe(pusherKey);
    const newHandler = (conversation: FullConversationType) => {
      setConversations((prevConversations) => {
        if (find(prevConversations, { id: conversation.id }))
          return prevConversations;
        return [conversation, ...prevConversations];
      });
    };

    const updateHandler = (conversation: FullConversationType) => {
      setConversations((prevConversations) =>
        prevConversations.map((c) => {
          if (c.id === conversation.id) {
            return { ...c, messages: conversation.messages };
          }
          return c;
        })
      );
    };

    const deleteHandler = (conversation: FullConversationType) => {
      setConversations((prevConversations) =>
        prevConversations.filter((c) => c.id !== conversation.id)
      );

      if (conversationId === conversation.id) {
        router.push('/conversations');
      }
    };

    pusherClient.bind('conversation:new', newHandler);
    pusherClient.bind('conversation:update', updateHandler);
    pusherClient.bind('conversation:delete', deleteHandler);

    return () => {
      pusherClient.unsubscribe(pusherKey);
      pusherClient.unbind('conversation:new', newHandler);
      pusherClient.unbind('conversation:update', updateHandler);
      pusherClient.unbind('conversation:delete', deleteHandler);
    };
  }, [pusherKey, conversationId, router]);

  return (
    <>
      <GroupChatModal
        users={users}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      <aside
        className={clsx(
          'fixed inset-y-0 pb-20 lg:pb-0 lg:left-20 lg:w-80 lg:block overflow-y-auto border-r theme-transition',
          'border-border/30 bg-background/95 dark:bg-card/95 backdrop-blur-sm',
          'scrollbar-hide',
          isOpen ? 'hidden' : 'block w-full left-0'
        )}
      >
        <div className="px-5">
          <div className="flex justify-between mb-4 py-4 border-b border-border/30">
            <div className="text-2xl font-bold text-foreground">Messages</div>
            <button
              onClick={() => setIsModalOpen(true)}
              title="Create a group chat"
              className={clsx(
                "rounded-full p-2 transition",
                "bg-primary/10 hover:bg-primary/20 dark:bg-primary/20 dark:hover:bg-primary/30",
                "text-primary dark:text-primary-foreground"
              )}
            >
              <MdOutlineGroupAdd size={20} />
            </button>
          </div>

          <div className="space-y-2">
            {conversations.map((conversation) => (
              <ConversationBox
                key={conversation.id}
                conversation={conversation}
                selected={conversationId === conversation.id}
              />
            ))}
          </div>
        </div>
      </aside>
    </>
  );
};

export default ConversationList;