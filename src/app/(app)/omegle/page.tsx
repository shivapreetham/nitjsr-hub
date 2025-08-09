"use client";

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Video, 
  SkipForward, 
  Search, 
  StopCircle, 
  Mic,
  MicOff,
  VideoOff,
  VideoIcon,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useSocket } from '@/context/SocketProvider';

export default function SocketOmeglePage() {
  const router = useRouter();
  const { socket, emit, isConnected } = useSocket();
  const [isSearching, setIsSearching] = useState(false);
  const [userCount, setUserCount] = useState(0);
  const [searchTime, setSearchTime] = useState(0);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState("Connecting...");
  const searchIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Update connection status
  useEffect(() => {
    if (isConnected) {
      setConnectionStatus("Connected");
    } else {
      setConnectionStatus("Connecting...");
    }
  }, [isConnected]);

  // Setup Socket.IO event listeners
  useEffect(() => {
    if (!socket) return;

    const handleUserCount = (data: { count: number }) => {
      setUserCount(data.count);
    };

    const handleRoomAssigned = (data: any) => {
      console.log('[MAIN] Room assigned:', data.room, 'Role:', data.role);
      setIsSearching(false);
      
      // Store room assignment in sessionStorage
      if (typeof window !== 'undefined') {
        sessionStorage.setItem("omegle_room", JSON.stringify({
          room: data.room,
          initiator: data.initiator,
          role: data.role,
          partnerId: data.partnerId,
          timestamp: Date.now()
        }));
      }
      
      console.log('[MAIN] Navigating to room:', data.room);
      router.push(`/omegle/room?roomId=${data.room}`);
    };

    const handlePartnerSkipped = () => {
      console.log('[MAIN] Partner skipped');
      setIsSearching(false);
      setConnectionStatus("Partner skipped");
    };

    const handlePartnerDisconnected = () => {
      console.log('[MAIN] Partner disconnected');
      setIsSearching(false);
      setConnectionStatus("Partner disconnected");
    };

    // Register event listeners
    socket.on('user_count', handleUserCount);
    socket.on('room_assigned', handleRoomAssigned);
    socket.on('partner_skipped', handlePartnerSkipped);
    socket.on('partner_disconnected', handlePartnerDisconnected);

    return () => {
      socket.off('user_count', handleUserCount);
      socket.off('room_assigned', handleRoomAssigned);
      socket.off('partner_skipped', handlePartnerSkipped);
      socket.off('partner_disconnected', handlePartnerDisconnected);
    };
  }, [socket, router]);

  // Update search time when searching
  useEffect(() => {
    if (isSearching) {
      // Clear any existing interval first
      if (searchIntervalRef.current) {
        clearInterval(searchIntervalRef.current);
      }
      
      const interval = setInterval(() => {
        setSearchTime(prev => prev + 1);
      }, 1000);
      
      searchIntervalRef.current = interval;
    } else {
      // Clear interval and reset time when not searching
      if (searchIntervalRef.current) {
        clearInterval(searchIntervalRef.current);
        searchIntervalRef.current = null;
      }
      setSearchTime(0);
    }

    // Cleanup function
    return () => {
      if (searchIntervalRef.current) {
        clearInterval(searchIntervalRef.current);
      }
    };
  }, [isSearching]);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const handleStart = useCallback(() => {
    if (!socket || !isConnected) {
      setConnectionStatus('Not connected to server');
      return;
    }

    console.log('[MAIN] Starting search for partner...');
    setIsSearching(true);
    setConnectionStatus("Searching for partner...");
    
    emit('find_partner', { 
      audioEnabled,
      videoEnabled
    });
  }, [socket, emit, audioEnabled, videoEnabled, isConnected]);

  const handleStop = useCallback(() => {
    console.log('[MAIN] Stopping search');
    setIsSearching(false);
    setConnectionStatus("Search stopped");
  }, []);

  const handleSkip = useCallback(() => {
    console.log('[MAIN] Skipping current search');
    if (socket && isConnected) {
      emit('skip');
    }
    setIsSearching(false);
  }, [socket, emit, isConnected]);

  return (
    <div className="min-h-screen bg-background p-4 flex flex-col items-center">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">
            Random Video Chat
          </h1>
          <p className="text-muted-foreground text-lg">Connect with strangers anonymously</p>
        </div>

        {/* Connection Status */}
        <Card className="mb-6 glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-center gap-3">
              {isConnected ? (
                <Wifi className="h-5 w-5 text-green-500" />
              ) : (
                <WifiOff className="h-5 w-5 text-red-500" />
              )}
              <span className="text-sm text-muted-foreground">
                {connectionStatus}
              </span>
              <Badge 
                variant={isConnected ? "default" : "secondary"}
                className={isConnected 
                  ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300" 
                  : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
                }
              >
                {isConnected ? "Online" : "Offline"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* User Count Card */}
        <Card className="mb-6 glass-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-center gap-3">
              <Users className="h-6 w-6 text-primary" />
              <span className="text-foreground text-lg">
                <span className="font-bold text-primary">{userCount}</span> people online
              </span>
              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                Live
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Main Chat Card */}
        <Card className="glass-card">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-foreground">
              {isSearching ? 'Looking for someone...' : 'Start a Random Chat'}
            </CardTitle>
            {isSearching && (
              <div className="text-primary text-lg font-mono">
                {formatTime(searchTime)}
              </div>
            )}
          </CardHeader>
          <CardContent className="p-6">
            {!isSearching ? (
              <div className="space-y-6">
                {/* Media Controls */}
                <div className="flex justify-center gap-4">
                  <Button
                    variant={audioEnabled ? "default" : "secondary"}
                    size="sm"
                    onClick={() => setAudioEnabled(!audioEnabled)}
                    className="flex items-center gap-2"
                    disabled={!isConnected}
                  >
                    {audioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                    {audioEnabled ? 'Audio On' : 'Audio Off'}
                  </Button>
                  <Button
                    variant={videoEnabled ? "default" : "secondary"}
                    size="sm"
                    onClick={() => setVideoEnabled(!videoEnabled)}
                    className="flex items-center gap-2"
                    disabled={!isConnected}
                  >
                    {videoEnabled ? <VideoIcon className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                    {videoEnabled ? 'Video On' : 'Video Off'}
                  </Button>
                </div>

                {/* Start Button */}
                <Button 
                  onClick={handleStart} 
                  size="lg" 
                  className="w-full text-lg py-6"
                  disabled={!isConnected}
                >
                  <Search className="h-5 w-5 mr-2" />
                  {isConnected ? 'Start Chatting' : 'Connecting...'}
                </Button>

                {!isConnected && (
                  <div className="text-center text-sm text-muted-foreground">
                    Please wait while we connect to the server...
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {/* Searching Animation */}
                <div className="flex justify-center">
                  <div className="animate-pulse">
                    <Video className="h-16 w-16 text-primary" />
                  </div>
                </div>

                {/* Search Status */}
                <div className="text-center">
                  <p className="text-muted-foreground mb-2">Searching for a partner...</p>
                  <p className="text-sm text-muted-foreground">
                    Audio: {audioEnabled ? 'Enabled' : 'Disabled'} | 
                    Video: {videoEnabled ? 'Enabled' : 'Disabled'}
                  </p>
                </div>

                {/* Control Buttons */}
                <div className="flex gap-4">
                  <Button 
                    onClick={handleSkip} 
                    variant="outline" 
                    className="flex-1"
                    disabled={!isConnected}
                  >
                    <SkipForward className="h-4 w-4 mr-2" />
                    Skip
                  </Button>
                  <Button 
                    onClick={handleStop} 
                    variant="destructive" 
                    className="flex-1"
                  >
                    <StopCircle className="h-4 w-4 mr-2" />
                    Stop
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tips Card */}
        <Card className="mt-6 glass-card">
          <CardContent className="p-4">
            <div className="text-center text-sm text-muted-foreground space-y-1">
              <p>💡 <strong>Tips:</strong></p>
              <p>• Be respectful and follow community guidelines</p>
              <p>• You can skip to find a new partner anytime</p>
              <p>• Make sure your camera and microphone are working</p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-muted-foreground text-sm">
          <p>⚠️ You are responsible for your own safety</p>
          <p className="mt-1">Report inappropriate behavior immediately</p>
        </div>
      </div>
    </div>
  );
}