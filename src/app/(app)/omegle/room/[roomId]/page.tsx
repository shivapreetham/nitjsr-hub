// app/omegle/room/[roomId]/page.tsx
"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SkipForward, StopCircle, Mic, MicOff, VideoOff, VideoIcon, RotateCcw, AlertCircle } from "lucide-react";
import { useSocket } from "@/context/SocketProvider";

export default function RoomPage({ params }: { params: { roomId: string } }) {
  const router = useRouter();
  const roomId = params.roomId;
  const { socket, emit, token, isConnected } = useSocket();

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  const [isInitiator, setIsInitiator] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [connectionStatus, setConnectionStatus] = useState("Initializing...");
  const [localReady, setLocalReady] = useState(false);
  const [mediaError, setMediaError] = useState("");
  const [isCallConnected, setIsCallConnected] = useState(false);
  const [partnerId, setPartnerId] = useState("");

  const pendingOffersRef = useRef<any[]>([]);
  const pendingCandidatesRef = useRef<any[]>([]);
  const joinedRef = useRef(false);

  const ICE_MAX = 4;
  const iceAttemptsRef = useRef(0);

  const buildIceServers = () => {
    const ice: RTCIceServer[] = [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
    ];
    try {
      const turnUrl = process.env.NEXT_PUBLIC_TURN_URL;
      const turnUser = process.env.NEXT_PUBLIC_TURN_USERNAME;
      const turnCred = process.env.NEXT_PUBLIC_TURN_CREDENTIAL;
      if (turnUrl && turnUser && turnCred) {
        ice.push({ urls: turnUrl, username: turnUser, credential: turnCred });
        console.log("[ROOM] Using TURN:", turnUrl);
      } else {
        console.log("[ROOM] No TURN configured");
      }
    } catch(e) { console.warn(e); }
    return ice;
  };

  const initLocalMedia = useCallback(async () => {
    if (localStreamRef.current) return localStreamRef.current;
    setConnectionStatus("Requesting camera/microphone...");
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = s;
      setLocalReady(true);
      if (localVideoRef.current) localVideoRef.current.srcObject = s;
      return s;
    } catch (e: any) {
      console.error("[ROOM] media error", e);
      setMediaError("Camera/microphone error: " + (e?.message || e));
      setConnectionStatus("Media error");
      throw e;
    }
  }, []);

  const createPC = useCallback(() => {
    const pc = new RTCPeerConnection({ iceServers: buildIceServers(), iceCandidatePoolSize: 10 });

    pc.onicecandidate = (ev) => {
      if (ev.candidate && roomId) emit("ice-candidate", { room: roomId, candidate: ev.candidate });
    };

    pc.oniceconnectionstatechange = () => {
      console.log("[ROOM] ICE state", pc.iceConnectionState);
      switch (pc.iceConnectionState) {
        case "connected":
        case "completed":
          iceAttemptsRef.current = 0;
          setIsCallConnected(true);
          setConnectionStatus("Connected");
          break;
        case "disconnected":
        case "failed":
          setIsCallConnected(false);
          setConnectionStatus("Disconnected - attempting recovery...");
          attemptIceRestart();
          break;
        case "checking":
          setConnectionStatus("Establishing...");
          break;
        default:
          setConnectionStatus("Connection: " + pc.iceConnectionState);
      }
    };

    pc.ontrack = (ev) => {
      if (remoteVideoRef.current && ev.streams && ev.streams[0]) {
        remoteVideoRef.current.srcObject = ev.streams[0];
      }
    };

    return pc;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, emit]);

  const attemptIceRestart = useCallback(async () => {
    if (!pcRef.current) return;
    if (iceAttemptsRef.current >= ICE_MAX) {
      setConnectionStatus("Unable to recover. Try New Chat or reload.");
      return;
    }
    iceAttemptsRef.current++;
    const backoff = 2000 * Math.pow(1.5, iceAttemptsRef.current - 1);
    console.log(`[ROOM] schedule ice restart #${iceAttemptsRef.current} in ${Math.round(backoff)}ms`);
    setTimeout(async () => {
      const pc = pcRef.current;
      if (!pc) return;
      if (typeof pc.restartIce === 'function') {
        try { pc.restartIce(); console.log("[ROOM] pc.restartIce() called"); } catch(e) { console.warn(e); }
      }
      if (isInitiator) {
        try {
          const offer = await pc.createOffer({ iceRestart: true });
          await pc.setLocalDescription(offer);
          emit("offer", { room: roomId, offer });
          setConnectionStatus("Sent re-offer (initiator)");
        } catch (e) { console.error(e); }
      } else {
        // ask server to request initiator to re-offer
        emit("request_reoffer", { room: roomId });
        setConnectionStatus("Requested partner re-offer");
      }

      // if still not connected, schedule next attempt
      setTimeout(() => {
        const nowPc = pcRef.current;
        if (!nowPc) return;
        if (nowPc.iceConnectionState === 'connected' || nowPc.iceConnectionState === 'completed') {
          iceAttemptsRef.current = 0;
          return;
        } else {
          attemptIceRestart();
        }
      }, 3000);
    }, backoff);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitiator, roomId, emit]);

  useEffect(() => {
    if (!socket || !roomId) return;
    const onAssigned = (d: any) => {
      setIsInitiator(Boolean(d.initiator));
      setUserRole(d.role || "");
      setPartnerId(d.partnerId || "");
      joinedRef.current = true;
    };
    const onJoined = (d: any) => {
      setIsInitiator(Boolean(d.initiator));
      setUserRole(d.role || "");
      setPartnerId(d.partnerId || "");
      joinedRef.current = true;
    };
    const onOffer = async (d: any) => {
      if (!pcRef.current) {
        pendingOffersRef.current.push(d);
        return;
      }
      try {
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(d.offer));
        const answer = await pcRef.current.createAnswer();
        await pcRef.current.setLocalDescription(answer);
        emit("answer", { room: roomId, answer });
      } catch (e) { console.error(e); }
    };
    const onAnswer = async (d: any) => {
      if (!pcRef.current) { console.warn("answer arrived but pc missing"); return; }
      try { await pcRef.current.setRemoteDescription(new RTCSessionDescription(d.answer)); } catch(e){ console.error(e); }
    };
    const onIce = async (d: any) => {
      if (!pcRef.current) { pendingCandidatesRef.current.push(d); return; }
      try { await pcRef.current.addIceCandidate(new RTCIceCandidate(d.candidate)); } catch(e){ console.error(e); }
    };
    const onPartnerDisconnected = (d:any) => { setConnectionStatus("Partner disconnected"); setIsCallConnected(false); };
    const onPartnerReconnected = (d:any) => {
      // initiator may re-offer to re-establish connection
      if (isInitiator && pcRef.current && roomId) {
        pcRef.current.createOffer({ iceRestart: true }).then(async (off) => {
          await pcRef.current?.setLocalDescription(off);
          emit("offer", { room: roomId, offer: off });
        }).catch(console.error);
      }
    };
    const onRequestReoffer = async (d:any) => {
      if (!isInitiator || !pcRef.current) return;
      try {
        const offer = await pcRef.current.createOffer({ iceRestart: true });
        await pcRef.current.setLocalDescription(offer);
        emit("offer", { room: roomId, offer });
      } catch (e) { console.error(e); }
    };

    socket.on("room_assigned", onAssigned);
    socket.on("room_joined", onJoined);
    socket.on("offer", onOffer);
    socket.on("answer", onAnswer);
    socket.on("ice-candidate", onIce);
    socket.on("partner_disconnected", onPartnerDisconnected);
    socket.on("partner_reconnected", onPartnerReconnected);
    socket.on("request_reoffer", onRequestReoffer);

    return () => {
      socket.off("room_assigned", onAssigned);
      socket.off("room_joined", onJoined);
      socket.off("offer", onOffer);
      socket.off("answer", onAnswer);
      socket.off("ice-candidate", onIce);
      socket.off("partner_disconnected", onPartnerDisconnected);
      socket.off("partner_reconnected", onPartnerReconnected);
      socket.off("request_reoffer", onRequestReoffer);
    };
  }, [socket, roomId, emit, isInitiator]);

  // join room
  useEffect(() => {
    if (!socket || !roomId || !isConnected || joinedRef.current) return;
    setConnectionStatus("Joining room...");
    emit("join_room", { room: roomId });
  }, [socket, roomId, isConnected, emit]);

  // setup pc after join
  useEffect(() => {
    if (!joinedRef.current || !isConnected || pcRef.current) return;
    let cancelled = false;

    (async () => {
      try {
        setConnectionStatus("Getting media...");
        const stream = await initLocalMedia();
        if (cancelled) return;
        const pc = createPC();
        pcRef.current = pc;

        // add local tracks
        if (stream) stream.getTracks().forEach(t => pc.addTrack(t, stream));

        // add buffered candidates if any
        if (pendingCandidatesRef.current.length) {
          for (const c of pendingCandidatesRef.current) {
            try { await pc.addIceCandidate(new RTCIceCandidate(c.candidate)); } catch(e){ console.warn(e); }
          }
          pendingCandidatesRef.current = [];
        }

        if (isInitiator) {
          setConnectionStatus("Creating offer...");
          const offer = await pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true });
          await pc.setLocalDescription(offer);
          emit("offer", { room: roomId, offer });
        } else {
          setConnectionStatus("Waiting for offer...");
          // process pending offers
          if (pendingOffersRef.current.length) {
            for (const p of pendingOffersRef.current) {
              try {
                await pc.setRemoteDescription(new RTCSessionDescription(p.offer));
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                emit("answer", { room: roomId, answer });
              } catch(e) { console.error(e); }
            }
            pendingOffersRef.current = [];
          }
        }
      } catch (e) {
        console.error("[ROOM] setup error", e);
        setConnectionStatus("Setup failed: " + (e?.message || e));
      }
    })();

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitiator, isConnected, roomId]);

  const toggleAudio = useCallback(() => {
    if (localStreamRef.current) {
      const t = localStreamRef.current.getAudioTracks()[0];
      if (t) t.enabled = !t.enabled;
    }
  }, []);

  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      const t = localStreamRef.current.getVideoTracks()[0];
      if (t) t.enabled = !t.enabled;
    }
  }, []);

  const cleanup = useCallback(() => {
    if (pcRef.current) { pcRef.current.close(); pcRef.current = null; }
    if (localStreamRef.current) { localStreamRef.current.getTracks().forEach(t=>t.stop()); localStreamRef.current = null; }
    if (typeof window !== 'undefined') sessionStorage.removeItem("omegle_room");
  }, []);

  const handleSkip = useCallback(() => {
    if (socket && isConnected && roomId) emit("skip");
    cleanup();
    router.push("/omegle");
  }, [socket, isConnected, roomId, emit, cleanup, router]);

  const handleStop = useCallback(() => { cleanup(); router.push("/omegle"); }, [cleanup, router]);
  const handleNewChat = useCallback(() => { cleanup(); router.push("/omegle"); }, [cleanup, router]);

  useEffect(() => { return () => cleanup(); }, [cleanup]);

  if (!roomId) return <div className="min-h-screen flex items-center justify-center">Invalid room</div>;

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">Room: {roomId}</h1>
          <div className="flex gap-2 justify-center mt-2">
            <Badge>{connectionStatus}</Badge>
            <Badge>Role: {userRole || (isInitiator ? "initiator" : "responder")}</Badge>
            {partnerId && <Badge>Partner: {partnerId}</Badge>}
          </div>
          {mediaError && <div className="mt-3 text-red-600">{mediaError}</div>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <Card>
            <CardContent>
              <h3>Your video</h3>
              <video ref={localVideoRef} autoPlay playsInline muted className="w-full aspect-video bg-black" />
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <h3>Remote</h3>
              <video ref={remoteVideoRef} autoPlay playsInline className="w-full aspect-video bg-black" />
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-3 justify-center">
          <Button onClick={toggleAudio}><Mic/></Button>
          <Button onClick={toggleVideo}><VideoIcon/></Button>
          <Button onClick={handleSkip}><SkipForward/>Skip</Button>
          <Button onClick={handleStop}><StopCircle/>Stop</Button>
          <Button onClick={handleNewChat}><RotateCcw/>New Chat</Button>
        </div>
      </div>
    </div>
  );
}
