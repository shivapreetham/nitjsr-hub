'use client';
import { useState } from 'react';
import {
  CallControls,
  CallParticipantsList,
  CallStatsButton,
  CallingState,
  PaginatedGridLayout,
  SpeakerLayout,
  useCallStateHooks,
  VideoPreview,
  useCall,
} from '@stream-io/video-react-sdk';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Users, 
  LayoutGrid, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Phone, 
  PhoneOff,
  Settings,
  MessageSquare,
  Share,
  MoreHorizontal
} from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Loader from './Loader';
import EndCallButton from './EndCallButton';
import { cn } from '@/lib/utils';

type CallLayoutType = 'grid' | 'speaker-left' | 'speaker-right';

const MeetingRoom = () => {
  const searchParams = useSearchParams();
  const isPersonalRoom = !!searchParams.get('personal');
  const router = useRouter();
  const [layout, setLayout] = useState<CallLayoutType>('speaker-left');
  const [showParticipants, setShowParticipants] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const { useCallCallingState } = useCallStateHooks();
  const call = useCall();

  const callingState = useCallCallingState();

  if (callingState !== CallingState.JOINED) return <Loader />;

  const toggleMic = () => {
    if (call) {
      if (isMicOn) {
        call.microphone.disable();
      } else {
        call.microphone.enable();
      }
      setIsMicOn(!isMicOn);
    }
  };

  const toggleVideo = () => {
    if (call) {
      if (isVideoOn) {
        call.camera.disable();
      } else {
        call.camera.enable();
      }
      setIsVideoOn(!isVideoOn);
    }
  };

  const CallLayout = () => {
    switch (layout) {
      case 'grid':
        return <PaginatedGridLayout />;
      case 'speaker-right':
        return <SpeakerLayout participantsBarPosition="left" />;
      default:
        return <SpeakerLayout participantsBarPosition="right" />;
    }
  };

  return (
    <div className="relative h-screen w-full bg-gray-900 overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-4">
            <h1 className="text-white font-medium">Meeting</h1>
            <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
              Live
            </Badge>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/10"
              onClick={() => setShowParticipants(!showParticipants)}
            >
              <Users size={18} />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/10"
              onClick={() => setShowChat(!showChat)}
            >
              <MessageSquare size={18} />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/10"
            >
              <Share size={18} />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                  <MoreHorizontal size={18} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-gray-800 border-gray-700 text-white">
                <DropdownMenuItem className="hover:bg-gray-700">
                  <Settings size={16} className="mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-700" />
                <DropdownMenuItem className="hover:bg-gray-700">
                  <CallStatsButton />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-full pt-16">
        {/* Video Area */}
        <div className="flex-1 relative">
          <div className="h-full flex items-center justify-center">
            <div className="w-full max-w-7xl">
              <CallLayout />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        {(showParticipants || showChat) && (
          <div className="w-80 bg-gray-800 border-l border-gray-700">
            {showParticipants && (
              <div className="h-full">
                <div className="p-4 border-b border-gray-700">
                  <h3 className="text-white font-medium">Participants</h3>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <CallParticipantsList onClose={() => setShowParticipants(false)} />
                </div>
              </div>
            )}
            
            {showChat && (
              <div className="h-full">
                <div className="p-4 border-b border-gray-700">
                  <h3 className="text-white font-medium">Chat</h3>
                </div>
                <div className="flex-1 p-4">
                  <div className="text-center text-gray-400">
                    <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
                    <p>Chat feature coming soon</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 z-10 bg-black/20 backdrop-blur-sm border-t border-white/10">
        <div className="flex items-center justify-center gap-4 p-4">
          {/* Layout Controls */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                <LayoutGrid size={20} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-gray-800 border-gray-700 text-white">
              <DropdownMenuItem 
                onClick={() => setLayout('grid')}
                className="hover:bg-gray-700"
              >
                Grid View
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setLayout('speaker-left')}
                className="hover:bg-gray-700"
              >
                Speaker Left
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setLayout('speaker-right')}
                className="hover:bg-gray-700"
              >
                Speaker Right
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Main Controls */}
          <Button
            variant="ghost"
            size="lg"
            className={cn(
              "rounded-full w-12 h-12",
              isMicOn 
                ? "text-white hover:bg-white/10" 
                : "bg-red-500 text-white hover:bg-red-600"
            )}
            onClick={toggleMic}
          >
            {isMicOn ? <Mic size={20} /> : <MicOff size={20} />}
          </Button>

          <Button
            variant="ghost"
            size="lg"
            className={cn(
              "rounded-full w-12 h-12",
              isVideoOn 
                ? "text-white hover:bg-white/10" 
                : "bg-red-500 text-white hover:bg-red-600"
            )}
            onClick={toggleVideo}
          >
            {isVideoOn ? <Video size={20} /> : <VideoOff size={20} />}
          </Button>

          {/* End Call Button */}
          <Button
            variant="destructive"
            size="lg"
            className="rounded-full w-12 h-12 bg-red-500 hover:bg-red-600"
            onClick={() => router.push('/videoChat')}
          >
            <PhoneOff size={20} />
          </Button>

          {!isPersonalRoom && <EndCallButton />}
        </div>
      </div>
    </div>
  );
};

export default MeetingRoom;
