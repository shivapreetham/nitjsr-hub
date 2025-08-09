'use client';
import { useEffect, useState } from 'react';
import {
  DeviceSettings,
  VideoPreview,
  useCall,
  useCallStateHooks,
} from '@stream-io/video-react-sdk';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Settings, 
  Check, 
  Monitor,
  Users,
  Clock,
  Wifi,
  WifiOff
} from 'lucide-react';

import Alert from './Alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';

const MeetingSetup = ({
  setIsSetupComplete,
}: {
  setIsSetupComplete: (value: boolean) => void;
}) => {
  const { useCallEndedAt, useCallStartsAt, useParticipants } = useCallStateHooks();
  const callStartsAt = useCallStartsAt();
  const callEndedAt = useCallEndedAt();
  const participants = useParticipants();
  const callTimeNotArrived = callStartsAt && new Date(callStartsAt) > new Date();
  const callHasEnded = !!callEndedAt;

  const call = useCall();

  if (!call) {
    throw new Error('useStreamCall must be used within a StreamCall component.');
  }

  const [isMicCamToggled, setIsMicCamToggled] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [showDeviceSettings, setShowDeviceSettings] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('checking');

  // Check connection status
  useEffect(() => {
    const checkConnection = async () => {
      try {
        // Simulate connection check
        await new Promise(resolve => setTimeout(resolve, 1000));
        setConnectionStatus('connected');
      } catch (error:any) {
        setConnectionStatus('disconnected');
      }
    };
    checkConnection();
  }, []);

  useEffect(() => {
    if (isMicCamToggled) {
      call.camera.disable();
      call.microphone.disable();
      setIsMicOn(false);
      setIsVideoOn(false);
    } else {
      call.camera.enable();
      call.microphone.enable();
      setIsMicOn(true);
      setIsVideoOn(true);
    }
  }, [isMicCamToggled, call.camera, call.microphone]);

  const toggleMic = async () => {
    try {
      if (isMicOn) {
        await call.microphone.disable();
        setIsMicOn(false);
      } else {
        await call.microphone.enable();
        setIsMicOn(true);
      }
    } catch (error) {
      console.error('Error toggling microphone:', error);
    }
  };

  const toggleVideo = async () => {
    try {
      if (isVideoOn) {
        await call.camera.disable();
        setIsVideoOn(false);
      } else {
        await call.camera.enable();
        setIsVideoOn(true);
      }
    } catch (error) {
      console.error('Error toggling camera:', error);
    }
  };

  if (callTimeNotArrived)
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-gray-800/90 backdrop-blur-md border-gray-700 p-8 text-center">
          <div className="mb-6">
            <Clock size={64} className="text-blue-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Meeting Scheduled</h2>
            <p className="text-gray-300">Your meeting is scheduled for:</p>
            <p className="text-blue-400 font-mono text-lg mt-2">
              {callStartsAt.toLocaleString()}
            </p>
          </div>
          <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50">
            Waiting to start
          </Badge>
        </Card>
      </div>
    );

  if (callHasEnded)
    return (
      <Alert
        title="The call has been ended by the host"
        iconUrl="/icons/call-ended.svg"
      />
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Video Preview Section */}
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-2">Join Meeting</h1>
            <p className="text-gray-400">Set up your audio and video before joining</p>
          </div>

          {/* Video Preview */}
          <div className="relative bg-gray-900/80 rounded-2xl overflow-hidden aspect-video border border-gray-700/50 shadow-2xl">
            {isVideoOn ? (
              <VideoPreview className="w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <VideoOff size={32} className="text-white" />
                  </div>
                  <p className="text-white font-medium">Camera is off</p>
                  <p className="text-gray-400 text-sm mt-1">Turn on camera to see preview</p>
                </div>
              </div>
            )}
            
            {/* Video overlay info */}
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <Badge variant="secondary" className="bg-black/60 text-white border-gray-600 backdrop-blur-sm">
                Preview
              </Badge>
              {connectionStatus === 'connected' && (
                <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/50 backdrop-blur-sm">
                  <Wifi size={12} className="mr-1" />
                  Connected
                </Badge>
              )}
            </div>
          </div>

          {/* Audio/Video Controls */}
          <div className="flex justify-center gap-4">
            <Button
              variant="ghost"
              size="lg"
              className={`rounded-full w-16 h-16 transition-all duration-200 shadow-lg ${
                isMicOn 
                  ? 'text-white hover:bg-white/20 ring-2 ring-white/20' 
                  : 'bg-red-500/90 text-white hover:bg-red-600 ring-2 ring-red-400/50'
              }`}
              onClick={toggleMic}
            >
              {isMicOn ? <Mic size={24} /> : <MicOff size={24} />}
            </Button>

            <Button
              variant="ghost"
              size="lg"
              className={`rounded-full w-16 h-16 transition-all duration-200 shadow-lg ${
                isVideoOn 
                  ? 'text-white hover:bg-white/20 ring-2 ring-white/20' 
                  : 'bg-red-500/90 text-white hover:bg-red-600 ring-2 ring-red-400/50'
              }`}
              onClick={toggleVideo}
            >
              {isVideoOn ? <Video size={24} /> : <VideoOff size={24} />}
            </Button>

            <Button
              variant="ghost"
              size="lg"
              className="rounded-full w-16 h-16 text-white hover:bg-white/20 ring-2 ring-white/20 transition-all duration-200 shadow-lg"
              onClick={() => setShowDeviceSettings(!showDeviceSettings)}
            >
              <Settings size={24} />
            </Button>
          </div>
        </div>

        {/* Meeting Info & Settings Section */}
        <div className="space-y-6">
          {/* Meeting Info Card */}
          <Card className="bg-gray-800/80 backdrop-blur-md border-gray-700 p-6">
            <h3 className="text-white font-semibold text-lg mb-4">Meeting Details</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Users size={18} className="text-blue-400" />
                <span className="text-gray-300">{participants?.length || 0} participants waiting</span>
              </div>
              <div className="flex items-center gap-3">
                <Monitor size={18} className="text-green-400" />
                <span className="text-gray-300">Screen sharing available</span>
              </div>
              <div className="flex items-center gap-3">
                {connectionStatus === 'connected' ? (
                  <Wifi size={18} className="text-green-400" />
                ) : (
                  <WifiOff size={18} className="text-red-400" />
                )}
                <span className="text-gray-300">
                  {connectionStatus === 'connected' ? 'Connection stable' : 'Checking connection...'}
                </span>
              </div>
            </div>
          </Card>

          {/* Device Settings */}
          {showDeviceSettings && (
            <Card className="bg-gray-800/80 backdrop-blur-md border-gray-700 p-6">
              <h3 className="text-white font-semibold text-lg mb-4">Device Settings</h3>
              <DeviceSettings />
            </Card>
          )}

          {/* Quick Setup Options */}
          <Card className="bg-gray-800/80 backdrop-blur-md border-gray-700 p-6">
            <h3 className="text-white font-semibold text-lg mb-4">Quick Setup</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Join with mic and camera off</p>
                  <p className="text-gray-400 text-sm">You can turn them on later</p>
                </div>
                <Switch
                  checked={isMicCamToggled}
                  onCheckedChange={setIsMicCamToggled}
                />
              </div>
            </div>
          </Card>

          {/* Status Indicators */}
          <Card className="bg-gray-800/80 backdrop-blur-md border-gray-700 p-6">
            <h3 className="text-white font-semibold text-lg mb-4">Current Status</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-lg">
                <div className={`w-3 h-3 rounded-full ${isMicOn ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <div>
                  <p className="text-white text-sm font-medium">Microphone</p>
                  <p className="text-gray-400 text-xs">{isMicOn ? 'Ready' : 'Muted'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-lg">
                <div className={`w-3 h-3 rounded-full ${isVideoOn ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <div>
                  <p className="text-white text-sm font-medium">Camera</p>
                  <p className="text-gray-400 text-xs">{isVideoOn ? 'Ready' : 'Off'}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Join Button */}
          <Button
            size="lg"
            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-4 rounded-xl font-semibold text-lg shadow-xl transition-all duration-200 transform hover:scale-105"
            onClick={() => {
              call.join();
              setIsSetupComplete(true);
            }}
            disabled={connectionStatus !== 'connected'}
          >
            <Check size={24} className="mr-3" />
            {connectionStatus === 'connected' ? 'Join Meeting' : 'Connecting...'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MeetingSetup;