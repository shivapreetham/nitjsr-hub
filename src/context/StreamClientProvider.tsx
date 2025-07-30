'use client';

import { ReactNode, useEffect, useState } from 'react';
import { StreamVideoClient, StreamVideo } from '@stream-io/video-react-sdk';
import { useCurrentUserContext } from '@/context/CurrentUserProvider';

import { tokenProvider } from '@/app/actions/stream.actions';
import Loader from '@/app/(app)/videoChat/components/Loader';

const API_KEY = process.env.NEXT_PUBLIC_STREAM_API_KEY;

const StreamVideoProvider = ({ children }: { children: ReactNode }) => {
  const [videoClient, setVideoClient] = useState<StreamVideoClient>();
  const { currentUser } = useCurrentUserContext();

  useEffect(() => {
    if (!currentUser) return;
    if (!API_KEY) throw new Error('Stream API key is missing');

    const client = new StreamVideoClient({
      apiKey: API_KEY,
      user: { id: currentUser.id, name: currentUser.username || currentUser.id, image: currentUser.image || '' },
      tokenProvider,
    });

    setVideoClient(client);
  }, [currentUser]);

  if (!videoClient) return <Loader />;

  return <StreamVideo client={videoClient}>{children}</StreamVideo>;
};

export default StreamVideoProvider;
