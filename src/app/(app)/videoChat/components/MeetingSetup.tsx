'use client';
import { useEffect, useState } from 'react';
import {
  DeviceSettings,
  VideoPreview,
  useCall,
  useCallStateHooks,
} from '@stream-io/video-react-sdk';
import { Mic, MicOff, Video, VideoOff, Settings, Check } from 'lucide-react';

import Alert from './Alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const MeetingSetup = ({
  setIsSetupComplete,
}: {
  setIsSetupComplete: (value: boolean) => void;
}) => {
  const { useCallEndedAt, useCallStartsAt } = useCallStateHooks();
  const callStartsAt = useCallStartsAt();
  const callEndedAt = useCallEndedAt();
  const callTimeNotArrived =
    callStartsAt && new Date(callStartsAt) > new Date();
  const callHasEnded = !!callEndedAt;

  const call = useCall();

  if (!call) {
    throw new Error(
      'useStreamCall must be used within a StreamCall component.',
    );
  }

  const [isMicCamToggled, setIsMicCamToggled] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);

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

  const toggleMic = () => {
    if (isMicOn) {
      call.microphone.disable();
      setIsMicOn(false);
    } else {
      call.microphone.enable();
      setIsMicOn(true);
    }
  };

  const toggleVideo = () => {
    if (isVideoOn) {
      call.camera.disable();
      setIsVideoOn(false);
    } else {
      call.camera.enable();
      setIsVideoOn(true);
    }
  };

  if (callTimeNotArrived)
    return (
      <Alert
        title={`Your Meeting has not started yet. It is scheduled for ${callStartsAt.toLocaleString()}`}
      />
    );

  if (callHasEnded)
    return (
      <Alert
        title="The call has been ended by the host"
        iconUrl="/icons/call-ended.svg"
      />
    );

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-gray-800 rounded-2xl p-8 shadow-2xl border border-gray-700">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Join Meeting</h1>
          <p className="text-gray-400">Set up your audio and video before joining</p>
        </div>

        {/* Video Preview */}
        <div className="mb-8">
          <div className="relative bg-gray-900 rounded-xl overflow-hidden aspect-video">
            <VideoPreview />
            {!isVideoOn && (
              <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                <div className="text-center">
                  <VideoOff size={48} className="text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-400">Camera is off</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Device Controls */}
        <div className="space-y-6">
          {/* Audio/Video Toggles */}
          <div className="flex justify-center gap-4">
            <Button
              variant="ghost"
              size="lg"
              className={`rounded-full w-16 h-16 ${
                isMicOn 
                  ? 'text-white hover:bg-white/10' 
                  : 'bg-red-500 text-white hover:bg-red-600'
              }`}
              onClick={toggleMic}
            >
              {isMicOn ? <Mic size={24} /> : <MicOff size={24} />}
            </Button>

            <Button
              variant="ghost"
              size="lg"
              className={`rounded-full w-16 h-16 ${
                isVideoOn 
                  ? 'text-white hover:bg-white/10' 
                  : 'bg-red-500 text-white hover:bg-red-600'
              }`}
              onClick={toggleVideo}
            >
              {isVideoOn ? <Video size={24} /> : <VideoOff size={24} />}
            </Button>
          </div>

          {/* Device Settings */}
          <div className="flex items-center justify-center">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white hover:bg-white/10"
            >
              <Settings size={18} className="mr-2" />
              Device Settings
            </Button>
          </div>

          {/* Quick Join Option */}
          <div className="flex items-center justify-center">
            <label className="flex items-center gap-3 text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                checked={isMicCamToggled}
                onChange={(e) => setIsMicCamToggled(e.target.checked)}
                className="rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
              />
              <span className="text-sm">Join with mic and camera off</span>
            </label>
          </div>
        </div>

        {/* Join Button */}
        <div className="mt-8 flex justify-center">
          <Button
            size="lg"
            className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-full font-medium"
            onClick={() => {
              call.join();
              setIsSetupComplete(true);
            }}
          >
            <Check size={20} className="mr-2" />
            Join Meeting
          </Button>
        </div>

        {/* Status Indicators */}
        <div className="mt-6 flex justify-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isMicOn ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-xs text-gray-400">Microphone</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isVideoOn ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-xs text-gray-400">Camera</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeetingSetup;
