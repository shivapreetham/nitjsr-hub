// app/omegle/room/[roomId]/page.tsx
"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SkipForward, StopCircle, Mic, VideoIcon, RotateCcw } from "lucide-react";
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
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("Initializing...");
  const [mediaError, setMediaError] = useState("");
  const [partnerId, setPartnerId] = useState("");

  const pendingOffers = useRef<any[]>([]);
  const pendingCandidates = useRef<any[]>([]);
  const joined = useRef(false);

  const ICE_MAX = 4;
  const iceAttempts = useRef(0);

  const buildIceServers = () => {
    const ice: RTCIceServer[] = [{ urls: "stun:stun.l.google.com:19302" }, { urls: "stun:stun1.l.google.com:19302" }];
    const turnUrl = process.env.NEXT_PUBLIC_TURN_URL;
    const turnUser = process.env.NEXT_PUBLIC_TURN_USERNAME;
    const turnCred = process.env.NEXT_PUBLIC_TURN_CREDENTIAL;
    if (turnUrl && turnUser && turnCred) {
      ice.push({ urls: turnUrl, username: turnUser, credential: turnCred });
      console.log("[ROOM] Using TURN:", turnUrl);
    } else {
      console.log("[ROOM] No TURN configured");
    }
    return ice;
  };

  const initLocalMedia = useCallback(async () => {
    if (localStreamRef.current) return localStreamRef.current;
    setStatus("Requesting camera/microphone...");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      return stream;
    } catch (e: any) {
      setMediaError("Camera/microphone error: " + (e?.message || e));
      setStatus("Media error");
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
      if (pc.iceConnectionState === "connected" || pc.iceConnectionState === "completed") {
        setStatus("Connected");
        iceAttempts.current = 0;
      } else if (pc.iceConnectionState === "disconnected" || pc.iceConnectionState === "failed") {
        setStatus("Disconnected - attempting recovery...");
        attemptIceRestart();
      } else if (pc.iceConnectionState === "checking") {
        setStatus("Establishing...");
      } else {
        setStatus("Connection: " + pc.iceConnectionState);
      }
    };
    pc.ontrack = (ev) => {
      if (remoteVideoRef.current && ev.streams && ev.streams[0]) {
        remoteVideoRef.current.srcObject = ev.streams[0];
      }
    };
    return pc;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  const attemptIceRestart = useCallback(async () => {
    if (!pcRef.current) return;
    if (iceAttempts.current >= ICE_MAX) {
      setStatus("Unable to recover. Try New Chat or reload.");
      return;
    }
    iceAttempts.current++;
    const backoff = 2000 * Math.pow(1.5, iceAttempts.current - 1);
    setTimeout(async () => {
      const pc = pcRef.current;
      if (!pc) return;
      try { if (typeof pc.restartIce === 'function') pc.restartIce(); } catch(e) { console.warn(e); }
      if (isInitiator) {
        const offer = await pc.createOffer({ iceRestart: true });
        await pc.setLocalDescription(offer);
        emit("offer", { room: roomId, offer });
        setStatus("Sent re-offer (initiator)");
      } else {
        emit("request_reoffer", { room: roomId });
        setStatus("Requested partner to re-offer");
      }
      // check after a bit
      setTimeout(() => {
        const cur = pcRef.current;
        if (!cur) return;
        if (cur.iceConnectionState !== 'connected' && cur.iceConnectionState !== 'completed') {
          attemptIceRestart();
        } else {
          iceAttempts.current = 0;
        }
      }, 3000);
    }, backoff);
  }, [emit, isInitiator, roomId]);

  // Socket event handlers
  useEffect(() => {
    if (!socket || !roomId) return;

    const onRoomAssigned = (d:any) => {
      setIsInitiator(Boolean(d.initiator));
      setRole(d.role || "");
      setPartnerId(d.partnerId || "");
      joined.current = true;
    };
    const onRoomJoined = (d:any) => {
      setIsInitiator(Boolean(d.initiator));
      setRole(d.role || "");
      setPartnerId(d.partnerId || "");
      joined.current = true;
    };
    const onOffer = async (d:any) => {
      if (!pcRef.current) { pendingOffers.current.push(d); return; }
      try {
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(d.offer));
        const answer = await pcRef.current.createAnswer();
        await pcRef.current.setLocalDescription(answer);
        emit("answer", { room: roomId, answer });
      } catch(e) { console.error(e); }
    };
    const onAnswer = async (d:any) => {
      if (!pcRef.current) { console.warn("answer arrived but pc missing"); return; }
      try { await pcRef.current.setRemoteDescription(new RTCSessionDescription(d.answer)); } catch(e) { console.error(e); }
    };
    const onIce = async (d:any) => {
      if (!pcRef.current) { pendingCandidates.current.push(d); return; }
      try { await pcRef.current.addIceCandidate(new RTCIceCandidate(d.candidate)); } catch(e) { console.error(e); }
    };
    const onPartnerDisconnected = (d:any) => { setStatus("Partner disconnected"); };
    const onPartnerReconnected = (d:any) => {
      if (isInitiator && pcRef.current) {
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
      } catch(e) { console.error(e); }
    };

    socket.on("room_assigned", onRoomAssigned);
    socket.on("room_joined", onRoomJoined);
    socket.on("offer", onOffer);
    socket.on("answer", onAnswer);
    socket.on("ice-candidate", onIce);
    socket.on("partner_disconnected", onPartnerDisconnected);
    socket.on("partner_reconnected", onPartnerReconnected);
    socket.on("request_reoffer", onRequestReoffer);

    return () => {
      socket.off("room_assigned", onRoomAssigned);
      socket.off("room_joined", onRoomJoined);
      socket.off("offer", onOffer);
      socket.off("answer", onAnswer);
      socket.off("ice-candidate", onIce);
      socket.off("partner_disconnected", onPartnerDisconnected);
      socket.off("partner_reconnected", onPartnerReconnected);
      socket.off("request_reoffer", onRequestReoffer);
    };
  }, [socket, roomId, emit, isInitiator]);

  // Join room when socket ready
  useEffect(() => {
    if (!socket || !roomId || !isConnected || joined.current) return;
    setStatus("Joining room...");
    emit("join_room", { room: roomId, token });
  }, [socket, roomId, isConnected, emit, token]);

  // Setup peer when joined
  useEffect(() => {
    if (!joined.current || !isConnected || pcRef.current) return;
    let cancelled = false;
    (async () => {
      try {
        setStatus("Requesting camera...");
        const stream = await initLocalMedia();
        if (cancelled) return;
        const pc = createPC();
        pcRef.current = pc;
        if (stream) stream.getTracks().forEach(t => pc.addTrack(t, stream));
        // apply buffered ICE candidates
        if (pendingCandidates.current.length) {
          for (const c of pendingCandidates.current) {
            try { await pc.addIceCandidate(new RTCIceCandidate(c.candidate)); } catch(e) { console.warn(e); }
          }
          pendingCandidates.current = [];
        }
        if (isInitiator) {
          setStatus("Creating offer...");
          const offer = await pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true });
          await pc.setLocalDescription(offer);
          emit("offer", { room: roomId, offer });
        } else {
          setStatus("Waiting for offer...");
          // process buffered offers
          if (pendingOffers.current.length) {
            for (const p of pendingOffers.current) {
              await pc.setRemoteDescription(new RTCSessionDescription(p.offer));
              const answer = await pc.createAnswer();
              await pc.setLocalDescription(answer);
              emit("answer", { room: roomId, answer });
            }
            pendingOffers.current = [];
          }
        }
      } catch(e) {
        console.error("[ROOM] setup error", e);
        setStatus("Setup failed: " + (e?.message || e));
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
    if (localStreamRef.current) { localStreamRef.current.getTracks().forEach(t => t.stop()); localStreamRef.current = null; }
    if (typeof window !== 'undefined') sessionStorage.removeItem("omegle_room");
  }, []);

  const handleSkip = useCallback(() => { if (socket && isConnected) emit("skip"); cleanup(); router.push("/omegle"); }, [socket, isConnected, emit, cleanup, router]);
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
            <Badge>{status}</Badge>
            <Badge>Role: {role || (isInitiator ? "initiator" : "responder")}</Badge>
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
