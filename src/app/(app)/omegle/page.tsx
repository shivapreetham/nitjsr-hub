"use client";

import React, { useRef, useState, useEffect } from 'react';
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
  Settings,
  Mic,
  MicOff,
  VideoOff,
  VideoIcon
} from 'lucide-react';

const OMEGLE_SERVER_URL = process.env.NEXT_PUBLIC_OMEGLE_SERVER_URL || process.env.OMEGLE_SERVER_URL;

export default function OmeglePage() {
  const router = useRouter();
  const socketRef = useRef<WebSocket | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [userCount, setUserCount] = useState(0);
  const [searchTime, setSearchTime] = useState(0);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [searchInterval, setSearchInterval] = useState<NodeJS.Timeout | null>(null);

  // Simulate user count updates (in real implementation, this would come from server)
  useEffect(() => {
    const interval = setInterval(() => {
      setUserCount(prev => {
        const change = Math.floor(Math.random() * 5) - 2; // Random change between -2 and +2
        return Math.max(0, prev + change);
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Update search time when searching
  useEffect(() => {
    if (isSearching) {
      const interval = setInterval(() => {
        setSearchTime(prev => prev + 1);
      }, 1000);
      setSearchInterval(interval);
    } else {
      if (searchInterval) {
        clearInterval(searchInterval);
        setSearchInterval(null);
      }
      setSearchTime(0);
    }

    return () => {
      if (searchInterval) {
        clearInterval(searchInterval);
      }
    };
  }, [isSearching, searchInterval]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    if (!OMEGLE_SERVER_URL) {
      alert('Server not configured');
      return;
    }

    setIsSearching(true);
    const socket = new WebSocket(OMEGLE_SERVER_URL.replace(/^http/, "ws"));
    socketRef.current = socket;

    socket.onopen = () => {
      socket.send(JSON.stringify({ 
        type: "find_partner",
        audioEnabled,
        videoEnabled
      }));
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "room_assigned" && data.room) {
        setIsSearching(false);
        router.push(`/omegle/room?roomId=${data.room}&initiator=${data.initiator ? '1' : '0'}`);
        socket.close();
      } else if (data.type === "user_count") {
        setUserCount(data.count);
      }
    };

    socket.onerror = (err) => {
      setIsSearching(false);
      alert('Connection error. Please try again.');
      socket.close();
    };
  };

  const handleStop = () => {
    setIsSearching(false);
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
  };

  const handleSkip = () => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: "skip" }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-2">Omegle</h1>
          <p className="text-purple-200 text-lg">Talk to strangers!</p>
        </div>

        {/* User Count Card */}
        <Card className="mb-6 bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-center gap-3">
              <Users className="h-6 w-6 text-purple-300" />
              <span className="text-white text-lg">
                <span className="font-bold text-purple-300">{userCount}</span> people online
              </span>
              <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/30">
                Live
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Main Chat Card */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader className="text-center">
            <CardTitle className="text-white text-2xl">
              {isSearching ? 'Looking for someone...' : 'Start a Random Chat'}
            </CardTitle>
            {isSearching && (
              <div className="text-purple-300 text-lg font-mono">
                {formatTime(searchTime)}
              </div>
            )}
          </CardHeader>
          <CardContent className="p-6">
            {!isSearching ? (
              <div className="space-y-4">
                {/* Media Controls */}
                <div className="flex justify-center gap-4 mb-6">
                  <Button
                    variant={audioEnabled ? "default" : "secondary"}
                    size="sm"
                    onClick={() => setAudioEnabled(!audioEnabled)}
                    className="flex items-center gap-2"
                  >
                    {audioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                    {audioEnabled ? 'Audio On' : 'Audio Off'}
                  </Button>
                  <Button
                    variant={videoEnabled ? "default" : "secondary"}
                    size="sm"
                    onClick={() => setVideoEnabled(!videoEnabled)}
                    className="flex items-center gap-2"
                  >
                    {videoEnabled ? <VideoIcon className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                    {videoEnabled ? 'Video On' : 'Video Off'}
                  </Button>
                </div>

                {/* Start Button */}
                <Button 
                  onClick={handleStart} 
                  size="lg" 
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-lg py-6"
                >
                  <Search className="h-5 w-5 mr-2" />
                  Start Chatting
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Searching Animation */}
                <div className="flex justify-center mb-6">
                  <div className="animate-pulse">
                    <Video className="h-16 w-16 text-purple-300" />
                  </div>
                </div>

                {/* Control Buttons */}
                <div className="flex gap-4">
                  <Button 
                    onClick={handleSkip} 
                    variant="outline" 
                    className="flex-1 border-purple-300 text-purple-300 hover:bg-purple-300 hover:text-purple-900"
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

        {/* Footer */}
        <div className="text-center mt-6 text-purple-200 text-sm">
          <p>⚠️ Be respectful and follow community guidelines</p>
          <p className="mt-1">You are responsible for your own safety</p>
        </div>
      </div>
    </div>
  );
}
