"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Video, Loader2, Wifi, WifiOff, AlertCircle, RefreshCw } from 'lucide-react';
import { useSocket } from '@/context/SocketProvider';

export default function OmeglePage() {
  const router = useRouter();
  const { socket, isConnected, userId, emit, reconnect } = useSocket();
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [userCount, setUserCount] = useState<number>(0);
  const [searchTime, setSearchTime] = useState<number>(0);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!socket) return;

    const handleUserCount = (data: { count: number }) => {
      console.log('User count update:', data.count);
      setUserCount(data.count);
    };

    const handleRoomAssigned = (data: { roomId: string; partnerId: string; isInitiator: boolean }) => {
      console.log('Room assigned:', data);
      setIsSearching(false);
      setError('');
      router.push(`/omegle/room/${data.roomId}`);
    };

    const handleSearching = () => {
      console.log('Now searching...');
      setIsSearching(true);
      setError('');
    };

    const handlePartnerSkipped = () => {
      console.log('Partner skipped');
      setIsSearching(false);
      setError('');
    };

    const handlePartnerDisconnected = () => {
      console.log('Partner disconnected');
      setIsSearching(false);
      setError('');
    };

    const handleError = (data: { message: string }) => {
      console.error('Socket error:', data);
      setError(data.message);
      setIsSearching(false);
    };

    socket.on('user_count', handleUserCount);
    socket.on('room_assigned', handleRoomAssigned);
    socket.on('searching', handleSearching);
    socket.on('partner_skipped', handlePartnerSkipped);
    socket.on('partner_disconnected', handlePartnerDisconnected);
    socket.on('error', handleError);

    return () => {
      socket.off('user_count', handleUserCount);
      socket.off('room_assigned', handleRoomAssigned);
      socket.off('searching', handleSearching);
      socket.off('partner_skipped', handlePartnerSkipped);
      socket.off('partner_disconnected', handlePartnerDisconnected);
      socket.off('error', handleError);
    };
  }, [socket, router]);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (isSearching) {
      interval = setInterval(() => setSearchTime((t) => t + 1), 1000);
    } else {
      setSearchTime(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSearching]);

  const handleStartChat = async () => {
    if (!isConnected || !userId) {
      setError('Not connected to server. Please wait or try reconnecting.');
      return;
    }

    // Check for media permissions before starting search
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      stream.getTracks().forEach(track => track.stop()); // Stop the test stream
      setError('');
    } catch (err: any) {
      let errorMessage = 'Camera and microphone access required';
      if (err.name === 'NotAllowedError') {
        errorMessage = 'Please allow camera and microphone access to start chatting';
      } else if (err.name === 'NotFoundError') {
        errorMessage = 'No camera or microphone found. Please connect a device';
      }
      setError(errorMessage);
      return;
    }

    console.log('Starting chat search...');
    emit('find_partner');
    setIsSearching(true);
    setError('');
  };

  const handleStopSearch = () => {
    console.log('Stopping search...');
    emit('skip');
    setIsSearching(false);
    setError('');
  };

  const handleReconnect = () => {
    setError('');
    reconnect();
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-6">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-foreground">Random Chat</h1>
          <p className="text-muted-foreground">Connect with strangers around the world</p>
        </div>

        {/* Connection Status */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-center gap-2">
              {isConnected ? (
                <Wifi className="h-5 w-5 text-green-500" />
              ) : (
                <WifiOff className="h-5 w-5 text-red-500" />
              )}
              <span className="text-sm">
                {isConnected ? 'Connected' : 'Connecting...'}
              </span>
              <Badge variant={isConnected ? 'default' : 'secondary'}>
                {isConnected ? 'Online' : 'Offline'}
              </Badge>
              {!isConnected && (
                <Button onClick={handleReconnect} size="sm" variant="ghost">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              )}
            </div>
            {userId && (
              <p className="text-xs text-center text-muted-foreground mt-2">
                Your ID: {userId.slice(0, 8)}
              </p>
            )}
          </CardContent>
        </Card>

        {/* User Count */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-center gap-3">
              <Users className="h-6 w-6 text-primary" />
              <span className="text-lg">
                <strong className="text-primary">{userCount}</strong> people online
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-red-700">
                <AlertCircle className="h-5 w-5" />
                <p className="text-sm">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Action Card */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">
              {isSearching ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Finding someone... {formatTime(searchTime)}
                </div>
              ) : (
                'Start Video Chat'
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {!isSearching ? (
              <Button
                onClick={handleStartChat}
                size="lg"
                className="w-full"
                disabled={!isConnected || !userId}
              >
                <Video className="h-5 w-5 mr-2" />
                {isConnected && userId ? 'Start Chatting' : 'Connecting...'}
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="animate-pulse">
                    <Video className="h-12 w-12 text-primary" />
                  </div>
                </div>
                <p className="text-center text-muted-foreground">
                  Looking for someone to chat with...
                </p>
                <div className="text-center text-sm text-muted-foreground">
                  <p>Search time: {formatTime(searchTime)}</p>
                  {searchTime > 30 && (
                    <p className="text-yellow-600 mt-1">
                      Taking longer than usual. You can try again later.
                    </p>
                  )}
                </div>
                <Button onClick={handleStopSearch} variant="destructive" className="w-full">
                  Stop Searching
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tips */}
        <div className="text-center text-xs text-muted-foreground space-y-1">
          <p><strong>Tips:</strong></p>
          <p>• Be respectful and kind to others</p>
          <p>• You can skip to find a new partner anytime</p>
          <p>• Allow camera and microphone access when prompted</p>
          <p>• Use a stable internet connection for best experience</p>
        </div>

        {/* Debug Info (only in development) */}
        {process.env.NODE_ENV === 'development' && (
          <Card className="bg-gray-50">
            <CardContent className="p-3">
              <p className="text-xs text-gray-600">
                <strong>Debug:</strong> Connected: {isConnected ? 'Yes' : 'No'}, 
                UserId: {userId ? userId.slice(0, 8) : 'None'}, 
                Searching: {isSearching ? 'Yes' : 'No'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}