import React from 'react';

export default function OmegleLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-full w-full bg-background">
      {children}
    </div>
  );
}
