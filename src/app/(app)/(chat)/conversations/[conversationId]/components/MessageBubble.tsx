'use client';

import React, { useState } from 'react';
import { format } from 'date-fns';
import { MessageCircle, Smile, MoreHorizontal, Reply, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { FullMessageType, ReactionType } from '@/shared/types';
import Image from 'next/image';
import clsx from 'clsx';

interface MessageBubbleProps {
  message: FullMessageType;
  isOwn: boolean;
  isLast: boolean;
  onReply: (message: FullMessageType) => void;
  onDelete?: (messageId: string) => Promise<void>;
  onReaction: (messageId: string, emoji: string) => Promise<void>;
}

const REACTION_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '😡'];

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwn,
  isLast,
  onReply,
  onDelete,
  onReaction,
}) => {
  const [showReactions, setShowReactions] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (isDeleting || !onDelete) return;
    try {
      setIsDeleting(true);
      await onDelete(message.id);
    } catch (error) {
      console.error('Error deleting message:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Group reactions by emoji
  const groupedReactions = message.reactions?.reduce((acc, reaction) => {
    if (!acc[reaction.emoji]) {
      acc[reaction.emoji] = [];
    }
    acc[reaction.emoji].push(reaction);
    return acc;
  }, {} as Record<string, ReactionType[]>) || {};

  return (
    <div className={clsx(
      'group relative flex w-full',
      isOwn ? 'justify-end' : 'justify-start'
    )}>
             <div className={clsx(
         'relative max-w-[70%] min-w-[120px]',
         Object.keys(groupedReactions).length > 0 ? 'mb-8' : 'mb-2',
         isOwn ? 'order-2' : 'order-1'
       )}>
        {/* Reply Preview */}
                 {message.replyTo && (
           <div className={clsx(
             'mb-1 px-3 py-1 rounded-lg text-xs opacity-70',
             isOwn 
               ? 'bg-[#dcf8c6]/50 text-gray-700' 
               : 'bg-gray-100 text-gray-700'
           )}>
                         <div className="font-medium font-['Inter'] text-xs">
               {message.replyTo.sender?.username || 'Unknown'}
             </div>
             <div className="truncate font-['Inter'] text-xs">
               {message.replyTo.body || 'Image'}
             </div>
          </div>
        )}

        {/* Message Content */}
                 <div className={clsx(
           'relative rounded-2xl px-4 py-2 shadow-sm',
           'transition-all duration-200',
           isOwn
             ? 'bg-[#dcf8c6] text-gray-800 rounded-br-md' // WhatsApp green for own messages
             : 'bg-white text-gray-800 rounded-bl-md', // White for others' messages
           message.image && 'p-1'
         )}>
          {/* Message Body */}
          {message.image ? (
            <Image
              src={message.image}
              alt="Message attachment"
              width={200}
              height={200}
              className="rounded-lg object-cover cursor-pointer hover:scale-105 transition-transform"
            />
                     ) : (
             <div className="break-words whitespace-pre-wrap font-['Inter'] text-sm leading-relaxed">
               {message.body}
             </div>
           )}

          {/* Message Footer */}
                     <div className={clsx(
             'flex items-center justify-end gap-1 mt-1 text-xs opacity-70',
             isOwn ? 'text-gray-600' : 'text-gray-500'
           )}>
            <span>{format(new Date(message.createdAt), 'HH:mm')}</span>
            {isOwn && (
              <div className="flex items-center">
                {message.seen.length > 0 ? (
                  <span className="text-blue-400">✓✓</span>
                ) : (
                  <span>✓</span>
                )}
              </div>
            )}
          </div>

                     {/* Reactions */}
           {Object.keys(groupedReactions).length > 0 && (
             <div className={clsx(
               'absolute -bottom-8 flex gap-1 z-20',
               isOwn ? 'right-0' : 'left-0'
             )}>
               {Object.entries(groupedReactions).map(([emoji, reactions]) => (
                 <div
                   key={emoji}
                   className="bg-white shadow-lg rounded-full px-2 py-1 text-xs border border-gray-200 hover:shadow-xl transition-shadow"
                   title={`${reactions.map(r => r.user.username).join(', ')}`}
                 >
                   <span className="mr-1">{emoji}</span>
                   <span className="text-gray-700 font-medium">{reactions.length}</span>
                 </div>
               ))}
             </div>
           )}
        </div>

        {/* Action Buttons */}
        <div className={clsx(
          'absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200',
          'flex items-center gap-1 bg-background/90 backdrop-blur-sm rounded-full p-1 shadow-lg',
          isOwn ? '-left-16' : '-right-16'
        )}>
          {/* Reply Button */}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 rounded-full hover:bg-muted"
            onClick={() => onReply(message)}
            title="Reply"
          >
            <Reply className="h-4 w-4" />
          </Button>

          {/* Reactions Button */}
          <Popover open={showReactions} onOpenChange={setShowReactions}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded-full hover:bg-muted"
                title="React"
              >
                <Smile className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto p-2"
              side={isOwn ? "left" : "right"}
              align="center"
            >
              <div className="flex gap-1">
                {REACTION_EMOJIS.map((emoji) => (
                  <Button
                    key={emoji}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-lg hover:bg-muted rounded-full"
                    onClick={() => {
                      onReaction(message.id, emoji);
                      setShowReactions(false);
                    }}
                  >
                    {emoji}
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* More Options */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded-full hover:bg-muted"
                title="More options"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-48 p-2"
              side={isOwn ? "left" : "right"}
              align="center"
            >
              <div className="space-y-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => onReply(message)}
                >
                  <Reply className="h-4 w-4 mr-2" />
                  Reply
                </Button>
                {isOwn && onDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-destructive hover:text-destructive"
                    onClick={handleDelete}
                    disabled={isDeleting}
                  >
                    <Trash className="h-4 w-4 mr-2" />
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </Button>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble; 