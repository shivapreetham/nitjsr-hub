"use client";

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  SkipForward, 
  Home, 
  Send,
  MessageCircle 
} from 'lucide-react';
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

  // refs
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  // state
  const [partnerId, setPartnerId] = useState<string>('');
  const [isInitiator, setIsInitiator] = useState(false);
  const [connectionState, setConnectionState] = useState('Connecting...');
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [showChat, setShowChat] = useState(false);

  // ICE queue, store RTCIceCandidateInit objects until pc is ready
  const iceCandidatesQueue = useRef<RTCIceCandidateInit[]>([]);

  // Initialize media (ask permissions)
  const initializeMedia = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;

      const audioTrack = stream.getAudioTracks()[0];
      const videoTrack = stream.getVideoTracks()[0];
      setAudioEnabled(audioTrack ? audioTrack.enabled : true);
      setVideoEnabled(videoTrack ? videoTrack.enabled : true);

      return stream;
    } catch (error) {
      console.error('Error accessing media:', error);
      setConnectionState('Media access denied');
      throw error;
    }
  }, []);

  // Create a new RTCPeerConnection configured and wired
  const createPeerConnection = useCallback(() => {
    const configuration: RTCConfiguration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    };

    const pc = new RTCPeerConnection(configuration);

    // send ice candidates to server
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        emit('ice_candidate', {
          roomId,
          candidate: event.candidate
        });
      }
    };

    // attach remote stream to remote video element
    pc.ontrack = (event) => {
      if (remoteVideoRef.current && event.streams && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log('ICE connection state:', pc.iceConnectionState);
      setConnectionState(pc.iceConnectionState);
    };

    pc.onconnectionstatechange = () => {
      console.log('Connection state:', pc.connectionState);
      if (pc.connectionState === 'connected') setConnectionState('Connected');
      else if (pc.connectionState === 'failed') setConnectionState('Connection failed');
    };

    return pc;
  }, [emit, roomId]);

  // Socket event handlers - set up once socket & roomId exist
  useEffect(() => {
    if (!socket || !roomId) return;

    const handleRoomJoined = (data: any) => {
      setPartnerId(data.partnerId);
      setIsInitiator(Boolean(data.isInitiator));
      setConnectionState('Setting up connection...');
    };

    const handleOffer = async (data: any) => {
      // If pc isn't created yet (offer arrived first), create PC + local media now
      if (!pcRef.current) {
        try {
          const stream = await initializeMedia();
          const pc = createPeerConnection();
          stream.getTracks().forEach(track => pc.addTrack(track, stream));
          pcRef.current = pc;
        } catch (err) {
          console.error('Failed to prepare pc on offer', err);
          return;
        }
      }

      try {
        await pcRef.current!.setRemoteDescription(data.offer);

        // drain any queued ICE candidates
        while (iceCandidatesQueue.current.length > 0) {
          const candidate = iceCandidatesQueue.current.shift();
          if (candidate) await pcRef.current!.addIceCandidate(new RTCIceCandidate(candidate));
        }

        const answer = await pcRef.current!.createAnswer();
        await pcRef.current!.setLocalDescription(answer);

        emit('answer', {
          roomId,
          answer: answer
        });
      } catch (error) {
        console.error('Error handling offer:', error);
      }
    };

    const handleAnswer = async (data: any) => {
      if (!pcRef.current) {
        console.warn('Answer received but pcRef is null');
        return;
      }
      try {
        await pcRef.current.setRemoteDescription(data.answer);

        // drain queued ICEs
        while (iceCandidatesQueue.current.length > 0) {
          const candidate = iceCandidatesQueue.current.shift();
          if (candidate) await pcRef.current!.addIceCandidate(new RTCIceCandidate(candidate));
        }
      } catch (error) {
        console.error('Error handling answer:', error);
      }
    };

    const handleIceCandidate = async (data: any) => {
      if (!data || !data.candidate) return;

      // If PC isn't ready or remoteDescription not set, keep candidate in queue
      if (!pcRef.current || !pcRef.current.remoteDescription) {
        iceCandidatesQueue.current.push(data.candidate);
        return;
      }

      try {
        await pcRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
      } catch (error) {
        console.error('Error handling ICE candidate:', error);
      }
    };

    const handlePartnerDisconnected = () => {
      setConnectionState('Partner disconnected');
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    };

    const handlePartnerSkipped = () => {
      setConnectionState('Partner skipped');
      setTimeout(() => router.push('/omegle'), 2000);
    };

    const handleChatMessage = (data: any) => {
      setChatMessages(prev => [...prev, {
        message: data.message,
        from: data.from,
        timestamp: data.timestamp,
        isOwn: false
      }]);
    };

    const handleRoomError = (data: any) => {
      console.error('Room error:', data.message);
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

    // tell server we want to join this room (server will validate)
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

  // When partnerId set -> initialize local media + pc (if initiator createOffer)
  useEffect(() => {
    if (!partnerId || pcRef.current) return;

    const setupConnection = async () => {
      try {
        const stream = await initializeMedia();
        const pc = createPeerConnection();

        // add local tracks to PC
        stream.getTracks().forEach(track => pc.addTrack(track, stream));
        pcRef.current = pc;

        if (isInitiator) {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);

          emit('offer', {
            roomId,
            offer: offer
          });
        }
      } catch (error) {
        console.error('Error setting up connection:', error);
        setConnectionState('Setup failed');
      }
    };

    setupConnection();
  }, [partnerId, isInitiator, initializeMedia, createPeerConnection, emit, roomId]);

  // Scroll chat to bottom on new message
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Media controls
  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setVideoEnabled(videoTrack.enabled);
      }
    }
  };

  // Cleanup pc & tracks
  const cleanup = () => {
    if (pcRef.current) {
      try { pcRef.current.close(); } catch (e) { /* ignore */ }
      pcRef.current = null;
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }

    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    iceCandidatesQueue.current = [];
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
    if (!chatMessage.trim()) return;

    const message = {
      message: chatMessage,
      from: userId || '',
      timestamp: Date.now(),
      isOwn: true
    };

    setChatMessages(prev => [...prev, message]);
    emit('chat_message', { roomId, message: chatMessage });
    setChatMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  // Cleanup on unmount (leave room)
  useEffect(() => {
    return () => {
      cleanup();
      try { emit('skip'); } catch {}
    };
  }, [emit]);

  if (!roomId) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p>Invalid room</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-4 space-y-4 h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Room: {roomId.slice(0, 8)}</h1>
          <Badge variant="outline">
            {connectionState}
          </Badge>
        </div>

        <Button
          onClick={() => setShowChat(!showChat)}
          variant="outline"
          size="sm"
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          Chat {chatMessages.length > 0 && `(${chatMessages.length})`}
        </Button>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 min-h-0">
        {/* Video Section */}
        <div className={`${showChat ? 'lg:col-span-3' : 'lg:col-span-4'} space-y-4 min-h-0`}>
          {/* Remote Video */}
          <Card className="bg-black flex-1">
            <CardContent className="p-0 h-full">
              <div className="relative h-full min-h-[300px]">
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover rounded-lg"
                />
                <div className="absolute top-2 left-2">
                  <Badge variant="secondary">Partner</Badge>
                </div>
                {connectionState !== 'Connected' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                    <p className="text-white text-lg">{connectionState}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Local Video */}
          <Card className="bg-black">
            <CardContent className="p-0">
              <div className="relative h-48">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover rounded-lg"
                />
                <div className="absolute top-2 left-2">
                  <Badge variant="default">You</Badge>
                </div>
                {!videoEnabled && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 rounded-lg">
                    <VideoOff className="h-8 w-8 text-white" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chat Section */}
        {showChat && (
          <div className="lg:col-span-1 flex">
            <Card className="flex-1 flex flex-col min-h-0">
              <CardContent className="p-4 flex-1 flex flex-col min-h-0">
                <h3 className="font-semibold mb-4">Chat</h3>

                {/* Messages */}
                <div 
                  ref={chatContainerRef}
                  className="flex-1 overflow-y-auto space-y-2 mb-4 min-h-0"
                >
                  {chatMessages.length === 0 ? (
                    <p className="text-muted-foreground text-sm text-center">
                      No messages yet. Start the conversation!
                    </p>
                  ) : (
                    chatMessages.map((msg, index) => (
                      <div
                        key={index}
                        className={`p-2 rounded-lg max-w-xs text-sm ${
                          msg.isOwn
                            ? 'bg-primary text-primary-foreground ml-auto'
                            : 'bg-muted'
                        }`}
                      >
                        <p>{msg.message}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                {/* Message Input */}
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

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 pt-4 border-t">
        <Button
          onClick={toggleAudio}
          variant={audioEnabled ? "default" : "destructive"}
          size="lg"
        >
          {audioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
        </Button>

        <Button
          onClick={toggleVideo}
          variant={videoEnabled ? "default" : "destructive"}
          size="lg"
        >
          {videoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
        </Button>

        <Button
          onClick={handleSkip}
          variant="outline"
          size="lg"
        >
          <SkipForward className="h-5 w-5 mr-2" />
          Next
        </Button>

        <Button
          onClick={handleGoHome}
          variant="secondary"
          size="lg"
        >
          <Home className="h-5 w-5 mr-2" />
          Home
        </Button>
      </div>
    </div>
  );
}
