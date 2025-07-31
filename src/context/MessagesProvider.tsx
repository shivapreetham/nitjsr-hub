'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { FullMessageType } from '@/types';

// Type for optimistic messages that have tempId instead of id
type OptimisticMessageType = Omit<FullMessageType, 'id'> & { tempId: string };

// Union type for all message types
type MessageType = FullMessageType | OptimisticMessageType;

interface MessagesContextType {
  messages: MessageType[];
  setMessages: React.Dispatch<React.SetStateAction<MessageType[]>>;
  addOptimisticMessage: (message: OptimisticMessageType) => void;
  updateOptimisticMessage: (tempId: string, realMessage: FullMessageType) => void;
  removeOptimisticMessage: (tempId: string) => void;
}

const MessagesContext = createContext<MessagesContextType | undefined>(undefined);

export const useMessages = () => {
  const context = useContext(MessagesContext);
  if (!context) {
    throw new Error('useMessages must be used within a MessagesProvider');
  }
  return context;
};

interface MessagesProviderProps {
  children: ReactNode;
  initialMessages: FullMessageType[];
}

export const MessagesProvider: React.FC<MessagesProviderProps> = ({ 
  children, 
  initialMessages 
}) => {
  const [messages, setMessages] = useState<MessageType[]>(initialMessages);

  const addOptimisticMessage = (message: OptimisticMessageType) => {
    setMessages(prev => [...prev, message]);
  };

  const updateOptimisticMessage = (tempId: string, realMessage: FullMessageType) => {
    setMessages(prev => 
      prev.map(msg => 
        'tempId' in msg && msg.tempId === tempId ? realMessage : msg
      )
    );
  };

  const removeOptimisticMessage = (tempId: string) => {
    setMessages(prev => 
      prev.filter(msg => !('tempId' in msg) || msg.tempId !== tempId)
    );
  };

  return (
    <MessagesContext.Provider value={{
      messages,
      setMessages,
      addOptimisticMessage,
      updateOptimisticMessage,
      removeOptimisticMessage,
    }}>
      {children}
    </MessagesContext.Provider>
  );
}; 