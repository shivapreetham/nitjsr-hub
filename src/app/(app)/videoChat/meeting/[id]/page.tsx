'use client';

import { useState } from 'react';
import { StreamCall, StreamTheme } from '@stream-io/video-react-sdk';
import { useParams } from 'next/navigation';
import { Loader } from 'lucide-react';
import { motion } from 'framer-motion';

import { useGetCallById } from '@/app/hooks/useGetCallById';
import Alert from '@/components/videoChat/Alert';
import { useCurrentUserContext } from '@/context/CurrentUserProvider';
import MeetingSetup from '@/components/videoChat/MeetingSetup';
import MeetingRoom from '@/components/videoChat/MeetingRoom';

const MeetingPage = () => {
  const { id } = useParams();
  const meetingId = id as string;
  const { call, isCallLoading } = useGetCallById(meetingId);
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  
  const { currentUser } = useCurrentUserContext();
  const isUserLoading = !currentUser;

  const bubbleVariants = {
    initial: { scale: 0, opacity: 0 },
    animate: { scale: 1, opacity: 0.1 },
    exit: { scale: 0, opacity: 0 }
  };

  if (!meetingId || isUserLoading || isCallLoading) return (
    <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-white to-blue-50">
      <motion.div 
        initial={{ rotate: 0 }}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      >
        <Loader className="h-12 w-12 text-blue-500" />
      </motion.div>
    </div>
  );

  if (!call) return (
    <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-white to-blue-50">
      <p className="text-center text-3xl font-bold text-black backdrop-blur-md bg-white/30 p-6 rounded-2xl shadow-lg">
        Call Not Found
      </p>
    </div>
  );

  const notAllowed = call.type === 'invited' && (!currentUser || !call.state.members.find(m => m.user.id === currentUser.id));

  if (notAllowed) return <Alert title="You are not allowed to join this meeting" />;

  return (
    <main className="h-screen w-full bg-gradient-to-br from-white to-blue-50 relative">
      {/* Animated background bubbles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-blue-400"
            style={{
              width: Math.random() * 300 + 50,
              height: Math.random() * 300 + 50,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`
            }}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={bubbleVariants}
            transition={{
              duration: Math.random() * 4 + 3,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
        ))}
      </div>
      
      {/* Content container with scrolling */}
      <div className="relative h-full w-full overflow-auto">
        {/* Wrapper for better visibility */}
        <div className="bg-white p-4 rounded-lg shadow mx-auto max-w-4xl mt-4">
          <StreamCall call={call}>
            <StreamTheme>
              {!isSetupComplete ? 
                <MeetingSetup setIsSetupComplete={setIsSetupComplete} /> : 
                <MeetingRoom />
              }
            </StreamTheme>
          </StreamCall>
        </div>
      </div>
    </main>
  );
};

export default MeetingPage;