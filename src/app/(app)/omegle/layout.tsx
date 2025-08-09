import React from 'react';
import { SocketProvider } from '@/context/SocketProvider';
export default function OmegleLayout({ children }: { children: React.ReactNode }) {
  return (
    <SocketProvider>
    <div className="flex flex-col h-full w-full bg-background">
      {children}
    </div>
    </SocketProvider>
  );
}
