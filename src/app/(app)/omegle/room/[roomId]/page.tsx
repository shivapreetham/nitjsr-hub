"use client";

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Video, VideoOff, SkipForward, Home, Send, MessageCircle, AlertCircle } from 'lucide-react';
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

  // Video refs
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  
  // WebRTC refs
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const iceCandidatesQueueRef = useRef<RTCIceCandidateInit[]>([]);
  
  // Chat refs
  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  // State
  const [partnerId, setPartnerId] = useState<string>('');
  const [isInitiator, setIsInitiator] = useState<boolean>(false);
  const [connectionState, setConnectionState] = useState<string>('Initializing...');
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);
  const [videoEnabled, setVideoEnabled] = useState<boolean>(true);
  const [chatMessage, setChatMessage] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [showChat, setShowChat] = useState<boolean>(true);
  const [mediaError, setMediaError] = useState<string>('');
  const [isSetupComplete, setIsSetupComplete] = useState<boolean>(false);

  // WebRTC configuration
  const rtcConfiguration: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
    ],
    iceCandidatePoolSize: 10,
  };

  // Initialize media
  const initializeMedia = useCallback(async (): Promise<MediaStream | null> => {
    try {
      console.log('Initializing media...');
      setConnectionState('Getting camera and microphone...');
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 }, 
          height: { ideal: 480 },
          facingMode: 'user'
        }, 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      localStreamRef.current = stream;
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      setAudioEnabled(stream.getAudioTracks()[0]?.enabled ?? false);
      setVideoEnabled(stream.getVideoTracks()[0]?.enabled ?? false);
      setMediaError('');
      
      console.log('Media initialized successfully');
      return stream;
    } catch (err: any) {
      console.error('Media access error:', err);
      let errorMessage = 'Failed to access camera/microphone';
      
      if (err.name === 'NotAllowedError') {
        errorMessage = 'Camera/microphone access denied. Please allow permissions and refresh.';
      } else if (err.name === 'NotFoundError') {
        errorMessage = 'No camera/microphone found. Please connect a device.';
      } else if (err.name === 'NotReadableError') {
        errorMessage = 'Camera/microphone is being used by another application.';
      }
      
      setMediaError(errorMessage);
      setConnectionState('Media access failed');
      return null;
    }
  }, []);

  // Create peer connection
  const createPeerConnection = useCallback((): RTCPeerConnection => {
    console.log('Creating peer connection...');
    const pc = new RTCPeerConnection(rtcConfiguration);

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('Sending ICE candidate:', event.candidate);
        emit('ice_candidate', { roomId, candidate: event.candidate });
      }
    };

    pc.ontrack = (event) => {
      console.log('Received remote track:', event.streams);
      if (event.streams && event.streams[0] && remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
        setConnectionState('Connected');
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log('ICE connection state:', pc.iceConnectionState);
      
      switch (pc.iceConnectionState) {
        case 'checking':
          setConnectionState('Connecting...');
          break;
        case 'connected':
        case 'completed':
          setConnectionState('Connected');
          break;
        case 'disconnected':
          setConnectionState('Connection lost');
          break;
        case 'failed':
          setConnectionState('Connection failed');
          // Attempt to restart ICE
          pc.restartIce();
          break;
        case 'closed':
          setConnectionState('Connection closed');
          break;
      }
    };

    pc.onconnectionstatechange = () => {
      console.log('Connection state:', pc.connectionState);
      
      if (pc.connectionState === 'failed') {
        console.log('Connection failed, attempting to restart ICE');
        pc.restartIce();
      }
    };

    return pc;
  }, [emit, roomId]);

  // Process queued ICE candidates
  const processIceCandidatesQueue = useCallback(async () => {
    if (!pcRef.current || !pcRef.current.remoteDescription) return;
    
    console.log('Processing queued ICE candidates:', iceCandidatesQueueRef.current.length);
    
    while (iceCandidatesQueueRef.current.length > 0) {
      const candidate = iceCandidatesQueueRef.current.shift();
      if (candidate) {
        try {
          await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
          console.log('Added queued ICE candidate');
        } catch (err) {
          console.error('Error adding queued ICE candidate:', err);
        }
      }
    }
  }, []);

  // Socket event handlers
  useEffect(() => {
    if (!socket || !roomId || !userId) return;

    console.log('Setting up socket listeners for room:', roomId);

    const handleRoomJoined = (data: { roomId: string; partnerId: string; isInitiator: boolean }) => {
      console.log('Room joined:', data);
      setPartnerId(data.partnerId);
      setIsInitiator(data.isInitiator);
      setConnectionState('Setting up connection...');
    };

    const handleOffer = async (data: { offer: RTCSessionDescriptionInit; from: string }) => {
      console.log('Received offer from:', data.from);
      
      if (!pcRef.current) {
        console.log('No peer connection, creating one...');
        const stream = await initializeMedia();
        if (!stream) return;
        
        const pc = createPeerConnection();
        stream.getTracks().forEach((track) => {
          pc.addTrack(track, stream);
        });
        pcRef.current = pc;
      }

      try {
        setConnectionState('Processing offer...');
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(data.offer));
        
        // Process any queued ICE candidates
        await processIceCandidatesQueue();
        
        const answer = await pcRef.current.createAnswer();
        await pcRef.current.setLocalDescription(answer);
        
        emit('answer', { roomId, answer });
        console.log('Answer sent');
      } catch (err) {
        console.error('Error handling offer:', err);
        setConnectionState('Failed to process offer');
      }
    };

    const handleAnswer = async (data: { answer: RTCSessionDescriptionInit; from: string }) => {
      console.log('Received answer from:', data.from);
      
      if (!pcRef.current) {
        console.warn('Received answer but no peer connection exists');
        return;
      }

      try {
        setConnectionState('Processing answer...');
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
        
        // Process any queued ICE candidates
        await processIceCandidatesQueue();
        
        console.log('Answer processed successfully');
      } catch (err) {
        console.error('Error handling answer:', err);
        setConnectionState('Failed to process answer');
      }
    };

    const handleIceCandidate = async (data: { candidate: RTCIceCandidateInit; from: string }) => {
      console.log('Received ICE candidate from:', data.from);
      
      if (!pcRef.current) {
        console.log('No peer connection, queueing ICE candidate');
        iceCandidatesQueueRef.current.push(data.candidate);
        return;
      }

      if (!pcRef.current.remoteDescription) {
        console.log('No remote description, queueing ICE candidate');
        iceCandidatesQueueRef.current.push(data.candidate);
        return;
      }

      try {
        await pcRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
        console.log('ICE candidate added successfully');
      } catch (err) {
        console.error('Error adding ICE candidate:', err);
      }
    };

    const handlePartnerDisconnected = () => {
      console.log('Partner disconnected');
      setConnectionState('Partner disconnected');
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }
      setTimeout(() => router.push('/omegle'), 2000);
    };

    const handlePartnerSkipped = () => {
      console.log('Partner skipped');
      setConnectionState('Partner skipped');
      setTimeout(() => router.push('/omegle'), 2000);
    };

    const handleChatMessage = (data: { message: string; from: string; timestamp: number }) => {
      setChatMessages((prev) => [
        ...prev,
        { message: data.message, from: data.from, timestamp: data.timestamp, isOwn: false },
      ]);
    };

    const handleRoomError = (data: { message: string }) => {
      console.error('Room error:', data);
      setConnectionState('Room error: ' + data.message);
      setTimeout(() => router.push('/omegle'), 2000);
    };

    // Register event listeners
    socket.on('room_joined', handleRoomJoined);
    socket.on('offer', handleOffer);
    socket.on('answer', handleAnswer);
    socket.on('ice_candidate', handleIceCandidate);
    socket.on('partner_disconnected', handlePartnerDisconnected);
    socket.on('partner_skipped', handlePartnerSkipped);
    socket.on('chat_message', handleChatMessage);
    socket.on('room_error', handleRoomError);

    // Join the room
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
  }, [socket, roomId, userId, emit, initializeMedia, createPeerConnection, processIceCandidatesQueue, router]);

  // Initialize WebRTC when partner is found
  useEffect(() => {
    if (!partnerId || !isConnected || isSetupComplete) return;

    const setupWebRTC = async () => {
      try {
        console.log('Setting up WebRTC as', isInitiator ? 'initiator' : 'answerer');
        
        const stream = await initializeMedia();
        if (!stream) return;

        const pc = createPeerConnection();
        
        // Add local stream to peer connection
        stream.getTracks().forEach((track) => {
          pc.addTrack(track, stream);
          console.log('Added track to peer connection:', track.kind);
        });

        pcRef.current = pc;
        setIsSetupComplete(true);

        // If we're the initiator, create and send offer
        if (isInitiator) {
          console.log('Creating offer as initiator...');
          setConnectionState('Creating offer...');
          
          const offer = await pc.createOffer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: true,
          });
          
          await pc.setLocalDescription(offer);
          emit('offer', { roomId, offer });
          console.log('Offer sent');
        }
      } catch (err) {
        console.error('WebRTC setup error:', err);
        setConnectionState('Setup failed');
      }
    };

    setupWebRTC();
  }, [partnerId, isConnected, isInitiator, isSetupComplete, initializeMedia, createPeerConnection, emit, roomId]);

  // Auto-scroll chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Media controls
  const toggleAudio = useCallback(() => {
    if (!localStreamRef.current) return;
    
    const audioTrack = localStreamRef.current.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setAudioEnabled(audioTrack.enabled);
    }
  }, []);

  const toggleVideo = useCallback(() => {
    if (!localStreamRef.current) return;
    
    const videoTrack = localStreamRef.current.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setVideoEnabled(videoTrack.enabled);
    }
  }, []);

  // Cleanup function
  const cleanup = useCallback(() => {
    console.log('Cleaning up...');
    
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      localStreamRef.current = null;
    }
    
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
    
    iceCandidatesQueueRef.current = [];
    setIsSetupComplete(false);
  }, []);

  // Navigation handlers
  const handleSkip = useCallback(() => {
    emit('skip');
    cleanup();
    router.push('/omegle');
  }, [emit, cleanup, router]);

  const handleGoHome = useCallback(() => {
    cleanup();
    router.push('/omegle');
  }, [cleanup, router]);

  // Chat functions
  const sendMessage = useCallback(() => {
    const trimmed = chatMessage.trim();
    if (!trimmed || !userId) return;

    const msg: ChatMessage = {
      message: trimmed,
      from: userId,
      timestamp: Date.now(),
      isOwn: true,
    };

    setChatMessages((prev) => [...prev, msg]);
    emit('chat_message', { roomId, message: trimmed });
    setChatMessage('');
  }, [chatMessage, userId, emit, roomId]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, [sendMessage]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
      if (socket && isConnected) {
        try {
          emit('skip');
        } catch (err) {
          console.error('Error during cleanup emit:', err);
        }
      }
    };
  }, [cleanup, socket, isConnected, emit]);

  // Render
  if (!roomId) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p>Invalid room ID</p>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p>Connecting to server...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-4 space-y-4 h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Room: {roomId.slice(0, 8)}</h1>
          <Badge 
            variant={connectionState === 'Connected' ? 'default' : 'secondary'}
            className={connectionState === 'Connected' ? 'bg-green-500' : ''}
          >
            {connectionState}
          </Badge>
          {partnerId && (
            <Badge variant="outline">
              Partner: {partnerId.slice(0, 6)}
            </Badge>
          )}
        </div>
        <Button onClick={() => setShowChat(!showChat)} variant="outline" size="sm">
          <MessageCircle className="h-4 w-4 mr-2" />
          Chat {chatMessages.length > 0 && `(${chatMessages.length})`}
        </Button>
      </div>

      {/* Media Error */}
      {mediaError && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-5 w-5" />
              <p className="text-sm">{mediaError}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Video Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 min-h-0">
        <div className={`${showChat ? 'lg:col-span-3' : 'lg:col-span-4'} space-y-4 min-h-0`}>
          {/* Remote Video */}
          <Card className="bg-black flex-1">
            <CardContent className="p-0 h-full">
              <div className="relative h-full min-h-[300px]">
                <video 
                  ref={remoteVideoRef} 
                  autoPlay 
                  playsInline 
                  className="w-full h-full object-cover rounded-lg bg-gray-900" 
                />
                <div className="absolute top-2 left-2">
                  <Badge variant="secondary">Stranger</Badge>
                </div>
                {connectionState !== 'Connected' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 rounded-lg">
                    <div className="text-center text-white">
                      {connectionState === 'Connecting...' && (
                        <div className="animate-spin h-8 w-8 border-4 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
                      )}
                      <p className="text-lg">{connectionState}</p>
                    </div>
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
                  className="w-full h-full object-cover rounded-lg bg-gray-900" 
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

        {/* Chat Panel */}
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
                          msg.isOwn 
                            ? 'bg-primary text-primary-foreground ml-auto' 
                            : 'bg-muted'
                        }`}
                      >
                        <p className="break-words">{msg.message}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </p>
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
                    disabled={!partnerId}
                  />
                  <Button onClick={sendMessage} size="sm" disabled={!chatMessage.trim() || !partnerId}>
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
          variant={audioEnabled ? 'default' : 'destructive'} 
          size="lg"
          disabled={!localStreamRef.current}
        >
          {audioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
        </Button>
        <Button 
          onClick={toggleVideo} 
          variant={videoEnabled ? 'default' : 'destructive'} 
          size="lg"
          disabled={!localStreamRef.current}
        >
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