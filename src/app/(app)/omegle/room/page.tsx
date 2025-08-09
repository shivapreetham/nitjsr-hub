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
  RotateCcw,
  AlertCircle
} from 'lucide-react';
import { useSocket } from "@/context/SocketProvider";

export default function SocketRoomPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomId = searchParams.get("roomId");
  const { socket, emit, token, isConnected } = useSocket();

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  
  const [isVideoCallConnected, setIsVideoCallConnected] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState("Initializing...");
  const [isInitiator, setIsInitiator] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [localStreamReady, setLocalStreamReady] = useState(false);
  const [mediaError, setMediaError] = useState("");
  const [roomJoined, setRoomJoined] = useState(false);
  const [partnerId, setPartnerId] = useState("");
  
  // Initialize media stream with better error handling
  const initializeMediaStream = useCallback(async () => {
    if (localStreamRef.current) {
      return localStreamRef.current;
    }

    console.log("[ROOM] Requesting user media...");
    setConnectionStatus("Requesting camera access...");
    
    try {
      const constraints = { 
        video: isVideoEnabled ? {
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 30 }
        } : false,
        audio: isAudioEnabled ? {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } : false
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      console.log("[ROOM] User media obtained successfully");
      localStreamRef.current = stream;
      setLocalStreamReady(true);
      setMediaError("");
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.play().catch((err) => {
          console.error("[ROOM] Error playing local video:", err);
        });
      }
      
      return stream;
    } catch (error : any) {
      console.error("[ROOM] Error accessing media devices:", error);
      let errorMsg = "Failed to access camera/microphone";
      
      if (error.name === "NotAllowedError") {
        errorMsg = "Camera/microphone access denied. Please allow access and refresh.";
      } else if (error.name === "NotFoundError") {
        errorMsg = "No camera or microphone found on this device.";
      } else if (error.name === "NotReadableError") {
        errorMsg = "Camera or microphone is already in use by another application.";
      }
      
      setMediaError(errorMsg);
      setConnectionStatus(errorMsg);
      throw error;
    }
  }, [isAudioEnabled, isVideoEnabled]);

  // Setup PeerConnection with better ICE servers
  const createPeerConnection = useCallback(() => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun.services.mozilla.com' },
        // Add TURN server for better connectivity (you'd need to set this up)
        // { 
        //   urls: 'turn:your-turn-server.com:3478',
        //   username: 'username',
        //   credential: 'password'
        // }
      ],
      iceCandidatePoolSize: 10
    });

    // ICE candidate handling
    pc.onicecandidate = (event) => {
      if (event.candidate && roomId) {
        console.log("[ROOM] Sending ICE candidate");
        emit('ice-candidate', {
          room: roomId,
          candidate: event.candidate
        });
      }
    };

    // Connection state monitoring
    pc.oniceconnectionstatechange = () => {
      console.log("[ROOM] ICE connection state:", pc.iceConnectionState);
      
      switch (pc.iceConnectionState) {
        case "connected":
        case "completed":
          setIsVideoCallConnected(true);
          setConnectionStatus("Connected to partner");
          break;
        case "disconnected":
          setIsVideoCallConnected(false);
          setConnectionStatus("Connection lost - attempting reconnect...");
          break;
        case "failed":
          setIsVideoCallConnected(false);
          setConnectionStatus("Connection failed");
          // Attempt ICE restart
          setTimeout(() => {
            if (pc.iceConnectionState === 'failed') {
              console.log("[ROOM] Attempting ICE restart");
              pc.restartIce();
            }
          }, 2000);
          break;
        case "checking":
          setConnectionStatus("Establishing connection...");
          break;
        case "new":
          setConnectionStatus("Preparing connection...");
          break;
        default:
          setConnectionStatus(`Connection state: ${pc.iceConnectionState}`);
      }
    };

    // Remote stream handling
    pc.ontrack = (event) => {
      console.log("[ROOM] Received remote track");
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
        remoteVideoRef.current.play().catch((err) => {
          console.error("[ROOM] Error playing remote video:", err);
        });
      }
    };

    return pc;
  }, [roomId, emit]);

  // Setup Socket.IO event listeners
  useEffect(() => {
    if (!socket || !roomId) return;

    const handleRoomAssigned = (data: any) => {
      console.log("[ROOM] Room assigned:", data);
      setIsInitiator(data.initiator ?? false);
      setUserRole(data.role ?? "Unknown");
      setPartnerId(data.partnerId || "");
      setRoomJoined(true);
      setConnectionStatus(`Joined as ${data.role || "Unknown"}`);
      
      if (typeof window !== 'undefined') {
        sessionStorage.setItem("omegle_room", JSON.stringify({
          room: data.room || roomId,
          initiator: data.initiator,
          role: data.role,
          partnerId: data.partnerId,
          timestamp: Date.now()
        }));
      }
    };

    const handleRoomJoined = (data: any) => {
      console.log("[ROOM] Room joined:", data);
      setIsInitiator(data.initiator ?? false);
      setUserRole(data.role ?? "Unknown");
      setPartnerId(data.partnerId || "");
      setRoomJoined(true);
      setConnectionStatus(`Joined as ${data.role || "Unknown"}`);
    };

    const handleOffer = async (data: any) => {
      if (!pcRef.current) {
        console.warn("[ROOM] Received offer but no PeerConnection");
        return;
      }
      
      try {
        console.log("[ROOM] Processing offer");
        setConnectionStatus("Processing offer...");
        
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(data.offer));
        const answer = await pcRef.current.createAnswer();
        await pcRef.current.setLocalDescription(answer);
        
        emit('answer', {
          room: roomId,
          answer: answer
        });
        
        console.log("[ROOM] Answer sent");
        setConnectionStatus("Answer sent, establishing connection...");
      } catch (error: any) {
        console.error("[ROOM] Error processing offer:", error);
        setConnectionStatus(`Error processing offer: ${error.message}`);
      }
    };

    const handleAnswer = async (data: any) => {
      if (!pcRef.current) {
        console.warn("[ROOM] Received answer but no PeerConnection");
        return;
      }
      
      try {
        console.log("[ROOM] Processing answer");
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
        console.log("[ROOM] Answer processed successfully");
        setConnectionStatus("Answer processed, establishing connection...");
      } catch (error: any) {
        console.error("[ROOM] Error processing answer:", error);
        setConnectionStatus(`Error processing answer: ${error.message}`);
      }
    };

    const handleIceCandidate = async (data: any) => {
      if (!pcRef.current) {
        console.warn("[ROOM] Received candidate but no PeerConnection");
        return;
      }
      
      try {
        await pcRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
        console.log("[ROOM] ICE candidate added");
      } catch (error: any) {
        console.error("[ROOM] Error adding ICE candidate:", error);
      }
    };

    const handlePartnerSkipped = () => {
      console.log("[ROOM] Partner skipped");
      setConnectionStatus("Partner skipped the chat");
      setIsVideoCallConnected(false);
    };

    const handlePartnerDisconnected = () => {
      console.log("[ROOM] Partner disconnected");
      setConnectionStatus("Partner disconnected");
      setIsVideoCallConnected(false);
    };

    const handleJoinFailed = (data: any) => {
      console.error("[ROOM] Failed to join room:", data.reason);
      setConnectionStatus(`Failed to join room: ${data.reason}`);
      setTimeout(() => router.push("/omegle"), 3000);
    };

    // Register event listeners
    socket.on('room_assigned', handleRoomAssigned);
    socket.on('room_joined', handleRoomJoined);
    socket.on('offer', handleOffer);
    socket.on('answer', handleAnswer);
    socket.on('ice-candidate', handleIceCandidate);
    socket.on('partner_skipped', handlePartnerSkipped);
    socket.on('partner_disconnected', handlePartnerDisconnected);
    socket.on('join_failed', handleJoinFailed);

    return () => {
      socket.off('room_assigned', handleRoomAssigned);
      socket.off('room_joined', handleRoomJoined);
      socket.off('offer', handleOffer);
      socket.off('answer', handleAnswer);
      socket.off('ice-candidate', handleIceCandidate);
      socket.off('partner_skipped', handlePartnerSkipped);
      socket.off('partner_disconnected', handlePartnerDisconnected);
      socket.off('join_failed', handleJoinFailed);
    };
  }, [socket, roomId, emit, router]);

  // Join room on component mount
  useEffect(() => {
    if (!socket || !roomId || !isConnected || roomJoined) {
      return;
    }

    console.log("[ROOM] Attempting to join room:", roomId);
    setConnectionStatus("Joining room...");
    
    emit('join_room', {
      room: roomId,
      token: token
    });
  }, [socket, roomId, isConnected, token, emit, roomJoined]);

  // Initialize PeerConnection when room is joined
  useEffect(() => {
    if (!roomJoined || !isConnected || pcRef.current) {
      return;
    }

    let cleanup = false;

    const setupPeerConnection = async () => {
      try {
        console.log("[ROOM] Setting up PeerConnection...");
        setConnectionStatus("Setting up video connection...");

        // Get media stream first
        const stream = await initializeMediaStream();
        if (cleanup) return;

        // Create peer connection
        const pc = createPeerConnection();
        pcRef.current = pc;

        // Add local stream tracks
        if (stream) {
          stream.getTracks().forEach((track) => {
            pc.addTrack(track, stream);
            console.log("[ROOM] Added local track:", track.kind);
          });
        }

        console.log("[ROOM] PeerConnection setup complete. Initiator:", isInitiator);

        // Create offer if initiator
        if (isInitiator) {
          console.log("[ROOM] Creating offer as initiator");
          setConnectionStatus("Creating offer...");
          
          try {
            const offer = await pc.createOffer({
              offerToReceiveAudio: true,
              offerToReceiveVideo: true
            });
            
            await pc.setLocalDescription(offer);
            
            emit('offer', {
              room: roomId,
              offer: offer
            });
            
            console.log("[ROOM] Offer sent successfully");
            setConnectionStatus("Offer sent, waiting for answer...");
          } catch (error: any) {
            console.error("[ROOM] Error creating/sending offer:", error);
            setConnectionStatus("Failed to create offer");
          }
        } else {
          console.log("[ROOM] Waiting for offer as responder");
          setConnectionStatus("Waiting for partner's offer...");
        }

      } catch (error: any) {
        console.error("[ROOM] Error setting up PeerConnection:", error);
        setConnectionStatus(`Setup failed: ${error.message}`);
      }
    };

    setupPeerConnection();

    return () => {
      cleanup = true;
    };
  }, [roomJoined, isConnected, isInitiator, roomId, emit, initializeMediaStream, createPeerConnection]);

  // Media control functions
  const toggleAudio = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
        console.log("[ROOM] Audio toggled:", audioTrack.enabled);
      }
    }
  }, []);

  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
        console.log("[ROOM] Video toggled:", videoTrack.enabled);
      }
    }
  }, []);

  const cleanup = useCallback(() => {
    console.log("[ROOM] Cleaning up resources");
    
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }

    // Clear session storage
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem("omegle_room");
    }
  }, []);

  const handleSkip = useCallback(() => {
    console.log("[ROOM] User initiated skip");
    if (socket && isConnected && roomId) {
      emit('skip');
    }
    cleanup();
    router.push("/omegle");
  }, [socket, isConnected, roomId, emit, cleanup, router]);

  const handleStop = useCallback(() => {
    console.log("[ROOM] User stopped chat");
    cleanup();
    router.push("/omegle");
  }, [cleanup, router]);

  const handleNewChat = useCallback(() => {
    console.log("[ROOM] Starting new chat");
    cleanup();
    router.push("/omegle");
  }, [cleanup, router]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  if (!roomId) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <Card>
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Invalid Room</h2>
            <p className="text-muted-foreground mb-4">No room ID provided</p>
            <Button onClick={() => router.push("/omegle")}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">Random Video Chat</h1>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Badge 
              variant={isVideoCallConnected ? "default" : "secondary"}
              className={isVideoCallConnected 
                ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300" 
                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300"
              }
            >
              {connectionStatus}
            </Badge>
            <Badge variant="outline">Room: {roomId}</Badge>
            <Badge variant="outline">{userRole || "Unknown Role"}</Badge>
            {partnerId && <Badge variant="outline">Partner: {partnerId}</Badge>}
          </div>
          
          {mediaError && (
            <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{mediaError}</span>
              </div>
            </div>
          )}
        </div>

        {/* Video Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Local Video */}
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="text-center mb-2">
                <h3 className="text-foreground font-semibold">You ({userRole})</h3>
              </div>
              <div className="relative">
                <video 
                  ref={localVideoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className="w-full aspect-video rounded-lg bg-muted object-cover"
                />
                {!isVideoEnabled && localStreamReady && (
                  <div className="absolute inset-0 flex items-center justify-center bg-muted/50 rounded-lg">
                    <VideoOff className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
                {!localStreamReady && !mediaError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-muted/50 rounded-lg">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-2"></div>
                      <p className="text-muted-foreground text-sm">Loading camera...</p>
                    </div>
                  </div>
                )}
                {mediaError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-muted/50 rounded-lg">
                    <div className="text-center">
                      <VideoOff className="h-12 w-12 text-red-500 mx-auto mb-2" />
                      <p className="text-red-500 text-sm">Camera unavailable</p>
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
                  className="w-full aspect-video rounded-lg bg-muted object-cover"
                />
                {!isVideoCallConnected && (
                  <div className="absolute inset-0 flex items-center justify-center bg-muted/80 rounded-lg">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-2"></div>
                      <p className="text-muted-foreground text-sm">
                        {roomJoined ? "Connecting to partner..." : "Joining room..."}
                      </p>
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
                disabled={!localStreamReady || !!mediaError}
              >
                {isAudioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                {isAudioEnabled ? 'Mute' : 'Unmute'}
              </Button>

              <Button
                variant={isVideoEnabled ? "default" : "secondary"}
                size="lg"
                onClick={toggleVideo}
                className="flex items-center gap-2"
                disabled={!localStreamReady || !!mediaError}
              >
                {isVideoEnabled ? <VideoIcon className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                {isVideoEnabled ? 'Stop Video' : 'Start Video'}
              </Button>

              {/* Chat Controls */}
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
                onClick={handleNewChat}
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-5 w-5" />
                New Chat
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Debug Info (only show in development) */}
        {process.env.NODE_ENV === 'development' && (
          <Card className="glass-card mt-4">
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">
                <p><strong>Debug Info:</strong></p>
                <p>Room ID: {roomId}</p>
                <p>Socket Connected: {isConnected ? 'Yes' : 'No'}</p>
                <p>Room Joined: {roomJoined ? 'Yes' : 'No'}</p>
                <p>User Role: {userRole || 'Not assigned'}</p>
                <p>Is Initiator: {isInitiator ? 'Yes' : 'No'}</p>
                <p>Partner ID: {partnerId || 'Unknown'}</p>
                <p>Local Stream: {localStreamReady ? 'Ready' : 'Not ready'}</p>
                <p>Video Call: {isVideoCallConnected ? 'Connected' : 'Not connected'}</p>
                <p>PeerConnection: {pcRef.current ? 'Created' : 'Not created'}</p>
                <p>Connection Status: {connectionStatus}</p>
                {mediaError && <p className="text-red-500">Media Error: {mediaError}</p>}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center mt-6 text-muted-foreground text-sm">
          <p>⚠️ Be respectful and follow community guidelines</p>
          <p className="mt-1">You are responsible for your own safety</p>
        </div>
      </div>
    </div>
  );
}