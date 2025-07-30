'use client';

import { ReactNode, useEffect, useState } from 'react';
import { StreamVideoClient, StreamVideo } from '@stream-io/video-react-sdk';
import { useCurrentUserContext } from '@/context/CurrentUserProvider';

import { tokenProvider } from '@/app/actions/stream.actions';
import Loader from '@/app/(app)/videoChat/components/Loader';

const API_KEY = process.env.NEXT_PUBLIC_STREAM_API_KEY;

const StreamVideoProvider = ({ children }: { children: ReactNode }) => {
  const [videoClient, setVideoClient] = useState<StreamVideoClient | null>(null);
  const { currentUser } = useCurrentUserContext();

  useEffect(() => {
    if (!currentUser || !API_KEY) return;

    const client = new StreamVideoClient({
      apiKey: API_KEY,
      user: { 
        id: currentUser.id, 
        name: currentUser.username || currentUser.id, 
        image: currentUser.image || '' 
      },
      tokenProvider,
    });

    setVideoClient(client);

    // Cleanup function
    return () => {
      client.disconnectUser();
    };
  }, [currentUser]);

  if (!currentUser) {
    return <div className="flex items-center justify-center min-h-screen">
      <p className="text-gray-600">Please log in to access video chat.</p>
    </div>;
  }

  if (!API_KEY) {
    return <div className="flex items-center justify-center min-h-screen">
      <p className="text-red-500">Stream API key is missing. Please check your configuration.</p>
    </div>;
  }

  if (!videoClient) {
    return <Loader />;
  }

  return <StreamVideo client={videoClient}>{children}</StreamVideo>;
};

export default StreamVideoProvider;
