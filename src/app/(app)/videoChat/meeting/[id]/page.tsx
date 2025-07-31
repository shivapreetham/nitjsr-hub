'use client';

import { useState, useEffect } from 'react';
import { StreamCall, StreamTheme, useStreamVideoClient } from '@stream-io/video-react-sdk';
import { useParams } from 'next/navigation';
import { Loader } from 'lucide-react';

import { useGetCallById } from '@/app/hooks/useGetCallById';
import Alert from '@//app/(app)/videoChat/components/Alert';
import { useCurrentUserContext } from '@/context/CurrentUserProvider';
import MeetingSetup from '@/app/(app)/videoChat/components/MeetingSetup';
import MeetingRoom from '@/app/(app)/videoChat/components/MeetingRoom';

const MeetingPage = () => {
  const { id } = useParams();
  const meetingId = id as string;
  const { call, isCallLoading } = useGetCallById(meetingId);
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  
  const { currentUser } = useCurrentUserContext();
  const client = useStreamVideoClient();
  const isUserLoading = !currentUser;

  // Debug logging
  useEffect(() => {
    console.log('MeetingPage Debug:', {
      meetingId,
      hasClient: !!client,
      hasCurrentUser: !!currentUser,
      hasCall: !!call,
      isCallLoading,
      isUserLoading
    });
  }, [meetingId, client, currentUser, call, isCallLoading, isUserLoading]);

  if (!meetingId || isUserLoading || isCallLoading) return (
    <div className="h-screen w-full flex items-center justify-center bg-black">
      <div className="text-center">
        <Loader className="h-12 w-12 text-white mx-auto mb-4 animate-spin" />
        <p className="text-white">Loading meeting...</p>
        <p className="text-gray-400 text-sm mt-2">
          {!meetingId && 'No meeting ID'}
          {isUserLoading && 'Loading user...'}
          {isCallLoading && 'Loading call...'}
        </p>
      </div>
    </div>
  );

  if (!call) return (
    <div className="h-screen w-full flex items-center justify-center bg-black">
      <div className="text-center">
        <p className="text-white text-xl">Call Not Found</p>
        <p className="text-gray-400 mt-2">The meeting you're looking for doesn't exist.</p>
        <p className="text-gray-500 text-sm mt-4">Meeting ID: {meetingId}</p>
      </div>
    </div>
  );

  const notAllowed = call.type === 'invited' && (!currentUser || !call.state.members.find(m => m.user.id === currentUser.id));

  if (notAllowed) return <Alert title="You are not allowed to join this meeting" />;

  return (
    <div className="h-screen w-full bg-black">
      <StreamCall call={call}>
        <StreamTheme>
          {!isSetupComplete ? 
            <MeetingSetup setIsSetupComplete={setIsSetupComplete} /> : 
            <MeetingRoom />
          }
        </StreamTheme>
      </StreamCall>
    </div>
  );
};

export default MeetingPage;