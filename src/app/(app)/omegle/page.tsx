"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Video, Loader2, Wifi, WifiOff, AlertCircle, RefreshCw, MessageCircle, Camera } from 'lucide-react';
import { useSocket } from '@/context/SocketProvider';

export default function OmeglePage() {
  const router = useRouter();
  const { socket, isConnected, userId, emit, reconnect } = useSocket();
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [userCount, setUserCount] = useState<number>(0);
  const [searchTime, setSearchTime] = useState<number>(0);
  const [error, setError] = useState<string>('');
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg">
              <Video className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Omegle Clone
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            {isConnected ? (
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-600 hidden md:inline">Online</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-red-500 rounded-full"></div>
                <span className="text-sm text-red-600 hidden md:inline">Offline</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <div className="mx-auto w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
              <Camera className="h-10 w-10 text-white" />
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Random Video Chat</h2>
              <p className="text-gray-600">Connect with strangers around the world instantly</p>
            </div>
          </div>

          {/* Connection Status */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-center gap-3">
                {isConnected ? (
                  <>
                    <div className="flex items-center gap-2">
                      <Wifi className="h-5 w-5 text-green-500" />
                      <span className="text-sm font-medium">Connected</span>
                    </div>
                    <div className="h-4 w-px bg-gray-300"></div>
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-blue-500" />
                      <span className="text-sm">
                        <strong className="text-blue-600">{userCount}</strong> online
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-5 w-5 text-red-500" />
                    <span className="text-sm">Connecting...</span>
                    <Button onClick={handleReconnect} size="sm" variant="ghost">
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
              {userId && (
                <p className="text-xs text-center text-gray-500 mt-2">
                  Your ID: {userId.slice(0, 8)}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Error Display */}
          {error && (
            <Card className="border-red-200 bg-red-50 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-red-700 font-medium">Unable to start chat</p>
                    <p className="text-xs text-red-600 mt-1">{error}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Main Action Card */}
          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              {!isSearching ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-xl font-semibold mb-2">Ready to meet someone new?</h3>
                    <p className="text-gray-600 text-sm">Click below to start a random video chat</p>
                  </div>
                  
                  <Button
                    onClick={handleStartChat}
                    size="lg"
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3 shadow-lg"
                    disabled={!isConnected || !userId}
                  >
                    <Video className="h-5 w-5 mr-2" />
                    {isConnected && userId ? 'Start Video Chat' : 'Connecting...'}
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Search Animation */}
                  <div className="text-center">
                    <div className="relative mx-auto w-16 h-16 mb-4">
                      <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
                      <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                      <div className="absolute inset-2 bg-blue-600 rounded-full flex items-center justify-center">
                        <Video className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Finding someone to chat with...</h3>
                    <p className="text-gray-600 text-sm">This might take a few moments</p>
                  </div>

                  {/* Search Stats */}
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <div className="flex items-center justify-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse"></div>
                        <span>Searching: {formatTime(searchTime)}</span>
                      </div>
                      <div className="h-3 w-px bg-gray-300"></div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3 text-gray-500" />
                        <span>{userCount} online</span>
                      </div>
                    </div>
                  </div>

                  {/* Long search warning */}
                  {searchTime > 30 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                        <div>
                          <p className="text-sm text-yellow-800 font-medium">Taking longer than usual</p>
                          <p className="text-xs text-yellow-700 mt-1">
                            Try again later or check your internet connection
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <Button 
                    onClick={handleStopSearch} 
                    variant="outline" 
                    className="w-full border-red-200 text-red-600 hover:bg-red-50"
                  >
                    Stop Searching
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Features */}
          {!isSearching && (
            <div className="grid grid-cols-2 gap-3">
              <Card className="border-0 shadow-md">
                <CardContent className="p-4 text-center">
                  <Video className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <h4 className="font-medium text-sm mb-1">HD Video</h4>
                  <p className="text-xs text-gray-600">Crystal clear video calls</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-md">
                <CardContent className="p-4 text-center">
                  <MessageCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <h4 className="font-medium text-sm mb-1">Live Chat</h4>
                  <p className="text-xs text-gray-600">Text while you video chat</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Safety Tips */}
          <Card className="border-0 bg-gray-50 shadow-sm">
            <CardContent className="p-4">
              <h4 className="font-semibold text-sm mb-3 text-center">Stay Safe Online</h4>
              <div className="space-y-2 text-xs text-gray-600">
                <div className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                  <span>Be respectful and kind to others</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                  <span>Don't share personal information</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                  <span>Report inappropriate behavior</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                  <span>Use a stable internet connection</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Debug Info (only in development) */}
          {process.env.NODE_ENV === 'development' && (
            <Card className="border-0 bg-gray-100 shadow-sm">
              <CardContent className="p-3">
                <p className="text-xs text-gray-600 text-center">
                  <strong>Debug:</strong> Connected: {isConnected ? 'Yes' : 'No'}, 
                  UserId: {userId ? userId.slice(0, 8) : 'None'}, 
                  Searching: {isSearching ? 'Yes' : 'No'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t px-4 py-3">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-xs text-gray-500">
            By using this service, you agree to be respectful and follow community guidelines
          </p>
        </div>
      </div>
    </div>
  );
}