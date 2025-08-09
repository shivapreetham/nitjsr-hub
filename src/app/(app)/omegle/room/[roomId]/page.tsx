"use client";

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Video, VideoOff, SkipForward, Home, Send, MessageCircle } from 'lucide-react';
import { useSocket } from '@/context/SocketProvider';

interface ChatMessage {
  message: string;
  from: string;
  timestamp: number;
  isOwn: boolean;
}

export default function RoomPage() {
  const router = useRouter();
  const params = useParams();
  const roomId = params?.roomId as string;
  const { socket, isConnected, userId, emit } = useSocket();

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  const [partnerId, setPartnerId] = useState<string>('');
  const [isInitiator, setIsInitiator] = useState<boolean>(false);
  const [connectionState, setConnectionState] = useState<string>('Connecting...');
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);
  const [videoEnabled, setVideoEnabled] = useState<boolean>(true);
  const [chatMessage, setChatMessage] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [showChat, setShowChat] = useState<boolean>(true);

  const iceCandidatesQueue = useRef<RTCIceCandidateInit[]>([]);

  const initializeMedia = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      setAudioEnabled(stream.getAudioTracks()[0]?.enabled ?? true);
      setVideoEnabled(stream.getVideoTracks()[0]?.enabled ?? true);
      return stream;
    } catch (err) {
      console.error('Media access error:', err);
      setConnectionState('Media access denied');
      throw err;
    }
  }, []);

  const createPeerConnection = useCallback(() => {
    const configuration: RTCConfiguration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:19302' },
      ],
    };

    const pc = new RTCPeerConnection(configuration);

    pc.onicecandidate = (ev) => {
      if (ev.candidate) {
        emit('ice_candidate', { roomId, candidate: ev.candidate });
      }
    };

    pc.ontrack = (ev) => {
      if (remoteVideoRef.current && ev.streams && ev.streams[0]) {
        remoteVideoRef.current.srcObject = ev.streams[0];
      }
    };

    pc.oniceconnectionstatechange = () => {
      setConnectionState(pc.iceConnectionState);
      console.log('ICE state:', pc.iceConnectionState);
    };

    pc.onconnectionstatechange = () => {
      console.log('Connection state:', pc.connectionState);
      if (pc.connectionState === 'connected') setConnectionState('Connected');
      if (pc.connectionState === 'failed') setConnectionState('Connection failed');
    };

    return pc;
  }, [emit, roomId]);

  useEffect(() => {
    if (!socket || !roomId) return;

    const handleRoomJoined = (data: { roomId: string; partnerId: string; isInitiator: boolean }) => {
      setPartnerId(data.partnerId);
      setIsInitiator(data.isInitiator);
      setConnectionState('Setting up connection...');
    };

    const handleOffer = async (data: { offer: RTCSessionDescriptionInit; from: string }) => {
      if (!pcRef.current) {
        try {
          const localStream = await initializeMedia();
          const pc = createPeerConnection();
          localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));
          pcRef.current = pc;
        } catch (err) {
          console.error('Failed to create peer connection on offer:', err);
          return;
        }
      }

      try {
        await pcRef.current!.setRemoteDescription(new RTCSessionDescription(data.offer));
        while (iceCandidatesQueue.current.length) {
          const candidate = iceCandidatesQueue.current.shift();
          if (candidate) await pcRef.current!.addIceCandidate(new RTCIceCandidate(candidate));
        }

        const answer = await pcRef.current!.createAnswer();
        await pcRef.current!.setLocalDescription(answer);
        emit('answer', { roomId, answer });
      } catch (err) {
        console.error('Error handling offer:', err);
      }
    };

    const handleAnswer = async (data: { answer: RTCSessionDescriptionInit; from: string }) => {
      try {
        if (!pcRef.current) {
          console.warn('Answer received but no peer connection present');
          return;
        }
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
        while (iceCandidatesQueue.current.length) {
          const candidate = iceCandidatesQueue.current.shift();
          if (candidate) await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        }
      } catch (err) {
        console.error('Error handling answer:', err);
      }
    };

    const handleIceCandidate = async (data: { candidate: RTCIceCandidateInit; from: string }) => {
      const candidate = data.candidate;
      if (!candidate) return;
      try {
        if (!pcRef.current || !pcRef.current.remoteDescription) {
          iceCandidatesQueue.current.push(candidate);
        } else {
          await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        }
      } catch (err) {
        console.error('Error adding ICE candidate:', err);
      }
    };

    const handlePartnerDisconnected = () => {
      setConnectionState('Partner disconnected');
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
      setTimeout(() => router.push('/omegle'), 1500);
    };

    const handlePartnerSkipped = () => {
      setConnectionState('Partner skipped');
      setTimeout(() => router.push('/omegle'), 1500);
    };

    const handleChatMessage = (data: { message: string; from: string; timestamp: number }) => {
      setChatMessages((prev) => [
        ...prev,
        { message: data.message, from: data.from, timestamp: data.timestamp, isOwn: false },
      ]);
    };

    const handleRoomError = (data: { message: string }) => {
      console.error('Room error:', data);
      router.push('/omegle');
    };

    socket.on('room_joined', handleRoomJoined);
    socket.on('offer', handleOffer);
    socket.on('answer', handleAnswer);
    socket.on('ice_candidate', handleIceCandidate);
    socket.on('partner_disconnected', handlePartnerDisconnected);
    socket.on('partner_skipped', handlePartnerSkipped);
    socket.on('chat_message', handleChatMessage);
    socket.on('room_error', handleRoomError);

    emit('join_room', { roomId });

    return () => {
      socket.off('room_joined', handleRoomJoined);
      socket.off('offer', handleOffer);
      socket.off('answer', handleAnswer);
      socket.off('ice_candidate', handleIceCandidate);
      socket.off('partner_disconnected', handlePartnerDisconnected);
      socket.off('partner_skipped', handlePartnerSkipped);
      socket.off('chat_message', handleChatMessage);
      socket.off('room_error', handleRoomError);
    };
  }, [socket, roomId, emit, initializeMedia, createPeerConnection, router]);

  useEffect(() => {
    if (!partnerId || pcRef.current) return;

    const setup = async () => {
      try {
        const stream = await initializeMedia();
        const pc = createPeerConnection();
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));
        pcRef.current = pc;

        if (isInitiator) {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          emit('offer', { roomId, offer });
        }

        while (iceCandidatesQueue.current.length && pcRef.current?.remoteDescription) {
          const candidate = iceCandidatesQueue.current.shift();
          if (candidate) await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        }
      } catch (err) {
        console.error('Setup error:', err);
        setConnectionState('Setup failed');
      }
    };

    setup();
  }, [partnerId, isInitiator, initializeMedia, createPeerConnection, emit, roomId]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const toggleAudio = () => {
    if (!localStreamRef.current) return;
    const audioTrack = localStreamRef.current.getAudioTracks()[0];
    if (!audioTrack) return;
    audioTrack.enabled = !audioTrack.enabled;
    setAudioEnabled(audioTrack.enabled);
  };

  const toggleVideo = () => {
    if (!localStreamRef.current) return;
    const videoTrack = localStreamRef.current.getVideoTracks()[0];
    if (!videoTrack) return;
    videoTrack.enabled = !videoTrack.enabled;
    setVideoEnabled(videoTrack.enabled);
  };

  const cleanup = () => {
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
  };

  const handleSkip = () => {
    emit('skip');
    cleanup();
    router.push('/omegle');
  };

  const handleGoHome = () => {
    cleanup();
    router.push('/omegle');
  };

  const sendMessage = () => {
    if (!chatMessage.trim() || !userId) return;
    const msg: ChatMessage = {
      message: chatMessage,
      from: userId,
      timestamp: Date.now(),
      isOwn: true,
    };
    setChatMessages((prev) => [...prev, msg]);
    emit('chat_message', { roomId, message: chatMessage });
    setChatMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') sendMessage();
  };

  useEffect(() => {
    return () => {
      cleanup();
      if (socket) {
        try {
          emit('skip');
        } catch {}
      }
    };
  }, [socket, emit]);

  if (!roomId) {
    return <div className="flex-1 flex items-center justify-center"><p>Invalid room</p></div>;
  }

  return (
    <div className="flex-1 flex flex-col p-4 space-y-4 h-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Room: {roomId.slice(0, 8)}</h1>
          <Badge variant="outline">{connectionState}</Badge>
        </div>
        <Button onClick={() => setShowChat(!showChat)} variant="outline" size="sm">
          <MessageCircle className="h-4 w-4 mr-2" />
          Chat {chatMessages.length > 0 && `(${chatMessages.length})`}
        </Button>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 min-h-0">
        <div className={`${showChat ? 'lg:col-span-3' : 'lg:col-span-4'} space-y-4 min-h-0`}>
          <Card className="bg-black flex-1">
            <CardContent className="p-0 h-full">
              <div className="relative h-full min-h-[300px]">
                <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover rounded-lg" />
                <div className="absolute top-2 left-2"><Badge variant="secondary">Stranger</Badge></div>
                {connectionState !== 'Connected' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                    <p className="text-white text-lg">{connectionState}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black">
            <CardContent className="p-0">
              <div className="relative h-48">
                <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover rounded-lg" />
                <div className="absolute top-2 left-2"><Badge variant="default">You</Badge></div>
                {!videoEnabled && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 rounded-lg">
                    <VideoOff className="h-8 w-8 text-white" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {showChat && (
          <div className="lg:col-span-1 flex">
            <Card className="flex-1 flex flex-col min-h-0">
              <CardContent className="p-4 flex-1 flex flex-col min-h-0">
                <h3 className="font-semibold mb-4">Chat</h3>
                <div ref={chatContainerRef} className="flex-1 overflow-y-auto space-y-2 mb-4 min-h-0">
                  {chatMessages.length === 0 ? (
                    <p className="text-muted-foreground text-sm text-center">No messages yet. Say hi!</p>
                  ) : (
                    chatMessages.map((msg, i) => (
                      <div
                        key={i}
                        className={`p-2 rounded-lg max-w-xs text-sm ${
                          msg.isOwn ? 'bg-primary text-primary-foreground ml-auto' : 'bg-muted'
                        }`}
                      >
                        <p>{msg.message}</p>
                        <p className="text-xs opacity-70 mt-1">{new Date(msg.timestamp).toLocaleTimeString()}</p>
                      </div>
                    ))
                  )}
                </div>

                <div className="flex gap-2">
                  <Input
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    maxLength={500}
                  />
                  <Button onClick={sendMessage} size="sm">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-4 pt-4 border-t">
        <Button onClick={toggleAudio} variant={audioEnabled ? 'default' : 'destructive'} size="lg">
          {audioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
        </Button>
        <Button onClick={toggleVideo} variant={videoEnabled ? 'default' : 'destructive'} size="lg">
          {videoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
        </Button>
        <Button onClick={handleSkip} variant="outline" size="lg">
          <SkipForward className="h-5 w-5 mr-2" /> Next
        </Button>
        <Button onClick={handleGoHome} variant="secondary" size="lg">
          <Home className="h-5 w-5 mr-2" /> Home
        </Button>
      </div>
    </div>
  );
}