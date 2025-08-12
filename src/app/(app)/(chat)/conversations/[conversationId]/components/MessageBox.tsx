'use client';

import { useState, useRef, useEffect } from 'react';
import Avatar from '@/components/status&sidebar/Avatar';
import { FullMessageType } from '@/shared/types';

// Type for optimistic messages that have tempId instead of id
type OptimisticMessageType = Omit<FullMessageType, 'id'> & { tempId: string };

// Union type for all message types
type MessageType = FullMessageType | OptimisticMessageType;
import clsx from 'clsx';
import { useSession } from 'next-auth/react';
import { format } from 'date-fns';
import Image from 'next/image';
import ImageModal from './ImageModal';
import { Info, Trash, Video, Users, ShoppingBag, ExternalLink } from 'lucide-react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from '@/components/ui/button';
import { useCallParticipants } from '@/app/hooks/useCallParticipants';

interface MessageBoxProps {
  isLast: boolean;
  data: MessageType;
  isAnonymous?: boolean;
  onDelete?: (messageId: string) => Promise<void>;
}

const MessageBox: React.FC<MessageBoxProps> = ({ 
  isLast, 
  data,
  isAnonymous,
  onDelete
}) => {
  const session = useSession();
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const messageRef = useRef<HTMLDivElement>(null);

  const isOwn = session?.data?.user?.email === data.sender?.email;
  const isOptimistic = (data as any).tempId; // Check if this is an optimistic message
  const seenList = (data.seen || [])
    .filter((user: any) => user.email !== session?.data?.user?.email)
    .map((user: any) => user.name)
    .join(', ');

  const handleDelete = async () => {
    if (isDeleting) return;
    try {
      setIsDeleting(true);
      if ('id' in data) {
        await onDelete?.(data.id);
      }
    } catch (error) {
      console.error('Error deleting message:', error);
    } finally {
      setIsDeleting(false);
      setShowActions(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (messageRef.current && !messageRef.current.contains(event.target as Node)) {
        setShowActions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const container = clsx(
    'flex gap-3 p-4 relative',
    isOwn && 'justify-end'
  );

  const avatar = clsx(
    'transition-opacity',
    isOwn && 'order-2',
    isAnonymous ? 'opacity-100' : 'hover:opacity-75'
  );

  const body = clsx(
    'flex flex-col gap-2',
    isOwn && 'items-end'
  );

  // Check if this is a special message type using the database type field
  const messageType = (data as any).type || 'TEXT';
  const isVideoCall = messageType === 'VIDEO_CALL';
  const isMarketplaceMessage = messageType === 'MARKETPLACE_INTEREST';
  const isSpecialMessage = isVideoCall || isMarketplaceMessage;
  
  const message = clsx(
    'text-sm w-fit overflow-hidden theme-transition relative group cursor-pointer',
    // Only apply bubble styles to non-special messages
    !isSpecialMessage && !data.image && 'shadow-card hover:shadow-card-hover rounded-2xl py-2 px-4',
    !isSpecialMessage && data.image && 'rounded-lg p-0 shadow-card hover:shadow-card-hover',
    // Background colors only for regular text messages  
    !isSpecialMessage && !data.image && isAnonymous && isOwn && 'bg-zinc-800 text-zinc-200',
    !isSpecialMessage && !data.image && isAnonymous && !isOwn && 'bg-zinc-900 text-zinc-300', 
    !isSpecialMessage && !data.image && !isAnonymous && isOwn && 'bg-primary text-primary-foreground',
    !isSpecialMessage && !data.image && !isAnonymous && !isOwn && 'bg-secondary text-secondary-foreground',
    // Optimistic messages
    isOptimistic && 'opacity-75'
  );

  // Debug logging
  console.log('Message Debug:', {
    messageId: data.id || (data as any).tempId,
    messageType,
    body: data.body,
    isVideoCall,
    isMarketplaceMessage,
    isSpecialMessage,
    appliedClasses: message
  });

  const actionButtons = clsx(
    'absolute flex items-center gap-1',
    isOwn ? '-translate-x-full left-0' : 'translate-x-full right-0',
    'top-1/2 -translate-y-1/2 mx-2',
    'bg-white/90 backdrop-blur-sm shadow-lg rounded-full p-1.5',
    'transition-all duration-200 ease-in-out',
    showActions ? 'opacity-100 visible' : 'opacity-0 invisible'
  );

  // Extract call ID from video call messages
  const getCallIdFromMessage = (messageBody: string): string | null => {
    const meetingLinkMatch = messageBody.match(/Join here: (https?:\/\/[^\s]+)/);
    if (meetingLinkMatch) {
      const link = meetingLinkMatch[1];
      const callIdMatch = link.match(/\/meeting\/([^?]+)/);
      return callIdMatch ? callIdMatch[1] : null;
    }
    return null;
  };

  const messageBody = data.body || '';
  const callId = isVideoCall ? getCallIdFromMessage(messageBody) : null;
  const { participantCount } = useCallParticipants(callId);

  // Function to render different message types with special UI
  const renderMessageContent = () => {
    // Video Call Message
    if (messageType === 'VIDEO_CALL') {
      const meetingLinkMatch = messageBody.match(/Join here: (https?:\/\/[^\s]+)/);
      const meetingLink = meetingLinkMatch ? meetingLinkMatch[1] : null;
      
      return (
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl p-4 min-w-[280px] shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-white/20 rounded-full p-2">
              <Video className="h-5 w-5" />
            </div>
            <div>
              <div className="font-semibold">Video Call Invitation</div>
              <div className="text-blue-100 text-sm">Join the meeting now</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mb-3 text-blue-100">
            <Users className="h-4 w-4" />
            <span className="text-sm">
              Participants: {participantCount} in call
              {participantCount > 0 && (
                <span className="ml-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                  Live
                </span>
              )}
            </span>
          </div>
          
          {meetingLink && (
            <div className="flex gap-2">
              <Button 
                onClick={() => window.open(meetingLink, '_blank')}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30 rounded-lg flex-1"
                size="sm"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Join Call
              </Button>
            </div>
          )}
        </div>
      );
    }
    
    // Marketplace Interest Message
    if (messageType === 'MARKETPLACE_INTEREST') {
      const productMatch = messageBody.match(/Hi, I'm interested in your product: (.+)/);
      const productTitle = productMatch ? productMatch[1] : 'Unknown Product';
      
      return (
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl p-4 min-w-[280px] shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-white/20 rounded-full p-2">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <div className="font-semibold">Product Interest</div>
              <div className="text-green-100 text-sm">Someone is interested!</div>
            </div>
          </div>
          
          <div className="bg-white/10 rounded-lg p-3 mb-3">
            <div className="text-sm text-green-100 mb-1">Product:</div>
            <div className="font-medium">{productTitle}</div>
          </div>
          
          <div className="text-green-100 text-sm">
            💚 This buyer wants to know more about your product
          </div>
        </div>
      );
    }
    
    // Default message rendering
    return (
      <span className="flex items-center gap-2">
        {messageBody}
      </span>
    );
  };

  return (
    <div ref={messageRef} className={container}>
      <div className={avatar}>
        {isAnonymous ? (
          <div className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center">
            <Image
              src="/logo_nit.png"
              alt="Anonymous"
              width={36}
              height={36}
              className="rounded-full"
            />
          </div>
                 ) : (
           data.sender ? <Avatar user={data.sender} /> : null
         )}
      </div>
      <div className={body}>
        <div className="flex items-center gap-2">
          <div className={clsx(
            'text-sm font-medium',
            isAnonymous ? 'text-zinc-500' : 'text-muted-foreground'
          )}>
            {isAnonymous 
              ? `Anonymous ${isOwn ? '(You)' : 'User'}`
              : (data.sender?.username || data.sender?.email)
            }
          </div>
          <div className={clsx(
            'text-xs',
            isAnonymous ? 'text-zinc-500' : 'text-muted-foreground'
          )}>
            {format(new Date(data.createdAt), 'p')}
          </div>
        </div>
        
        <div className="relative group">
          <div 
            onClick={() => setShowActions(!showActions)}
            className={message}
          >
            {data.image ? (
              <Image
                onClick={() => setIsImageModalOpen(true)}
                src={data.image}
                width={288}
                height={288}
                alt="image"
                className="object-cover cursor-pointer rounded-lg hover:scale-105"
              />
            ) : (
              <div className="max-w-sm break-words">
                {renderMessageContent()}
                {isOptimistic && (
                  <div className="w-2 h-2 bg-current rounded-full animate-pulse opacity-60 ml-2 inline-block" />
                )}
              </div>
            )}
          </div>

          {!isAnonymous && (
            <div className={actionButtons}>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 rounded-full hover:bg-gray-100"
                  >
                    <Info className="h-4 w-4 text-gray-600" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-72 p-3"
                  side={isOwn ? "left" : "right"}
                  align="center"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Seen by</h4>
                      <span className="text-xs text-gray-500">
                        {data.seen.length} {data.seen.length === 1 ? 'person' : 'people'}
                      </span>
                    </div>
                    <div className="max-h-48 overflow-y-auto space-y-2">
                      {data.seen.map((user) => (
                        <div key={user.id} className="flex items-center gap-2">
                          <Avatar user={user} />
                          <span className="text-sm">{user.username}</span>
                        </div>
                      ))}
                      {data.seen.length === 0 && (
                        <p className="text-sm text-gray-500">No one has seen this message yet</p>
                      )}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              {isOwn && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete();
                  }}
                  disabled={isDeleting}
                  className="h-8 w-8 p-0 rounded-full hover:bg-red-100"
                >
                  <Trash className="h-4 w-4 text-red-500" />
                </Button>
              )}
            </div>
          )}
        </div>

        {isLast && isOwn && seenList && !isAnonymous && (
          <div className={clsx('text-xs font-light',
            isAnonymous ? 'text-zinc-600' : 'text-muted-foreground'
          )}>
            Seen by {seenList}
          </div>
        )}
      </div>

      <ImageModal 
        isOpen={isImageModalOpen} 
        src={data.image} 
        onClose={() => setIsImageModalOpen(false)}
      />
    </div>
  );
};

export default MessageBox;