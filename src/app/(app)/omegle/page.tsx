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
  const searchIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Connect to WebSocket for real-time user count
  useEffect(() => {
    if (!OMEGLE_SERVER_URL) return;

    const socket = new WebSocket(OMEGLE_SERVER_URL.replace(/^http/, "ws"));
    
    socket.onopen = () => {
      console.log('Connected to Omegle server for user count');
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "user_count") {
          setUserCount(data.count);
        }
      } catch (error) {
        console.error('Error parsing user count message:', error);
      }
    };

    socket.onerror = (err) => {
      console.error('WebSocket error for user count:', err);
    };

    socket.onclose = () => {
      console.log('Disconnected from Omegle server');
    };

    return () => {
      socket.close();
    };
  }, []); // Only run once on mount

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
  }, [isSearching]); // Only depend on isSearching

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const handleStart = useCallback(() => {
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
        router.push(`/omegle/room?roomId=${data.room}`);
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
  }, [OMEGLE_SERVER_URL, audioEnabled, videoEnabled, router]);

  const handleStop = useCallback(() => {
    setIsSearching(false);
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
  }, []);

  const handleSkip = useCallback(() => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: "skip" }));
    }
  }, []);

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
                  className="w-full text-lg py-6"
                >
                  <Search className="h-5 w-5 mr-2" />
                  Start Chatting
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Searching Animation */}
                <div className="flex justify-center">
                  <div className="animate-pulse">
                    <Video className="h-16 w-16 text-primary" />
                  </div>
                </div>

                {/* Control Buttons */}
                <div className="flex gap-4">
                  <Button 
                    onClick={handleSkip} 
                    variant="outline" 
                    className="flex-1"
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
        <div className="text-center mt-8 text-muted-foreground text-sm">
          <p>⚠️ Be respectful and follow community guidelines</p>
          <p className="mt-1">You are responsible for your own safety</p>
        </div>
      </div>
    </div>
  );
}
