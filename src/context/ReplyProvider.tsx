'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { FullMessageType } from '@/shared/types';

interface ReplyContextType {
  replyTo: FullMessageType | null;
  setReplyTo: (message: FullMessageType | null) => void;
}

const ReplyContext = createContext<ReplyContextType | undefined>(undefined);

export const useReply = () => {
  const context = useContext(ReplyContext);
  if (!context) {
    throw new Error('useReply must be used within a ReplyProvider');
  }
  return context;
};

interface ReplyProviderProps {
  children: ReactNode;
}

export const ReplyProvider: React.FC<ReplyProviderProps> = ({ children }) => {
  const [replyTo, setReplyTo] = useState<FullMessageType | null>(null);

  return (
    <ReplyContext.Provider value={{ replyTo, setReplyTo }}>
      {children}
    </ReplyContext.Provider>
  );
}; 