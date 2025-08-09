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
} from "lucide-react";
import { useSocket } from "@/context/SocketProvider";

export default function SocketRoomPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomId = searchParams.get("roomId");
  const { socket, emit, token, isConnected } = useSocket();

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
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

  // buffers for early messages
  const pendingOffersRef = useRef<any[]>([]);
  const pendingCandidatesRef = useRef<any[]>([]);

  // ICE restart control
  const iceRestartAttemptsRef = useRef(0);
  const ICE_MAX_ATTEMPTS = 4;
  const ICE_RETRY_DELAY_MS = 2000; // 2s initial

  // helper: build iceServers list (include TURN if provided via env)
  const buildIceServers = () => {
    const iceServers: RTCIceServer[] = [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
      { urls: "stun:stun2.l.google.com:19302" },
      { urls: "stun:stun.services.mozilla.com" },
    ];

    // Provide TURN via NEXT_PUBLIC_* env vars in your .env.local (see README below)
    try {
      const turnUrl = process.env.NEXT_PUBLIC_TURN_URL; // e.g. "turn:turn.example.com:3478"
      const turnUser = process.env.NEXT_PUBLIC_TURN_USERNAME;
      const turnPass = process.env.NEXT_PUBLIC_TURN_CREDENTIAL;
      if (turnUrl && turnUser && turnPass) {
        iceServers.push({
          urls: turnUrl,
          username: turnUser,
          credential: turnPass,
        } as RTCIceServer);
        console.log("[ROOM] TURN configured:", turnUrl);
      } else {
        console.log("[ROOM] No TURN configured - some peers may fail to connect");
      }
    } catch (e) {
      console.warn("[ROOM] Error reading TURN env", e);
    }

    return iceServers;
  };

  const initializeMediaStream = useCallback(async () => {
    if (localStreamRef.current) return localStreamRef.current;
    setConnectionStatus("Requesting camera access...");
    try {
      const constraints = {
        video: isVideoEnabled
          ? { width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 30 } }
          : false,
        audio: isAudioEnabled
          ? { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
          : false,
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;
      setLocalStreamReady(true);
      setMediaError("");
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        await localVideoRef.current.play().catch(() => {});
      }
      return stream;
    } catch (error: any) {
      console.error("[ROOM] Error accessing media devices:", error);
      let errorMsg = "Failed to access camera/microphone";
      if (error?.name === "NotAllowedError") errorMsg = "Camera/microphone access denied. Please allow access and refresh.";
      else if (error?.name === "NotFoundError") errorMsg = "No camera or microphone found on this device.";
      else if (error?.name === "NotReadableError") errorMsg = "Camera or microphone is already in use by another application.";
      setMediaError(errorMsg);
      setConnectionStatus(errorMsg);
      throw error;
    }
  }, [isAudioEnabled, isVideoEnabled]);

  const createPeerConnection = useCallback(() => {
    const pc = new RTCPeerConnection({
      iceServers: buildIceServers(),
      iceCandidatePoolSize: 10,
    });

    pc.onicecandidate = (event) => {
      if (event.candidate && roomId) {
        emit("ice-candidate", { room: roomId, candidate: event.candidate });
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log("[ROOM] ICE connection state:", pc.iceConnectionState);
      switch (pc.iceConnectionState) {
        case "connected":
        case "completed":
          iceRestartAttemptsRef.current = 0;
          setIsVideoCallConnected(true);
          setConnectionStatus("Connected to partner");
          break;
        case "disconnected":
          setIsVideoCallConnected(false);
          setConnectionStatus("Connection lost - attempting reconnect...");
          // Attempt ICE restart sequence
          attemptIceRestartSequence();
          break;
        case "failed":
          setIsVideoCallConnected(false);
          setConnectionStatus("Connection failed - attempting reconnect...");
          attemptIceRestartSequence();
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

    pc.ontrack = (event) => {
      console.log("[ROOM] Received remote track");
      if (remoteVideoRef.current && event.streams && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
        remoteVideoRef.current.play().catch(() => {});
      }
    };

    return pc;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, emit]);

  // attempt re-offer / restart ICE with backoff
  const attemptIceRestartSequence = useCallback(async () => {
    const attempts = iceRestartAttemptsRef.current;
    if (attempts >= ICE_MAX_ATTEMPTS) {
      setConnectionStatus("Could not recover connection. Try 'New Chat' or reloading.");
      console.warn("[ROOM] ICE restart max attempts reached");
      return;
    }
    iceRestartAttemptsRef.current += 1;
    const delay = ICE_RETRY_DELAY_MS * Math.pow(1.5, attempts); // backoff
    console.log(`[ROOM] Scheduling ICE restart attempt #${iceRestartAttemptsRef.current} in ${Math.round(delay)}ms`);

    setTimeout(async () => {
      const pc = pcRef.current;
      if (!pc || !roomId) return;

      try {
        // Always call restartIce locally (if supported)
        if (typeof pc.restartIce === "function") {
          try { pc.restartIce(); console.log("[ROOM] Called pc.restartIce()"); } catch(e){ console.warn("restartIce error", e); }
        }

        if (isInitiator) {
          // initiator: create an offer with iceRestart:true and send it
          console.log("[ROOM] Initiator performing iceRestart -> creating offer");
          setConnectionStatus("Attempting ICE restart (initiator)...");
          const offer = await pc.createOffer({ iceRestart: true });
          await pc.setLocalDescription(offer);
          emit("offer", { room: roomId, offer });
          console.log("[ROOM] Re-offer sent (initiator)");
        } else {
          // responder: ask server to request initiator to re-offer
          console.log("[ROOM] Responder requesting initiator to re-offer");
          emit("request_reoffer", { room: roomId });
        }
      } catch (err) {
        console.error("[ROOM] Error during ICE restart attempt", err);
      }

      // If still not connected after some time, schedule next attempt
      setTimeout(() => {
        const pcNow = pcRef.current;
        if (!pcNow) return;
        if (pcNow.iceConnectionState === "connected" || pcNow.iceConnectionState === "completed") {
          console.log("[ROOM] ICE restart succeeded");
          iceRestartAttemptsRef.current = 0;
          return;
        } else {
          // schedule next attempt
          attemptIceRestartSequence();
        }
      }, 3000);
    }, delay);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitiator, roomId, emit]);

  // socket listeners & signaling handlers
  useEffect(() => {
    if (!socket || !roomId) return;

    const handleRoomAssigned = (data: any) => {
      console.log("[ROOM] Room assigned:", data);
      setIsInitiator(Boolean(data.initiator));
      setUserRole(data.role ?? "Unknown");
      setPartnerId(data.partnerId || "");
      setRoomJoined(true);
      setConnectionStatus(`Joined as ${data.role || "Unknown"}`);
      if (typeof window !== "undefined") {
        sessionStorage.setItem(
          "omegle_room",
          JSON.stringify({ room: data.room || roomId, initiator: data.initiator, role: data.role, partnerId: data.partnerId, timestamp: Date.now() })
        );
      }
    };

    const handleRoomJoined = (data: any) => {
      console.log("[ROOM] Room joined:", data);
      setIsInitiator(Boolean(data.initiator));
      setUserRole(data.role ?? "Unknown");
      setPartnerId(data.partnerId || "");
      setRoomJoined(true);
      setConnectionStatus(`Joined as ${data.role || "Unknown"}`);
    };

    const handleOffer = async (data: any) => {
      if (!pcRef.current) {
        pendingOffersRef.current.push(data);
        console.warn("[ROOM] Offer buffered (pc not ready)");
        return;
      }
      try {
        setConnectionStatus("Processing offer...");
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(data.offer));
        const answer = await pcRef.current.createAnswer();
        await pcRef.current.setLocalDescription(answer);
        emit("answer", { room: roomId, answer });
        setConnectionStatus("Answer sent, establishing connection...");
      } catch (error: any) {
        console.error("[ROOM] Error processing offer:", error);
        setConnectionStatus(`Error processing offer: ${error?.message || error}`);
      }
    };

    const handleAnswer = async (data: any) => {
      if (!pcRef.current) {
        console.warn("[ROOM] Answer received but no PC");
        return;
      }
      try {
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
        setConnectionStatus("Answer processed, establishing connection...");
      } catch (error: any) {
        console.error("[ROOM] Error processing answer:", error);
        setConnectionStatus(`Error processing answer: ${error.message}`);
      }
    };

    const handleIceCandidate = async (data: any) => {
      if (!pcRef.current) {
        pendingCandidatesRef.current.push(data);
        console.warn("[ROOM] ICE candidate buffered (pc not ready)");
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
      setConnectionStatus("Partner skipped the chat");
      setIsVideoCallConnected(false);
    };

    const handlePartnerDisconnected = () => {
      setConnectionStatus("Partner disconnected");
      setIsVideoCallConnected(false);
    };

    const handleRequestReoffer = async (data: any) => {
      // server asked you (initiator) to re-offer
      if (!isInitiator || !pcRef.current) {
        console.log("[ROOM] Received request_reoffer but not initiator or PC missing");
        return;
      }
      console.log("[ROOM] Received request_reoffer -> creating iceRestart offer (initiator)");
      try {
        const offer = await pcRef.current.createOffer({ iceRestart: true });
        await pcRef.current.setLocalDescription(offer);
        emit("offer", { room: roomId, offer });
        setConnectionStatus("Sent re-offer (initiator)");
      } catch (err) {
        console.error("[ROOM] Error sending re-offer:", err);
      }
    };

    const handleJoinFailed = (data: any) => {
      console.error("[ROOM] Failed to join room:", data.reason);
      setConnectionStatus(`Failed to join room: ${data.reason}`);
      setTimeout(() => router.push("/omegle"), 3000);
    };

    socket.on("room_assigned", handleRoomAssigned);
    socket.on("room_joined", handleRoomJoined);
    socket.on("offer", handleOffer);
    socket.on("answer", handleAnswer);
    socket.on("ice-candidate", handleIceCandidate);
    socket.on("partner_skipped", handlePartnerSkipped);
    socket.on("partner_disconnected", handlePartnerDisconnected);
    socket.on("request_reoffer", handleRequestReoffer);
    socket.on("join_failed", handleJoinFailed);

    return () => {
      socket.off("room_assigned", handleRoomAssigned);
      socket.off("room_joined", handleRoomJoined);
      socket.off("offer", handleOffer);
      socket.off("answer", handleAnswer);
      socket.off("ice-candidate", handleIceCandidate);
      socket.off("partner_skipped", handlePartnerSkipped);
      socket.off("partner_disconnected", handlePartnerDisconnected);
      socket.off("request_reoffer", handleRequestReoffer);
      socket.off("join_failed", handleJoinFailed);
    };
  }, [socket, roomId, emit, router, isInitiator]);

  // join room when socket ready
  useEffect(() => {
    if (!socket || !roomId || !isConnected || roomJoined) return;
    setConnectionStatus("Joining room...");
    emit("join_room", { room: roomId });
  }, [socket, roomId, isConnected, emit, roomJoined]);

  // setup PC when room joined
  useEffect(() => {
    if (!roomJoined || !isConnected || pcRef.current) return;
    let cancelled = false;

    const setup = async () => {
      try {
        setConnectionStatus("Setting up peer connection...");
        const stream = await initializeMediaStream();
        if (cancelled) return;

        const pc = createPeerConnection();
        pcRef.current = pc;

        if (stream) {
          stream.getTracks().forEach((track) => {
            pc.addTrack(track, stream);
            console.log("[ROOM] Added local track:", track.kind);
          });
        }

        // add buffered candidates
        if (pendingCandidatesRef.current.length) {
          for (const cand of pendingCandidatesRef.current) {
            try { await pc.addIceCandidate(new RTCIceCandidate(cand.candidate)); } catch(e){ console.warn(e); }
          }
          pendingCandidatesRef.current = [];
        }

        console.log("[ROOM] PeerConnection ready. Initiator:", isInitiator);

        if (isInitiator) {
          setConnectionStatus("Creating offer...");
          const offer = await pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true });
          await pc.setLocalDescription(offer);
          emit("offer", { room: roomId, offer });
        } else {
          setConnectionStatus("Waiting for partner's offer...");
          // process any buffered offers
          if (pendingOffersRef.current.length) {
            for (const pending of pendingOffersRef.current) {
              try {
                await pc.setRemoteDescription(new RTCSessionDescription(pending.offer));
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                emit("answer", { room: roomId, answer });
                console.log("[ROOM] Buffered offer processed");
              } catch (e) { console.error(e); }
            }
            pendingOffersRef.current = [];
          }
        }
      } catch (err: any) {
        console.error("[ROOM] Error setup peer connection", err);
        setConnectionStatus(`Setup failed: ${err?.message || err}`);
      }
    };

    setup();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomJoined, isConnected, isInitiator, roomId]);

  // simple media controls
  const toggleAudio = useCallback(() => {
    if (localStreamRef.current) {
      const t = localStreamRef.current.getAudioTracks()[0];
      if (t) { t.enabled = !t.enabled; setIsAudioEnabled(t.enabled); }
    }
  }, []);

  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      const t = localStreamRef.current.getVideoTracks()[0];
      if (t) { t.enabled = !t.enabled; setIsVideoEnabled(t.enabled); }
    }
  }, []);

  // cleanup
  const cleanupAll = useCallback(() => {
    console.log("[ROOM] Cleaning up");
    if (pcRef.current) { pcRef.current.close(); pcRef.current = null; }
    if (localStreamRef.current) { localStreamRef.current.getTracks().forEach((t) => t.stop()); localStreamRef.current = null; }
    if (typeof window !== "undefined") sessionStorage.removeItem("omegle_room");
    pendingOffersRef.current = [];
    pendingCandidatesRef.current = [];
  }, []);

  const handleSkip = useCallback(() => {
    if (socket && isConnected && roomId) emit("skip");
    cleanupAll();
    router.push("/omegle");
  }, [socket, isConnected, roomId, emit, cleanupAll, router]);

  const handleStop = useCallback(() => {
    cleanupAll();
    router.push("/omegle");
  }, [cleanupAll, router]);

  const handleNewChat = useCallback(() => {
    cleanupAll();
    router.push("/omegle");
  }, [cleanupAll, router]);

  useEffect(() => {
    return () => cleanupAll();
  }, [cleanupAll]);

  if (!roomId) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <Card>
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Invalid Room</h2>
            <p className="text-muted-foreground mb-4">No room ID provided</p>
            <Button onClick={() => router.push("/omegle")}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">Random Video Chat</h1>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Badge variant={isVideoCallConnected ? "default" : "secondary"} className={isVideoCallConnected ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
              {connectionStatus}
            </Badge>
            <Badge variant="outline">Room: {roomId}</Badge>
            <Badge variant="outline">{userRole || "Unknown Role"}</Badge>
            {partnerId && <Badge variant="outline">Partner: {partnerId}</Badge>}
          </div>
          {mediaError && (
            <div className="mt-4 p-3 bg-red-100 text-red-800 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{mediaError}</span>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="text-center mb-2">
                <h3 className="text-foreground font-semibold">You ({userRole})</h3>
              </div>
              <div className="relative">
                <video ref={localVideoRef} autoPlay playsInline muted className="w-full aspect-video rounded-lg bg-muted object-cover" />
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
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="text-center mb-2">
                <h3 className="text-foreground font-semibold">Stranger</h3>
              </div>
              <div className="relative">
                <video ref={remoteVideoRef} autoPlay playsInline className="w-full aspect-video rounded-lg bg-muted object-cover" />
                {!isVideoCallConnected && (
                  <div className="absolute inset-0 flex items-center justify-center bg-muted/80 rounded-lg">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-2"></div>
                      <p className="text-muted-foreground text-sm">{roomJoined ? "Connecting to partner..." : "Joining room..."}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex flex-wrap justify-center gap-4">
              <Button variant={isAudioEnabled ? "default" : "secondary"} size="lg" onClick={toggleAudio} className="flex items-center gap-2" disabled={!localStreamReady || !!mediaError}>
                {isAudioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}{isAudioEnabled ? 'Mute' : 'Unmute'}
              </Button>

              <Button variant={isVideoEnabled ? "default" : "secondary"} size="lg" onClick={toggleVideo} className="flex items-center gap-2" disabled={!localStreamReady || !!mediaError}>
                {isVideoEnabled ? <VideoIcon className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}{isVideoEnabled ? 'Stop Video' : 'Start Video'}
              </Button>

              <Button variant="outline" size="lg" onClick={handleSkip} className="flex items-center gap-2"><SkipForward className="h-5 w-5" />Skip</Button>

              <Button variant="destructive" size="lg" onClick={handleStop} className="flex items-center gap-2"><StopCircle className="h-5 w-5" />Stop</Button>

              <Button variant="outline" size="lg" onClick={handleNewChat} className="flex items-center gap-2"><RotateCcw className="h-5 w-5" />New Chat</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
