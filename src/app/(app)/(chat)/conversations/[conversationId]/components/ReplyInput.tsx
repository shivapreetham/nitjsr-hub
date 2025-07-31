'use client';

import React from 'react';
import { X, Reply } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FullMessageType } from '@/types';
import Image from 'next/image';

interface ReplyInputProps {
  replyTo: FullMessageType | null;
  onCancelReply: () => void;
}

const ReplyInput: React.FC<ReplyInputProps> = ({ replyTo, onCancelReply }) => {
  if (!replyTo) return null;

  return (
    <div className="flex items-center gap-2 p-3 bg-muted/50 border-b border-border">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <Reply className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        <div className="flex-1 min-w-0">
                     <div className="text-sm font-medium text-foreground font-['Inter']">
             Replying to {replyTo.sender?.username || 'Unknown'}
           </div>
           <div className="text-xs text-muted-foreground truncate font-['Inter']">
             {replyTo.image ? 'Image' : replyTo.body}
           </div>
        </div>
      </div>
      
      {replyTo.image && (
        <div className="w-8 h-8 rounded overflow-hidden flex-shrink-0">
          <Image
            src={replyTo.image}
            alt="Reply preview"
            width={32}
            height={32}
            className="object-cover w-full h-full"
          />
        </div>
      )}
      
      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0 rounded-full hover:bg-muted"
        onClick={onCancelReply}
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
};

export default ReplyInput; 