'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import TheOneLoader from '@/components/shared/TheOneLoader';

interface LoadingContextType {
  isLoading: boolean;
  message?: string;
  showLoading: (message?: string) => void;
  hideLoading: () => void;
  withLoading: <T>(
    asyncFn: () => Promise<T>, 
    loadingMessage?: string
  ) => Promise<T>;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

// This is the ONLY loading hook you should use
export const useUnifiedLoading = useLoading;

interface LoadingProviderProps {
  children: React.ReactNode;
}

export function LoadingProvider({ children }: LoadingProviderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string>();

  const showLoading = useCallback((msg?: string) => {
    setMessage(msg);
    setIsLoading(true);
  }, []);

  const hideLoading = useCallback(() => {
    setIsLoading(false);
    setMessage(undefined);
  }, []);

  const withLoading = useCallback(
    <T,>(asyncFn: () => Promise<T>, loadingMessage?: string): Promise<T> => {
      const executeAsync = async (): Promise<T> => {
        try {
          showLoading(loadingMessage);
          const result = await asyncFn();
          return result;
        } finally {
          hideLoading();
        }
      };
      return executeAsync();
    },
    [showLoading, hideLoading]
  );

  return (
    <LoadingContext.Provider value={{ isLoading, message, showLoading, hideLoading, withLoading }}>
      {children}
      <TheOneLoader 
        show={isLoading} 
        message={message} 
        overlay={true}
      />
    </LoadingContext.Provider>
  );
}