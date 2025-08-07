"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  SkipForward, 
  StopCircle, 
  Mic, 
  MicOff, 
  VideoOff, 
  VideoIcon,
  RotateCcw
} from 'lucide-react';

const OMEGLE_SERVER_URL = process.env.NEXT_PUBLIC_OMEGLE_SERVER_URL || process.env.OMEGLE_SERVER_URL;

export default function OmegleRoomPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomId = searchParams.get("roomId");
  const initiator = searchParams.get("initiator") === "1";

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  
  const [isConnected, setIsConnected] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState("Connecting...");

  // Initialize WebSocket connection and join room
  useEffect(() => {
    if (!OMEGLE_SERVER_URL || !roomId) return;
    
    const socket = new WebSocket(OMEGLE_SERVER_URL.replace(/^http/, "ws"));
    socketRef.current = socket;

    socket.onopen = () => {
      setConnectionStatus("Connected to server");
      socket.send(JSON.stringify({ type: "join", room: roomId }));
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      handleSocketMessage(data);
    };

    socket.onerror = (err) => {
      console.error("Socket error:", err);
      setConnectionStatus("Connection error");
    };

    socket.onclose = () => {
      setConnectionStatus("Disconnected");
    };

    return () => {
      socket.close();
    };
  }, [roomId]); // Only depend on roomId

  // Initialize PeerConnection and local media stream
  useEffect(() => {
    if (!socketRef.current || !roomId) return;

    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" }
      ],
    });
    pcRef.current = pc;

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current?.send(
          JSON.stringify({
            type: "candidate",
            candidate: event.candidate,
            room: roomId,
          })
        );
      }
    };

    pc.oniceconnectionstatechange = () => {
      if (pc.iceConnectionState === "connected") {
        setIsConnected(true);
        setConnectionStatus("Connected to stranger");
      } else if (pc.iceConnectionState === "disconnected") {
        setIsConnected(false);
        setConnectionStatus("Disconnected from stranger");
      }
    };

    pc.ontrack = (event) => {
      if (remoteVideoRef.current && !remoteVideoRef.current.srcObject) {
        remoteVideoRef.current.srcObject = event.streams[0];
        remoteVideoRef.current.play().catch(() => {});
      }
    };

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          localVideoRef.current.play().catch(() => {});
        }
        stream.getTracks().forEach((track) => {
          pc.addTrack(track, stream);
        });
        // If this user is the initiator, start the call
        if (initiator) {
          startCall(pc, socketRef.current, roomId);
        }
      })
      .catch((error) => {
        console.error("Error accessing media devices:", error);
        setConnectionStatus("Camera/microphone access denied");
      });

    return () => {
      pc.close();
    };
  }, [roomId, initiator]); // Depend on roomId and initiator

  const handleSocketMessage = useCallback(async (data: { type: string; offer?: RTCSessionDescriptionInit; answer?: RTCSessionDescriptionInit; candidate?: RTCIceCandidateInit; }) => {
    const pc = pcRef.current;
    if (!pc) return;

    if (data.type === "offer" && data.offer) {
      await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socketRef.current?.send(
        JSON.stringify({ type: "answer", answer, room: roomId })
      );
    } else if (data.type === "answer" && data.answer) {
      await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
    } else if (data.type === "candidate") {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
      } catch {
        // Ignore
      }
    }
  }, [roomId]);

  // Initiator starts the call
  const startCall = useCallback(async (pc: RTCPeerConnection, socket: WebSocket | null, roomId: string) => {
    if (!pc || !socket) return;
    if (pc.signalingState === "closed") {
      return;
    }
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socket.send(
      JSON.stringify({ type: "offer", offer, room: roomId })
    );
  }, []);

  const toggleAudio = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  }, []);

  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  }, []);

  const handleSkip = useCallback(() => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: "skip", room: roomId }));
    }
    router.push("/omegle");
  }, [roomId, router]);

  const handleStop = useCallback(() => {
    if (pcRef.current) {
      pcRef.current.close();
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    router.push("/omegle");
  }, [router]);

  const handleReconnect = useCallback(() => {
    router.push("/omegle");
  }, [router]);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">Random Video Chat</h1>
          <div className="flex items-center justify-center gap-4">
            <Badge 
              variant={isConnected ? "default" : "secondary"}
              className={isConnected ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300" : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300"}
            >
              {connectionStatus}
            </Badge>
            <Badge variant="outline" className="text-muted-foreground">
              Room: {roomId}
            </Badge>
          </div>
        </div>

        {/* Video Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Local Video */}
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="text-center mb-2">
                <h3 className="text-foreground font-semibold">You</h3>
              </div>
              <div className="relative">
                <video 
                  ref={localVideoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className="w-full aspect-video rounded-lg bg-muted"
                />
                {!isVideoEnabled && (
                  <div className="absolute inset-0 flex items-center justify-center bg-muted/50 rounded-lg">
                    <VideoOff className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Remote Video */}
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="text-center mb-2">
                <h3 className="text-foreground font-semibold">Stranger</h3>
              </div>
              <div className="relative">
                <video 
                  ref={remoteVideoRef} 
                  autoPlay 
                  playsInline 
                  className="w-full aspect-video rounded-lg bg-muted"
                />
                {!isConnected && (
                  <div className="absolute inset-0 flex items-center justify-center bg-muted/50 rounded-lg">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-2"></div>
                      <p className="text-muted-foreground">Waiting for stranger...</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Control Panel */}
        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex flex-wrap justify-center gap-4">
              {/* Media Controls */}
              <Button
                variant={isAudioEnabled ? "default" : "secondary"}
                size="lg"
                onClick={toggleAudio}
                className="flex items-center gap-2"
              >
                {isAudioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                {isAudioEnabled ? 'Mute' : 'Unmute'}
              </Button>

              <Button
                variant={isVideoEnabled ? "default" : "secondary"}
                size="lg"
                onClick={toggleVideo}
                className="flex items-center gap-2"
              >
                {isVideoEnabled ? <VideoIcon className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                {isVideoEnabled ? 'Stop Video' : 'Start Video'}
              </Button>

              {/* Omegle Controls */}
              <Button
                variant="outline"
                size="lg"
                onClick={handleSkip}
                className="flex items-center gap-2"
              >
                <SkipForward className="h-5 w-5" />
                Skip
              </Button>

              <Button
                variant="destructive"
                size="lg"
                onClick={handleStop}
                className="flex items-center gap-2"
              >
                <StopCircle className="h-5 w-5" />
                Stop
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={handleReconnect}
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-5 w-5" />
                New Chat
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 text-muted-foreground text-sm">
          <p>⚠️ Be respectful and follow community guidelines</p>
          <p className="mt-1">You are responsible for your own safety</p>
        </div>
      </div>
    </div>
  );
}
