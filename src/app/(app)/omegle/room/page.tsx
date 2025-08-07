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
import { useWebSocket } from "@/context/WebSocketProvider";

export default function OmegleRoomPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomId = searchParams.get("roomId");
  const { socket, send, token } = useWebSocket();

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  
  const [isConnected, setIsConnected] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState("Connecting...");
  const [isInitiator, setIsInitiator] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [hasReceivedOffer, setHasReceivedOffer] = useState(false);
  const [isRoomAssigned, setIsRoomAssigned] = useState(false);
  const [localStreamReady, setLocalStreamReady] = useState(false);

  const handleSocketMessage = useCallback(async (data: { 
    type: string; 
    offer?: RTCSessionDescriptionInit; 
    answer?: RTCSessionDescriptionInit; 
    candidate?: RTCIceCandidateInit;
    initiator?: boolean;
    role?: string;
    room?: string;
  }) => {
    console.log("[CLIENT] handleSocketMessage called with:", data.type, data);
    
    if (data.type === "room_assigned") {
      console.log("[CLIENT] Room assigned with role:", data.role);
      setIsInitiator(data.initiator ?? false);
      setUserRole(data.role ?? "Unknown");
      setIsRoomAssigned(true);
      setConnectionStatus("Room assigned - " + (data.role ?? "Unknown"));
      // Update sessionStorage with the latest room assignment
      sessionStorage.setItem("omegle_room", JSON.stringify({
        room: data.room,
        initiator: data.initiator,
        role: data.role
      }));
      return; // Don't need PeerConnection for room assignment
    }

    const pc = pcRef.current;
    if (!pc) {
      console.log("[CLIENT] Received message but no PeerConnection:", data.type);
      return;
    }

    console.log("[CLIENT] Processing message with PeerConnection:", data.type);

    if (data.type === "offer" && data.offer) {
      console.log("[CLIENT] Received offer, creating answer");
      console.log("[CLIENT] Offer details:", data.offer);
      setHasReceivedOffer(true);
      
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        send({ type: "answer", answer, room: roomId });
        console.log("[CLIENT] Answer sent");
      } catch (error) {
        console.error("[CLIENT] Error handling offer:", error);
      }
    } else if (data.type === "answer" && data.answer) {
      console.log("[CLIENT] Received answer");
      console.log("[CLIENT] Answer details:", data.answer);
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
      } catch (error) {
        console.error("[CLIENT] Error setting remote description:", error);
      }
    } else if (data.type === "candidate" && data.candidate) {
      console.log("[CLIENT] Received ICE candidate:", data.candidate);
      try {
        await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
        console.log("[CLIENT] ICE candidate added");
      } catch (error) {
        console.error("[CLIENT] Error adding ICE candidate:", error);
      }
    } else if (data.type === "partner_skipped") {
      console.log("[CLIENT] Partner skipped");
      setConnectionStatus("Partner skipped");
      setIsConnected(false);
    } else if (data.type === "partner_disconnected") {
      console.log("[CLIENT] Partner disconnected");
      setConnectionStatus("Partner disconnected");
      setIsConnected(false);
    } else if (data.type === "user_count") {
      console.log("[CLIENT] Received user count update:", data);
    } else {
      console.log("[CLIENT] Unknown message type:", data.type);
    }
  }, [roomId]);

  // Listen for messages from shared WebSocket and join room
  useEffect(() => {
    if (!socket || !roomId) {
      console.log("[CLIENT] Missing socket or roomId:", { hasSocket: !!socket, roomId });
      return;
    }

    const handleMessage = (event: MessageEvent) => {
      try {
        console.log("[CLIENT] Raw WebSocket message received:", event.data);
        const data = JSON.parse(event.data);
        console.log("[CLIENT] Parsed message:", data);
        handleSocketMessage(data);
      } catch (error) {
        console.error("[CLIENT] Error parsing WebSocket message:", error, "Raw data:", event.data);
      }
    };

    socket.addEventListener('message', handleMessage);
    
    // Check if we were already assigned to this room (from main page)
    const savedRoom = sessionStorage.getItem("omegle_room");
    if (savedRoom) {
      const { room: savedRoomId, initiator, role } = JSON.parse(savedRoom);
      if (savedRoomId === roomId) {
        console.log("[CLIENT] Already assigned to this room, setting state from sessionStorage");
        setIsInitiator(initiator ?? false);
        setUserRole(role ?? "Unknown");
        setIsRoomAssigned(true);
        setConnectionStatus("Room assigned - " + (role ?? "Unknown"));
        // Don't return early - we still need to listen for WebSocket messages
      }
    }
    
    // Join the room with token if available
    console.log("[CLIENT] Sending join message for room:", roomId);
    send({ type: "join", room: roomId, token: token || undefined });
    setConnectionStatus("Connected to server");

    return () => {
      socket.removeEventListener('message', handleMessage);
    };
  }, [socket, roomId, send, token, handleSocketMessage]);

  // Initialize PeerConnection and local media stream
  useEffect(() => {
    console.log("[CLIENT] PeerConnection useEffect triggered:", {
      hasSocket: !!socket,
      hasRoomId: !!roomId,
      isRoomAssigned,
      socketReadyState: socket?.readyState
    });

    if (!socket || !roomId || !isRoomAssigned) {
      console.log("[CLIENT] Not ready to create PeerConnection:", {
        hasSocket: !!socket,
        hasRoomId: !!roomId,
        isRoomAssigned
      });
      return;
    }

    console.log("[CLIENT] Creating PeerConnection...");
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" }
      ],
    });
    pcRef.current = pc;

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("[CLIENT] Sending ICE candidate");
        send({
          type: "candidate",
          candidate: event.candidate,
          room: roomId,
        });
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log("[CLIENT] ICE connection state:", pc.iceConnectionState);
      if (pc.iceConnectionState === "connected" || pc.iceConnectionState === "completed") {
        setIsConnected(true);
        setConnectionStatus("Connected to stranger");
      } else if (pc.iceConnectionState === "disconnected" || pc.iceConnectionState === "failed") {
        setIsConnected(false);
        setConnectionStatus("Disconnected from stranger");
      } else if (pc.iceConnectionState === "checking") {
        setConnectionStatus("Establishing connection...");
      } else if (pc.iceConnectionState === "new") {
        setConnectionStatus("Initializing connection...");
      }
    };

    pc.onconnectionstatechange = () => {
      console.log("[CLIENT] Connection state:", pc.connectionState);
      if (pc.connectionState === "connected") {
        setIsConnected(true);
        setConnectionStatus("Connected to stranger");
      } else if (pc.connectionState === "disconnected" || pc.connectionState === "failed") {
        setIsConnected(false);
        setConnectionStatus("Disconnected from stranger");
      }
    };

    pc.ontrack = (event) => {
      console.log("[CLIENT] Received remote track:", event.streams[0]);
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
        remoteVideoRef.current.play().catch((err) => {
          console.error("[CLIENT] Error playing remote video:", err);
        });
      }
    };

    // Get user media
    console.log("[CLIENT] Requesting user media...");
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        console.log("[CLIENT] User media obtained successfully");
        localStreamRef.current = stream;
        setLocalStreamReady(true);
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          localVideoRef.current.play().catch((err) => {
            console.error("[CLIENT] Error playing local video:", err);
          });
        }
        
        // Add all tracks to the peer connection
        stream.getTracks().forEach((track) => {
          pc.addTrack(track, stream);
        });

        // Only the initiator should create and send the offer
        if (isInitiator && !hasReceivedOffer) {
          console.log("[CLIENT] Creating offer as initiator");
          createAndSendOffer(pc, roomId);
        } else {
          console.log("[CLIENT] Not initiator, waiting for offer");
          setConnectionStatus("Waiting for connection...");
        }
      })
      .catch((error) => {
        console.error("[CLIENT] Error accessing media devices:", error);
        setConnectionStatus("Camera/microphone access denied");
      });

    return () => {
      console.log("[CLIENT] Cleaning up PeerConnection");
      pc.close();
    };
  }, [roomId, isInitiator, hasReceivedOffer, isRoomAssigned, send]);

  const createAndSendOffer = useCallback(async (pc: RTCPeerConnection, roomId: string) => {
    try {
      console.log("[CLIENT] Creating offer...");
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      send({ type: "offer", offer, room: roomId });
      console.log("[CLIENT] Offer sent");
    } catch (error) {
      console.error("[CLIENT] Error creating offer:", error);
    }
  }, [send]);

  const toggleAudio = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
        console.log("[CLIENT] Audio toggled:", audioTrack.enabled);
      }
    }
  }, []);

  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
        console.log("[CLIENT] Video toggled:", videoTrack.enabled);
      }
    }
  }, []);

  const handleSkip = useCallback(() => {
    console.log("[CLIENT] Skipping...");
    if (socket && socket.readyState === WebSocket.OPEN) {
      send({ type: "skip", room: roomId });
    }
    router.push("/omegle");
  }, [roomId, router, socket, send]);

  const handleStop = useCallback(() => {
    console.log("[CLIENT] Stopping...");
    if (pcRef.current) {
      pcRef.current.close();
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    router.push("/omegle");
  }, [router]);

  const handleReconnect = useCallback(() => {
    console.log("[CLIENT] Reconnecting...");
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
            <Badge variant="outline" className="text-muted-foreground">
              {userRole || "Unknown"}
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
                {!isVideoEnabled && localStreamReady && (
                  <div className="absolute inset-0 flex items-center justify-center bg-muted/50 rounded-lg">
                    <VideoOff className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
                {!localStreamReady && (
                  <div className="absolute inset-0 flex items-center justify-center bg-muted/50 rounded-lg">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-2"></div>
                      <p className="text-muted-foreground">Loading camera...</p>
                    </div>
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
                disabled={!localStreamReady}
              >
                {isAudioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                {isAudioEnabled ? 'Mute' : 'Unmute'}
              </Button>

              <Button
                variant={isVideoEnabled ? "default" : "secondary"}
                size="lg"
                onClick={toggleVideo}
                className="flex items-center gap-2"
                disabled={!localStreamReady}
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

        {/* Debug Info */}
        <Card className="glass-card mt-4">
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">
              <p><strong>Debug Info:</strong></p>
              <p>Room ID: {roomId}</p>
              <p>WebSocket State: {socket?.readyState}</p>
              <p>Room Assigned: {isRoomAssigned ? 'Yes' : 'No'}</p>
              <p>User Role: {userRole}</p>
              <p>Local Stream Ready: {localStreamReady ? 'Yes' : 'No'}</p>
              <p>Connection Status: {connectionStatus}</p>
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
