'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { FullMessageType } from '@/shared/types';

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
  addRealMessage: (message: FullMessageType) => void;
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
    setMessages(prev => {
      const updatedMessages = prev.map(msg => 
        'tempId' in msg && msg.tempId === tempId ? realMessage : msg
      );
      
      // Log for debugging
      console.log('Updating optimistic message:', { tempId, realMessageId: realMessage.id });
      
      return updatedMessages;
    });
  };

  const removeOptimisticMessage = (tempId: string) => {
    setMessages(prev => 
      prev.filter(msg => !('tempId' in msg) || msg.tempId !== tempId)
    );
  };

  const addRealMessage = (message: FullMessageType) => {
    setMessages(prev => {
      // Check if this message already exists (by ID)
      const existsById = prev.some(msg => 'id' in msg && msg.id === message.id);
      if (existsById) {
        console.log('Message already exists, skipping:', message.id);
        return prev;
      }

      // Check if this message should replace an optimistic message
      // Use a more robust matching strategy
      const optimisticIndex = prev.findIndex(msg => {
        if (!('tempId' in msg)) return false;
        
        // Match by content and sender
        const senderMatch = (
          (msg.senderId && msg.senderId === message.senderId) || 
          (msg.sender?.id && msg.sender.id === message.sender?.id)
        );
        
        const contentMatch = msg.body === message.body;
        
        // If it's a file message, also check file URL
        const fileMatch = !message.fileUrl || msg.fileUrl === message.fileUrl;
        
        return senderMatch && contentMatch && fileMatch;
      });

      if (optimisticIndex !== -1) {
        console.log('Replacing optimistic message with real message:', message.id);
        const updated = [...prev];
        updated[optimisticIndex] = message;
        return updated;
      }

      // Check for potential duplicates based on timestamp and sender (within 5 seconds)
      const now = new Date(message.createdAt).getTime();
      const potentialDuplicate = prev.find(msg => {
        if (!('id' in msg)) return false;
        
        const msgTime = new Date(msg.createdAt).getTime();
        const timeDiff = Math.abs(now - msgTime);
        
        return (
          timeDiff < 5000 && // Within 5 seconds
          msg.body === message.body &&
          msg.sender?.id === message.sender?.id
        );
      });

      if (potentialDuplicate) {
        console.log('Potential duplicate detected, skipping:', message.id);
        return prev;
      }

      // Add as new message
      console.log('Adding new real message:', message.id);
      return [...prev, message];
    });
  };

  return (
    <MessagesContext.Provider value={{
      messages,
      setMessages,
      addOptimisticMessage,
      updateOptimisticMessage,
      removeOptimisticMessage,
      addRealMessage,
    }}>
      {children}
    </MessagesContext.Provider>
  );
}; 