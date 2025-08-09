// app/omegle/page.tsx
"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Video, SkipForward, Search, StopCircle, Mic, MicOff, VideoOff, VideoIcon, Wifi, WifiOff } from "lucide-react";
import { useSocket } from "@/context/SocketProvider";

export default function OmegleMain() {
  const router = useRouter();
  const { socket, emit, isConnected } = useSocket();
  const [isSearching, setIsSearching] = useState(false);
  const [userCount, setUserCount] = useState(0);
  const [searchTime, setSearchTime] = useState(0);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState("Connecting...");
  const searchIntervalRef = useRef<number | null>(null);

  useEffect(() => { setConnectionStatus(isConnected ? "Connected" : "Connecting..."); }, [isConnected]);

  useEffect(() => {
    if (!socket) return;
    const u = (d: any) => setUserCount(d.count || 0);
    const onRoom = (data: any) => {
      console.log("[MAIN] room_assigned", data);
      setIsSearching(false);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem("omegle_room", JSON.stringify({ room: data.room, initiator: data.initiator, role: data.role, partnerId: data.partnerId, timestamp: Date.now() }));
      }
      router.push(`/omegle/room/${data.room}`);
    };
    const onPartnerSkipped = () => { setIsSearching(false); setConnectionStatus("Partner skipped"); };
    const onPartnerDisconnected = () => { setIsSearching(false); setConnectionStatus("Partner disconnected"); };

    socket.on("user_count", u);
    socket.on("room_assigned", onRoom);
    socket.on("partner_skipped", onPartnerSkipped);
    socket.on("partner_disconnected", onPartnerDisconnected);

    return () => {
      socket.off("user_count", u);
      socket.off("room_assigned", onRoom);
      socket.off("partner_skipped", onPartnerSkipped);
      socket.off("partner_disconnected", onPartnerDisconnected);
    };
  }, [socket, router]);

  useEffect(() => {
    if (isSearching) {
      if (searchIntervalRef.current) window.clearInterval(searchIntervalRef.current);
      searchIntervalRef.current = window.setInterval(() => setSearchTime(s => s + 1), 1000);
    } else {
      if (searchIntervalRef.current) { window.clearInterval(searchIntervalRef.current); searchIntervalRef.current = null; }
      setSearchTime(0);
    }
    return () => { if (searchIntervalRef.current) { window.clearInterval(searchIntervalRef.current); } };
  }, [isSearching]);

  const formatTime = useCallback((secs: number) => {
    const m = Math.floor(secs/60); const s = secs % 60; return `${m}:${s.toString().padStart(2,'0')}`;
  }, []);

  const handleStart = useCallback(() => {
    if (!isConnected) { setConnectionStatus("Not connected to server"); return; }
    setIsSearching(true);
    setConnectionStatus("Searching for partner...");
    emit("find_partner", { audioEnabled, videoEnabled });
  }, [emit, audioEnabled, videoEnabled, isConnected]);

  const handleStop = useCallback(() => { setIsSearching(false); setConnectionStatus("Search stopped"); }, []);
  const handleSkip = useCallback(() => { if (isConnected) emit("skip"); setIsSearching(false); }, [emit, isConnected]);

  return (
    <div className="min-h-screen bg-background p-4 flex flex-col items-center">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Random Video Chat</h1>
          <p className="text-muted-foreground text-lg">Connect anonymously</p>
        </div>

        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-center gap-3">
              {isConnected ? <Wifi /> : <WifiOff />}
              <span>{connectionStatus}</span>
              <Badge>{isConnected ? "Online" : "Offline"}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-center gap-3">
              <Users />
              <span><strong>{userCount}</strong> people online</span>
              <Badge>Live</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-center">
            <CardTitle>{isSearching ? "Looking for someone..." : "Start a Random Chat"}</CardTitle>
            {isSearching && <div className="font-mono">{formatTime(searchTime)}</div>}
          </CardHeader>
          <CardContent className="p-6">
            {!isSearching ? (
              <>
                <div className="flex justify-center gap-4 mb-4">
                  <Button onClick={() => setAudioEnabled(a => !a)} disabled={!isConnected}>{audioEnabled ? <Mic/> : <MicOff/>}{audioEnabled ? "Audio On": "Audio Off"}</Button>
                  <Button onClick={() => setVideoEnabled(v => !v)} disabled={!isConnected}>{videoEnabled ? <VideoIcon/> : <VideoOff/>}{videoEnabled ? "Video On" : "Video Off"}</Button>
                </div>
                <Button onClick={handleStart} disabled={!isConnected} className="w-full py-6"><Search/> Start Chatting</Button>
              </>
            ) : (
              <>
                <div className="flex justify-center mb-4"><Video/></div>
                <div className="text-center mb-4">Searching for a partner...</div>
                <div className="flex gap-4">
                  <Button onClick={handleSkip}>Skip</Button>
                  <Button onClick={handleStop}>Stop</Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
