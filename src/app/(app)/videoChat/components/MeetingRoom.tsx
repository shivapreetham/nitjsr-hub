'use client';
import { useState, useEffect } from 'react';
import {
  CallStatsButton,
  CallingState,
  PaginatedGridLayout,
  SpeakerLayout,
  useCallStateHooks,
  useCall,
  StreamVideoParticipant,
} from '@stream-io/video-react-sdk';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Users, 
  LayoutGrid, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
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
  Grid3X3,
  Users2,
  Maximize
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
import { cn } from '@/app/lib/utils';

type CallLayoutType = 'grid' | 'speaker-left' | 'speaker-right' | 'speaker-bottom';
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
  
  const { 
    useCallCallingState, 
    useParticipants, 
    useHasOngoingScreenShare,
    useMicrophoneState,
    useCameraState,
    useScreenShareState
  } = useCallStateHooks();
  
  const call = useCall();
  const participants = useParticipants();
  const hasOngoingScreenShare = useHasOngoingScreenShare();
  const callingState = useCallCallingState();

  // Get call state for mic/video using proper hooks
  const { microphone, isMute } = useMicrophoneState();
  const { camera, isMute: isVideoMuted } = useCameraState();
  const { screenShare } = useScreenShareState();

  // Meeting timer
  useEffect(() => {
    if (callingState === CallingState.JOINED) {
      const interval = setInterval(() => {
        setMeetingTime(prev => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [callingState]);

  // Auto switch to speaker view when screen sharing starts
  useEffect(() => {
    if (hasOngoingScreenShare && layout === 'grid') {
      setLayout('speaker-left');
    }
  }, [hasOngoingScreenShare, layout]);

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

  const toggleMic = async () => {
    try {
      await microphone.toggle();
    } catch (error) {
      console.error('Error toggling microphone:', error);
    }
  };

  const toggleVideo = async () => {
    try {
      await camera.toggle();
    } catch (error) {
      console.error('Error toggling camera:', error);
    }
  };

  const toggleScreenShare = async () => {
    try {
      await screenShare.toggle();
    } catch (error) {
      console.error('Error toggling screen share:', error);
    }
  };

  const toggleHandRaise = () => {
    setIsHandRaised(!isHandRaised);
    // You can implement custom hand raise logic here
    // call?.sendCustomEvent({ type: 'hand-raised', raised: !isHandRaised });
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

  // Custom Video Placeholder Component
  const VideoPlaceholder = ({ participant }: { participant: StreamVideoParticipant }) => (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center h-full relative border border-gray-700/50">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
          <span className="text-white font-bold text-lg">
            {participant.name ? participant.name.charAt(0).toUpperCase() : 'U'}
          </span>
        </div>
        <p className="text-white text-sm font-medium">{participant.name || 'Unknown User'}</p>
        <div className="flex items-center justify-center gap-2 mt-2">
          {!participant.publishedTracks.includes('audioTrack') && (
            <div className="bg-red-500/80 p-1 rounded-full">
              <MicOff size={10} className="text-white" />
            </div>
          )}
          {!participant.publishedTracks.includes('videoTrack') && (
            <div className="bg-red-500/80 p-1 rounded-full">
              <VideoOff size={10} className="text-white" />
            </div>
          )}
        </div>
      </div>
      {participant.isDominantSpeaker && (
        <div className="absolute top-2 left-2 bg-green-500/90 px-2 py-1 rounded-full text-xs text-white font-medium">
          Speaking
        </div>
      )}
    </div>
  );

  // Custom layout rendering with proper Stream.io integration
  const renderLayout = () => {
    const commonProps = {
      VideoPlaceholder,
    };

    switch (layout) {
      case 'grid':
        return (
          <div className="h-full w-full">
            <PaginatedGridLayout 
              {...commonProps}
              groupSize={9}
            />
          </div>
        );
      case 'speaker-right':
        return (
          <div className="h-full w-full">
            <SpeakerLayout 
              {...commonProps}
              participantsBarPosition="left"
              participantsBarLimit={6}
            />
          </div>
        );
      case 'speaker-bottom':
        return (
          <div className="h-full w-full">
            <SpeakerLayout 
              {...commonProps}
              participantsBarPosition="bottom"
              participantsBarLimit={8}
            />
          </div>
        );
      default: // speaker-left
        return (
          <div className="h-full w-full">
            <SpeakerLayout 
              {...commonProps}
              participantsBarPosition="right"
              participantsBarLimit={6}
            />
          </div>
        );
    }
  };

  // Get participants count
  const participantsCount = participants?.length || 1;

  return (
    <TooltipProvider>
      <div className="relative h-screen w-full bg-gradient-to-br from-gray-900 via-black to-gray-800 overflow-hidden">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-30 bg-gradient-to-b from-black/80 via-black/40 to-transparent backdrop-blur-md border-b border-white/10">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75"></div>
                </div>
                <h1 className="text-white font-semibold text-lg">Meeting Room</h1>
                <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/50 font-medium">
                  Live
                </Badge>
                {hasOngoingScreenShare && (
                  <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-500/50 font-medium">
                    Screen Sharing
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-white/80 text-sm bg-black/20 px-3 py-1 rounded-full">
                <Clock size={14} />
                <span className="font-mono">{formatTime(meetingTime)}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "text-white hover:bg-white/20 rounded-full w-10 h-10 transition-all duration-200",
                      showParticipants && "bg-white/20"
                    )}
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
                    className={cn(
                      "text-white hover:bg-white/20 rounded-full w-10 h-10 transition-all duration-200",
                      showChat && "bg-white/20"
                    )}
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
                    className="text-white hover:bg-white/20 rounded-full w-10 h-10 transition-all duration-200"
                  >
                    <Share size={18} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Share meeting link</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20 rounded-full w-10 h-10 transition-all duration-200"
                    onClick={toggleFullscreen}
                  >
                    {viewMode === 'normal' ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{viewMode === 'normal' ? 'Enter fullscreen' : 'Exit fullscreen'}</TooltipContent>
              </Tooltip>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 rounded-full w-10 h-10 transition-all duration-200">
                    <MoreHorizontal size={18} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-gray-900/95 backdrop-blur-md border-gray-700 text-white">
                  <DropdownMenuItem className="hover:bg-gray-800 focus:bg-gray-800">
                    <Settings size={16} className="mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-700" />
                  <DropdownMenuItem className="hover:bg-gray-800 focus:bg-gray-800">
                    <CallStatsButton />
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex h-full pt-20 pb-24">
          {/* Video Area */}
          <div className="flex-1 relative p-4">
            <div className="h-full w-full rounded-xl overflow-hidden bg-gray-800/20 backdrop-blur-sm border border-white/10">
              {renderLayout()}
            </div>
          </div>

          {/* Sidebar */}
          {(showParticipants || showChat) && (
            <div className="w-80 bg-gray-900/95 backdrop-blur-md border-l border-white/20 p-4">
              {showParticipants && (
                <div className="h-full flex flex-col">
                  <div className="pb-4 border-b border-white/20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users size={20} className="text-white" />
                      <h3 className="text-white font-semibold">Participants</h3>
                      <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-500/50 text-xs font-medium">
                        {participantsCount}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/20 rounded-full w-8 h-8"
                      onClick={() => setShowParticipants(false)}
                    >
                      <X size={16} />
                    </Button>
                  </div>
                  <div className="flex-1 overflow-y-auto py-4">
                    <div className="space-y-3">
                      {participants?.map((participant) => (
                        <div
                          key={participant.sessionId}
                          className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-xl border border-gray-700/50 hover:bg-gray-800/70 transition-all duration-200"
                        >
                          <div className="relative">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                              <span className="text-white font-semibold text-sm">
                                {participant.name ? participant.name.charAt(0).toUpperCase() : 'U'}
                              </span>
                            </div>
                            {participant.isLocalParticipant && (
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900 shadow-sm"></div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-white font-medium text-sm truncate">
                                {participant.name || 'Unknown User'}
                              </span>
                              {participant.isLocalParticipant && (
                                <span className="text-xs text-gray-400 font-medium">(You)</span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 mt-2">
                              <div className={cn(
                                "flex items-center gap-1 text-xs px-2 py-1 rounded-full",
                                participant.publishedTracks.includes('audioTrack') ? "text-green-400 bg-green-500/10" : "text-red-400 bg-red-500/10"
                              )}>
                                {participant.publishedTracks.includes('audioTrack') ? <MicIcon size={10} /> : <MicOff size={10} />}
                                <span>{participant.publishedTracks.includes('audioTrack') ? 'Unmuted' : 'Muted'}</span>
                              </div>
                              <div className={cn(
                                "flex items-center gap-1 text-xs px-2 py-1 rounded-full",
                                participant.publishedTracks.includes('videoTrack') ? "text-green-400 bg-green-500/10" : "text-red-400 bg-red-500/10"
                              )}>
                                {participant.publishedTracks.includes('videoTrack') ? <VideoIcon size={10} /> : <VideoOff size={10} />}
                                <span>{participant.publishedTracks.includes('videoTrack') ? 'Video On' : 'Video Off'}</span>
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
                  <div className="pb-4 border-b border-white/20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquare size={20} className="text-white" />
                      <h3 className="text-white font-semibold">Chat</h3>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/20 rounded-full w-8 h-8"
                      onClick={() => setShowChat(false)}
                    >
                      <X size={16} />
                    </Button>
                  </div>
                  <div className="flex-1 py-4 flex items-center justify-center">
                    <div className="text-center text-gray-400">
                      <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
                      <p className="font-medium">Chat feature coming soon</p>
                      <p className="text-sm mt-1">Stay tuned for updates</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-black/80 via-black/40 to-transparent backdrop-blur-md border-t border-white/10">
          <div className="flex items-center justify-center gap-2 p-6">
            {/* Layout Controls */}
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="lg" className="text-white hover:bg-white/20 rounded-full w-12 h-12 transition-all duration-200">
                      <LayoutGrid size={20} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-gray-900/95 backdrop-blur-md border-gray-700 text-white">
                    <DropdownMenuItem 
                      onClick={() => setLayout('grid')}
                      className="hover:bg-gray-800 focus:bg-gray-800"
                    >
                      <Grid3X3 size={16} className="mr-2" />
                      Grid View
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setLayout('speaker-left')}
                      className="hover:bg-gray-800 focus:bg-gray-800"
                    >
                      <Users2 size={16} className="mr-2" />
                      Speaker Left
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setLayout('speaker-right')}
                      className="hover:bg-gray-800 focus:bg-gray-800"
                    >
                      <Users2 size={16} className="mr-2" />
                      Speaker Right
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setLayout('speaker-bottom')}
                      className="hover:bg-gray-800 focus:bg-gray-800"
                    >
                      <Maximize size={16} className="mr-2" />
                      Speaker Bottom
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TooltipTrigger>
              <TooltipContent>Change layout</TooltipContent>
            </Tooltip>

            {/* Main Controls */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="lg"
                  className={cn(
                    "rounded-full w-14 h-14 transition-all duration-200 shadow-lg",
                    !isMute 
                      ? "text-white hover:bg-white/20 ring-2 ring-white/20" 
                      : "bg-red-500/90 text-white hover:bg-red-600 ring-2 ring-red-400/50"
                  )}
                  onClick={toggleMic}
                >
                  {!isMute ? <Mic size={24} /> : <MicOff size={24} />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{!isMute ? 'Mute microphone' : 'Unmute microphone'}</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="lg"
                  className={cn(
                    "rounded-full w-14 h-14 transition-all duration-200 shadow-lg",
                    !isVideoMuted 
                      ? "text-white hover:bg-white/20 ring-2 ring-white/20" 
                      : "bg-red-500/90 text-white hover:bg-red-600 ring-2 ring-red-400/50"
                  )}
                  onClick={toggleVideo}
                >
                  {!isVideoMuted ? <Video size={24} /> : <VideoOff size={24} />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{!isVideoMuted ? 'Turn off camera' : 'Turn on camera'}</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="lg"
                  className={cn(
                    "rounded-full w-14 h-14 transition-all duration-200 shadow-lg",
                    hasOngoingScreenShare 
                      ? "bg-blue-500/90 text-white hover:bg-blue-600 ring-2 ring-blue-400/50" 
                      : "text-white hover:bg-white/20 ring-2 ring-white/20"
                  )}
                  onClick={toggleScreenShare}
                >
                  {hasOngoingScreenShare ? <MonitorOff size={24} /> : <Monitor size={24} />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{hasOngoingScreenShare ? 'Stop screen share' : 'Share screen'}</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="lg"
                  className={cn(
                    "rounded-full w-14 h-14 transition-all duration-200 shadow-lg",
                    isHandRaised 
                      ? "bg-yellow-500/90 text-white hover:bg-yellow-600 ring-2 ring-yellow-400/50" 
                      : "text-white hover:bg-white/20 ring-2 ring-white/20"
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
                  className="rounded-full w-16 h-16 bg-red-500/90 hover:bg-red-600 transition-all duration-200 shadow-lg ring-2 ring-red-400/50"
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