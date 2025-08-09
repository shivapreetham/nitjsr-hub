"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Video, Loader2, Wifi, WifiOff } from 'lucide-react';
import { useSocket } from '@/context/SocketProvider';

export default function OmeglePage() {
  const router = useRouter();
  const { socket, isConnected, emit } = useSocket();
  const [isSearching, setIsSearching] = useState(false);
  const [userCount, setUserCount] = useState(0);
  const [searchTime, setSearchTime] = useState(0);

  useEffect(() => {
    if (!socket) return;

    const handleUserCount = (data: { count: number }) => setUserCount(data.count);
    const handleRoomAssigned = (data: { roomId: string }) => {
      setIsSearching(false);
      router.push(`/omegle/room/${data.roomId}`);
    };
    const handleSearching = () => setIsSearching(true);
    const handlePartnerSkipped = () => setIsSearching(false);
    const handlePartnerDisconnected = () => setIsSearching(false);

    socket.on('user_count', handleUserCount);
    socket.on('room_assigned', handleRoomAssigned);
    socket.on('searching', handleSearching);
    socket.on('partner_skipped', handlePartnerSkipped);
    socket.on('partner_disconnected', handlePartnerDisconnected);

    return () => {
      socket.off('user_count', handleUserCount);
      socket.off('room_assigned', handleRoomAssigned);
      socket.off('searching', handleSearching);
      socket.off('partner_skipped', handlePartnerSkipped);
      socket.off('partner_disconnected', handlePartnerDisconnected);
    };
  }, [socket, router]);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (isSearching) {
      interval = setInterval(() => setSearchTime(t => t + 1), 1000);
    } else {
      setSearchTime(0);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isSearching]);

  const handleStartChat = () => {
    if (!isConnected) return;
    emit('find_partner');
    setIsSearching(true);
  };

  const handleStopSearch = () => {
    emit('skip');
    setIsSearching(false);
  };

  const formatTime = (seconds: number) => {
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

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-center gap-2">
              {isConnected ? <Wifi className="h-5 w-5 text-green-500" /> : <WifiOff className="h-5 w-5 text-red-500" />}
              <span className="text-sm">{isConnected ? 'Connected' : 'Connecting...'}</span>
              <Badge variant={isConnected ? 'default' : 'secondary'}>{isConnected ? 'Online' : 'Offline'}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-center gap-3">
              <Users className="h-6 w-6 text-primary" />
              <span className="text-lg"><strong className="text-primary">{userCount}</strong> people online</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">
              {isSearching ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Finding someone... {formatTime(searchTime)}
                </div>
              ) : 'Start Video Chat'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {!isSearching ? (
              <Button onClick={handleStartChat} size="lg" className="w-full" disabled={!isConnected}>
                <Video className="h-5 w-5 mr-2" />
                {isConnected ? 'Start Chatting' : 'Connecting...'}
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-center"><div className="animate-pulse"><Video className="h-12 w-12 text-primary" /></div></div>
                <p className="text-center text-muted-foreground">Looking for someone to chat with...</p>
                <Button onClick={handleStopSearch} variant="destructive" className="w-full">Stop Searching</Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="text-center text-xs text-muted-foreground space-y-1">
          <p><strong>Tips:</strong></p>
          <p>• Be respectful and kind to others</p>
          <p>• You can skip to find a new partner anytime</p>
          <p>• Allow camera and microphone access</p>
        </div>
      </div>
    </div>
  );
}