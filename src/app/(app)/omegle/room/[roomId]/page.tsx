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
import { useSocket } from '../SocketProvider';

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

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const [partnerId, setPartnerId] = useState<string>('');
  const [isInitiator, setIsInitiator] = useState(false);
  const [connectionState, setConnectionState] = useState('Connecting...');
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [showChat, setShowChat] = useState(false);

  const iceCandidatesQueue = useRef<RTCIceCandidate[]>([]);

  // Initialize media
  const initializeMedia = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      return stream;
    } catch (error) {
      console.error('Error accessing media:', error);
      setConnectionState('Media access denied');
      throw error;
    }
  }, []);

  // Create peer connection
  const createPeerConnection = useCallback(() => {
    const configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    };

    const pc = new RTCPeerConnection(configuration);

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        emit('ice_candidate', {
          roomId,
          candidate: event.candidate
        });
      }
    };

    pc.ontrack = (event) => {
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log('ICE connection state:', pc.iceConnectionState);
      setConnectionState(pc.iceConnectionState);
    };

    pc.onconnectionstatechange = () => {
      console.log('Connection state:', pc.connectionState);
      if (pc.connectionState === 'connected') {
        setConnectionState('Connected');
      } else if (pc.connectionState === 'failed') {
        setConnectionState('Connection failed');
      }
    };

    return pc;
  }, [emit, roomId]);

  // Socket event handlers
  useEffect(() => {
    if (!socket || !roomId) return;

    const handleRoomJoined = (data: any) => {
      setPartnerId(data.partnerId);
      setIsInitiator(data.isInitiator);
      setConnectionState('Setting up connection...');
    };

    const handleOffer = async (data: any) => {
      if (!pcRef.current) return;
      
      try {
        await pcRef.current.setRemoteDescription(data.offer);
        
        // Add queued ICE candidates
        while (iceCandidatesQueue.current.length > 0) {
          const candidate = iceCandidatesQueue.current.shift();
          if (candidate) {
            await pcRef.current.addIceCandidate(candidate);
          }
        }
        
        const answer = await pcRef.current.createAnswer();
        await pcRef.current.setLocalDescription(answer);
        
        emit('answer', {
          roomId,
          answer: answer
        });
      } catch (error) {
        console.error('Error handling offer:', error);
      }
    };

    const handleAnswer = async (data: any) => {
      if (!pcRef.current) return;
      
      try {
        await pcRef.current.setRemoteDescription(data.answer);
        
        // Add queued ICE candidates
        while (iceCandidatesQueue.current.length > 0) {
          const candidate = iceCandidatesQueue.current.shift();
          if (candidate) {
            await pcRef.current.addIceCandidate(candidate);
          }
        }
      } catch (error) {
        console.error('Error handling answer:', error);
      }
    };

    const handleIceCandidate = async (data: any) => {
      if (!pcRef.current) {
        iceCandidatesQueue.current.push(new RTCIceCandidate(data.candidate));
        return;
      }
      
      try {
        if (pcRef.current.remoteDescription) {
          await pcRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
        } else {
          iceCandidatesQueue.current.push(new RTCIceCandidate(data.candidate));
        }
      } catch (error) {
        console.error('Error handling ICE candidate:', error);
      }
    };

    const handlePartnerDisconnected = () => {
      setConnectionState('Partner disconnected');
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }
    };

    const handlePartnerSkipped = () => {
      setConnectionState('Partner skipped');
      router.push('/');
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
      router.push('/');
    };

    socket.on('room_joined', handleRoomJoined);
    socket.on('offer', handleOffer);
    socket.on('answer', handleAnswer);
    socket.on('ice_candidate', handleIceCandidate);
    socket.on('partner_disconnected', handlePartnerDisconnected);
    socket.on('partner_skipped', handlePartnerSkipped);
    socket.on('chat_message', handleChatMessage);
    socket.on('room_error', handleRoomError);

    // Join room
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
  }, [socket, roomId, emit, router]);

  // Initialize connection
  useEffect(() => {
    if (!partnerId || pcRef.current) return;

    const setupConnection = async () => {
      try {
        const stream = await initializeMedia();
        const pc = createPeerConnection();
        
        // Add local stream to peer connection
        stream.getTracks().forEach(track => {
          pc.addTrack(track, stream);
        });
        
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

  // Scroll chat to bottom
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

  const handleSkip = () => {
    emit('skip');
    cleanup();
    router.push('/');
  };

  const handleGoHome = () => {
    cleanup();
    router.push('/');
  };

  const cleanup = () => {
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
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

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, []);

  if (!roomId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Invalid room</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-white">Room: {roomId}</h1>
            <Badge variant="outline" className="text-white border-white">
              {connectionState}
            </Badge>
            {partnerId && (
              <Badge variant="secondary">
                Partner: {partnerId}
              </Badge>
            )}
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

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[calc(100vh-120px)]">
          {/* Video Section */}
          <div className={`${showChat ? 'lg:col-span-3' : 'lg:col-span-4'} space-y-4`}>
            {/* Remote Video */}
            <Card className="bg-black">
              <CardContent className="p-0">
                <div className="relative aspect-video">
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
                <div className="relative aspect-video">
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
                      <VideoOff className="h-12 w-12 text-white" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat Section */}
          {showChat && (
            <div className="lg:col-span-1">
              <Card className="h-full flex flex-col">
                <CardContent className="p-4 flex-1 flex flex-col">
                  <h3 className="font-semibold mb-4">Chat</h3>
                  
                  {/* Messages */}
                  <div 
                    ref={chatContainerRef}
                    className="flex-1 overflow-y-auto space-y-2 mb-4"
                  >
                    {chatMessages.length === 0 ? (
                      <p className="text-gray-500 text-sm text-center">
                        No messages yet. Start the conversation!
                      </p>
                    ) : (
                      chatMessages.map((msg, index) => (
                        <div
                          key={index}
                          className={`p-2 rounded-lg max-w-xs ${
                            msg.isOwn
                              ? 'bg-blue-500 text-white ml-auto'
                              : 'bg-gray-200 text-gray-800'
                          }`}
                        >
                          <p className="text-sm">{msg.message}</p>
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
        <div className="flex items-center justify-center gap-4">
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
    </div>
  );
}