import { ReactNode } from 'react';
import StreamVideoProvider from '@/core/lib/context/StreamClientProvider';

export default async function VideoChatLayout({ children }: { children: ReactNode }) {
  return (
    <StreamVideoProvider>
      {children}
    </StreamVideoProvider>
  );
}
