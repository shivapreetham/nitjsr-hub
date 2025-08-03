'use client';
import { useState, useEffect } from 'react';
import {
  CallParticipantsList,
  CallStatsButton,
  CallingState,
  PaginatedGridLayout,
  SpeakerLayout,
  useCallStateHooks,
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
  MoreHorizontal,
  Maximize2,
  Minimize2,
  Monitor,
  MonitorOff,
  Hand,
  Clock,
  X,
  Mic as MicIcon,
  Video as VideoIcon,
  Crown
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import Loader from './Loader';
import EndCallButton from './EndCallButton';
import { cn } from '@/shared/lib/utils';

type CallLayoutType = 'grid' | 'speaker-left' | 'speaker-right';
type ViewMode = 'fullscreen' | 'normal';

const MeetingRoom = () => {
  const searchParams = useSearchParams();
  const isPersonalRoom = !!searchParams.get('personal');
  const router = useRouter();
  const [layout, setLayout] = useState<CallLayoutType>('speaker-left');
  const [showParticipants, setShowParticipants] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('normal');
  const [meetingTime, setMeetingTime] = useState(0);
  
  const { useCallCallingState } = useCallStateHooks();
  const call = useCall();

  const callingState = useCallCallingState();

  // Get call state for mic/video
  const { useMicrophoneState, useCameraState } = useCallStateHooks();
  const { microphone, isMute } = useMicrophoneState();
  const { camera, isEnabled: isVideoEnabled } = useCameraState();

  // Meeting timer
  useEffect(() => {
    if (callingState === CallingState.JOINED) {
      const interval = setInterval(() => {
        setMeetingTime(prev => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [callingState]);

  // Format meeting time
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  if (callingState !== CallingState.JOINED) return <Loader />;

  const toggleMic = () => {
    if (microphone) {
      microphone.toggle();
    }
  };

  const toggleVideo = () => {
    if (camera) {
      camera.toggle();
    }
  };

  const toggleHandRaise = () => {
    setIsHandRaised(!isHandRaised);
  };

  const toggleFullscreen = () => {
    if (viewMode === 'normal') {
      document.documentElement.requestFullscreen();
      setViewMode('fullscreen');
    } else {
      document.exitFullscreen();
      setViewMode('normal');
    }
  };

  // Get participants count
  const participantsCount = call?.state.participants?.length || 1;

  return (
    <TooltipProvider>
      <div className="relative h-screen w-full bg-black overflow-hidden">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/60 to-transparent backdrop-blur-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <h1 className="text-white font-medium text-lg">Meeting</h1>
                <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                  Live
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-white/70 text-sm">
                <Clock size={14} />
                <span>{formatTime(meetingTime)}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/10 rounded-full w-10 h-10"
                    onClick={() => setShowParticipants(!showParticipants)}
                  >
                    <Users size={18} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Participants ({participantsCount})</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/10 rounded-full w-10 h-10"
                    onClick={() => setShowChat(!showChat)}
                  >
                    <MessageSquare size={18} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Chat</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/10 rounded-full w-10 h-10"
                  >
                    <Share size={18} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Share</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/10 rounded-full w-10 h-10"
                    onClick={toggleFullscreen}
                  >
                    {viewMode === 'normal' ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{viewMode === 'normal' ? 'Fullscreen' : 'Exit Fullscreen'}</TooltipContent>
              </Tooltip>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 rounded-full w-10 h-10">
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
        <div className="flex h-full">
          {/* Video Area */}
          <div className="flex-1 relative">
            <div className="h-full w-full">
              {layout === 'grid' ? (
                <PaginatedGridLayout />
              ) : layout === 'speaker-right' ? (
                <SpeakerLayout participantsBarPosition="left" />
              ) : (
                <SpeakerLayout participantsBarPosition="right" />
              )}
            </div>
          </div>

          {/* Sidebar */}
          {(showParticipants || showChat) && (
            <div className="w-80 bg-gray-900/95 backdrop-blur-sm border-l border-white/10">
              {showParticipants && (
                <div className="h-full flex flex-col">
                  <div className="p-4 border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users size={20} className="text-white" />
                      <h3 className="text-white font-medium">Participants</h3>
                      <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                        {participantsCount}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/10 rounded-full w-8 h-8"
                      onClick={() => setShowParticipants(false)}
                    >
                      <X size={16} />
                    </Button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4">
                    <div className="space-y-3">
                      {call?.state.participants?.map((participant) => (
                        <div
                          key={participant.sessionId}
                          className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:bg-gray-800/70 transition-colors"
                        >
                          <div className="relative">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-medium text-sm">
                                {participant.name ? participant.name.charAt(0).toUpperCase() : 'U'}
                              </span>
                            </div>
                            {participant.isLocalParticipant && (
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900"></div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-white font-medium text-sm truncate">
                                {participant.name || 'Unknown User'}
                              </span>
                              {participant.isLocalParticipant && (
                                <span className="text-xs text-gray-400">(You)</span>
                              )}
                              {participant.roles?.includes('admin') && (
                                <Crown size={12} className="text-yellow-500" />
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <div className={cn(
                                "flex items-center gap-1 text-xs",
                                participant.audioLevel > 0 ? "text-green-400" : "text-gray-400"
                              )}>
                                {participant.audioLevel > 0 ? <MicIcon size={10} /> : <MicOff size={10} />}
                                <span>{participant.audioLevel > 0 ? 'Speaking' : 'Muted'}</span>
                              </div>
                              <div className={cn(
                                "flex items-center gap-1 text-xs",
                                participant.videoStream ? "text-green-400" : "text-gray-400"
                              )}>
                                {participant.videoStream ? <VideoIcon size={10} /> : <VideoOff size={10} />}
                                <span>{participant.videoStream ? 'Video On' : 'Video Off'}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {showChat && (
                <div className="h-full flex flex-col">
                  <div className="p-4 border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquare size={20} className="text-white" />
                      <h3 className="text-white font-medium">Chat</h3>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/10 rounded-full w-8 h-8"
                      onClick={() => setShowChat(false)}
                    >
                      <X size={16} />
                    </Button>
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
        <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/60 to-transparent backdrop-blur-sm">
          <div className="flex items-center justify-center gap-3 p-6">
            {/* Layout Controls */}
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="lg" className="text-white hover:bg-white/10 rounded-full w-12 h-12">
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
              </TooltipTrigger>
              <TooltipContent>Layout</TooltipContent>
            </Tooltip>

            {/* Main Controls */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="lg"
                  className={cn(
                    "rounded-full w-14 h-14",
                    !isMute 
                      ? "text-white hover:bg-white/10" 
                      : "bg-red-500 text-white hover:bg-red-600"
                  )}
                  onClick={toggleMic}
                >
                  {!isMute ? <Mic size={24} /> : <MicOff size={24} />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{!isMute ? 'Mute' : 'Unmute'}</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="lg"
                  className={cn(
                    "rounded-full w-14 h-14",
                    isVideoEnabled 
                      ? "text-white hover:bg-white/10" 
                      : "bg-red-500 text-white hover:bg-red-600"
                  )}
                  onClick={toggleVideo}
                >
                  {isVideoEnabled ? <Video size={24} /> : <VideoOff size={24} />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="lg"
                  className="rounded-full w-14 h-14 text-white hover:bg-white/10"
                  disabled
                >
                  <Monitor size={24} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Screen share (coming soon)</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="lg"
                  className={cn(
                    "rounded-full w-14 h-14",
                    isHandRaised 
                      ? "bg-yellow-500 text-white hover:bg-yellow-600" 
                      : "text-white hover:bg-white/10"
                  )}
                  onClick={toggleHandRaise}
                >
                  <Hand size={24} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{isHandRaised ? 'Lower hand' : 'Raise hand'}</TooltipContent>
            </Tooltip>

            {/* End Call Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="destructive"
                  size="lg"
                  className="rounded-full w-16 h-16 bg-red-500 hover:bg-red-600"
                  onClick={() => router.push('/videoChat')}
                >
                  <PhoneOff size={24} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>End call</TooltipContent>
            </Tooltip>

            {!isPersonalRoom && <EndCallButton />}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default MeetingRoom;
