'use client';

import { useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { useSession } from 'next-auth/react';
import clsx from 'clsx';
import { FullConversationType } from '@/shared/types';
import useOtherUser from '@/app/hooks/useOtherUser';
import Avatar from '@/shared/components/status&sidebar/Avatar';
import AvatarGroup from '@/shared/components/status&sidebar/AvatarGroup';

interface ConversationBoxProps {
  conversation: FullConversationType;
  selected: boolean;
}

const ConversationBox: React.FC<ConversationBoxProps> = ({
  conversation,
  selected,
}) => {
  const otherUser = useOtherUser(conversation);

  const router = useRouter();
  const session = useSession();

  const handleClick = useCallback(() => {
    router.push(`/conversations/${conversation.id}`);
  }, [conversation.id, router]);

  const lastMessage = useMemo(() => {
    const messages = conversation.messages || [];
    return messages[messages.length - 1];
  }, [conversation.messages]);

  const userEmail = useMemo(() => {
    return session.data?.user?.email;
  }, [session.data?.user?.email]);

  const hasSeen = useMemo(() => {
    if (!lastMessage) return false;

    const seenArray = lastMessage.seen || [];

    if (!userEmail) return false;

    return seenArray.filter((user:any) => user.email === userEmail).length !== 0;
  }, [lastMessage, userEmail]);

  const lastMessageText = useMemo(() => {
    if (lastMessage?.image) {
      return 'Sent an image';
    }

    if (lastMessage?.body) {
      return lastMessage.body;
    }

    return 'Started a chat...';
  }, [lastMessage]);
  return (
    <div
      onClick={handleClick}
      className={clsx(
        'w-full relative flex items-center space-x-3 rounded-lg transition cursor-pointer p-3',
        selected 
          ? 'bg-primary/10 dark:bg-primary/20' 
          : 'bg-card hover:bg-muted dark:bg-card/95 dark:hover:bg-muted/30',
        'shadow-sm hover:shadow-card'
      )}
    >
      {conversation.isGroup ? (
        <AvatarGroup users={conversation.users} />
      ) : (
        <Avatar user={otherUser} />
      )}

      <div className="min-w-0 flex-1">
        <div className="focus:outline-none">
          <div className="flex justify-between items-center mb-1">
            <p className="text-md font-medium text-foreground">
              {conversation.name || otherUser?.username}
            </p>

            {lastMessage?.createdAt && (
              <p className="text-xs text-muted-foreground">
                {format(new Date(lastMessage.createdAt), 'p')}
              </p>
            )}
          </div>

          <p
            className={clsx(
              'truncate text-sm',
              hasSeen 
                ? 'text-muted-foreground' 
                : 'text-foreground font-medium'
            )}
          >
            {lastMessageText}
          </p>
        </div>
      </div>
    </div>
  );
};




export default ConversationBox;