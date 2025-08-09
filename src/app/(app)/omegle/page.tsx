"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Video,
  Loader2,
  Wifi,
  WifiOff,
  AlertCircle,
  RefreshCw,
  MessageCircle,
  Camera,
} from "lucide-react";
import { useSocket } from "@/context/SocketProvider";

/**
 * Improved OmeglePage
 * - preserves all functionality (socket handlers, emits, names)
 * - full-page gradient background, frosted glass cards, animations
 * - search animation + subtle decorative shapes
 */

export default function OmeglePage() {
  const router = useRouter();
  const { socket, isConnected, userId, emit, reconnect } = useSocket();

  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [userCount, setUserCount] = useState<number>(0);
  const [searchTime, setSearchTime] = useState<number>(0);
  const [error, setError] = useState<string>("");
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // ---- mobile detector (kept as in original) ----
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // ---- socket event registration (preserve all handlers & behavior) ----
  useEffect(() => {
    if (!socket) return;

    const handleUserCount = (data: { count: number }) => {
      console.log("User count update:", data.count);
      setUserCount(data.count);
    };

    const handleRoomAssigned = (data: {
      roomId: string;
      partnerId?: string;
      isInitiator?: boolean;
    }) => {
      console.log("Room assigned:", data);
      setIsSearching(false);
      setError("");
      router.push(`/omegle/room/${data.roomId}`);
    };

    const handleSearching = () => {
      console.log("Now searching...");
      setIsSearching(true);
      setError("");
    };

    const handlePartnerSkipped = () => {
      console.log("Partner skipped");
      setIsSearching(false);
      setError("");
    };

    const handlePartnerDisconnected = () => {
      console.log("Partner disconnected");
      setIsSearching(false);
      setError("");
    };

    const handleError = (data: { message: string }) => {
      console.error("Socket error:", data);
      setError(data.message);
      setIsSearching(false);
    };

    socket.on("user_count", handleUserCount);
    socket.on("room_assigned", handleRoomAssigned);
    socket.on("searching", handleSearching);
    socket.on("partner_skipped", handlePartnerSkipped);
    socket.on("partner_disconnected", handlePartnerDisconnected);
    socket.on("error", handleError);

    return () => {
      socket.off("user_count", handleUserCount);
      socket.off("room_assigned", handleRoomAssigned);
      socket.off("searching", handleSearching);
      socket.off("partner_skipped", handlePartnerSkipped);
      socket.off("partner_disconnected", handlePartnerDisconnected);
      socket.off("error", handleError);
    };
  }, [socket, router]);

  // ---- search timer (preserve logic) ----
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (isSearching) {
      interval = setInterval(() => setSearchTime((t) => t + 1), 1000);
    } else {
      setSearchTime(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSearching]);

  // ---- actions (keep names & functionality identical) ----
  const handleStartChat = async () => {
    if (!isConnected || !userId) {
      setError("Not connected to server. Please wait or try reconnecting.");
      return;
    }

    // Check for media permissions before starting search
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      stream.getTracks().forEach((track) => track.stop()); // Stop the test stream
      setError("");
    } catch (err: any) {
      let errorMessage = "Camera and microphone access required";
      if (err?.name === "NotAllowedError") {
        errorMessage = "Please allow camera and microphone access to start chatting";
      } else if (err?.name === "NotFoundError") {
        errorMessage = "No camera or microphone found. Please connect a device";
      }
      setError(errorMessage);
      return;
    }

    console.log("Starting chat search...");
    emit("find_partner");
    setIsSearching(true);
    setError("");
  };

  const handleStopSearch = () => {
    console.log("Stopping search...");
    emit("skip");
    setIsSearching(false);
    setError("");
  };

  const handleReconnect = () => {
    setError("");
    reconnect();
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Decorative background blobs (full-page) */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
        style={{ mixBlendMode: "normal" }}
      >
        <div className="absolute -left-72 -top-48 w-[650px] h-[650px] rounded-full bg-gradient-to-r from-blue-200 to-indigo-200 opacity-60 blur-3xl transform -rotate-12" />
        <div className="absolute -right-64 bottom-0 w-[520px] h-[520px] rounded-full bg-gradient-to-r from-indigo-100 to-blue-100 opacity-60 blur-2xl transform rotate-6" />
      </div>

      {/* Header */}
      <header className="w-full border-b bg-white/40 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg shadow-md">
              <Video className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-lg md:text-2xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Omegle Clone
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {isConnected ? (
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm text-green-700 hidden md:inline">Online</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-red-500 rounded-full" />
                  <span className="text-sm text-red-600 hidden md:inline">Offline</span>
                </div>
              )}
            </div>

            {!isConnected && (
              <Button onClick={handleReconnect} size="sm" variant="ghost" className="hidden md:inline-flex">
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main content container (centered column) */}
      <main className="flex-1 flex items-start justify-center py-12 px-4">
        <div className="w-full max-w-3xl space-y-8">
          {/* Top cards area */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Status card (span 3 on lg) */}
            <div className="lg:col-span-3">
              <Card className="bg-white/60 backdrop-blur-md border border-white/40 shadow-xl rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="rounded-xl p-3 bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg">
                        <Camera className="h-7 w-7 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Your ID</p>
                        <p className="text-xs md:text-sm text-gray-800">
                          {userId ? userId.slice(0, 12) : "Connecting..."}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {isConnected ? (
                          <>
                            <Wifi className="h-5 w-5 text-green-500" />
                            <span className="text-sm font-medium text-green-700">Connected</span>
                          </>
                        ) : (
                          <>
                            <WifiOff className="h-5 w-5 text-red-500" />
                            <span className="text-sm text-red-600">Connecting...</span>
                          </>
                        )}
                      </div>

                      <div className="h-6 w-px bg-gray-200" />

                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-blue-500" />
                        <div className="text-sm">
                          <span className="font-semibold text-blue-600">{userCount}</span>{" "}
                          <span className="text-gray-600">online</span>
                        </div>
                      </div>

                      {/* small reconnect button for mobile */}
                      {!isConnected && (
                        <Button onClick={handleReconnect} size="sm" variant="ghost" className="md:hidden">
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Action Card (center column on larger screens) */}
            <div className="lg:col-span-3 flex flex-col items-center">
              <Card className="w-full md:w-3/4 bg-white/70 backdrop-blur-md border border-white/40 shadow-2xl rounded-2xl">
                <CardContent className="p-8">
                  {!isSearching ? (
                    <div className="text-center space-y-4">
                      <h2 className="text-2xl font-semibold text-gray-900">Ready to meet someone new?</h2>
                      <p className="text-sm text-gray-600">Click below to start a random video chat</p>

                      <div className="mt-6">
                        <Button
                          onClick={handleStartChat}
                          size="lg"
                          className="w-full md:w-2/3 mx-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 shadow-lg flex items-center justify-center gap-3"
                          disabled={!isConnected || !userId}
                        >
                          <Video className="h-5 w-5" />
                          <span>{isConnected && userId ? "Start Video Chat" : "Connecting..."}</span>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center space-y-6">
                      {/* Searching animation */}
                      <div className="mx-auto w-20 h-20 relative">
                        <div className="absolute inset-0 rounded-full border-4 border-blue-200"></div>
                        <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>

                        {/* pulsing glow */}
                        <div className="absolute -inset-6 rounded-full opacity-40 animate-pulse-slow" style={{ boxShadow: "0 30px 60px -20px rgba(79, 70, 229, 0.35)" }} />

                        <div className="absolute inset-3 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center shadow-md">
                          <Video className="h-7 w-7 text-white" />
                        </div>
                      </div>

                      <h3 className="text-lg font-semibold text-gray-900">Finding someone to chat with...</h3>
                      <p className="text-sm text-gray-600">This might take a few moments</p>

                      {/* Search stats card */}
                      <div className="w-full md:w-2/3 mx-auto bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-white/30">
                        <div className="flex items-center justify-between text-sm text-gray-700">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse" />
                            <span>Searching: {formatTime(searchTime)}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-gray-500" />
                            <span>{userCount} online</span>
                          </div>
                        </div>
                      </div>

                      {/* long search warning */}
                      {searchTime > 30 && (
                        <div className="w-full md:w-2/3 mx-auto bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                          <div className="flex items-start gap-2">
                            <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                            <div>
                              <p className="text-sm text-yellow-800 font-medium">Taking longer than usual</p>
                              <p className="text-xs text-yellow-700 mt-1">
                                Try again later or check your internet connection
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="w-full md:w-2/3 mx-auto">
                        <Button
                          onClick={handleStopSearch}
                          variant="outline"
                          className="w-full text-red-600 border-red-200 hover:bg-red-50"
                        >
                          Stop Searching
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Feature cards */}
            {!isSearching && (
              <div className="items-center gap-4 grid grid-cols-2 md:grid-cols-3 mt-4">
                <div>
                  <Card className="bg-white/70 backdrop-blur-sm border border-white/30 shadow-lg rounded-xl p-6 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Video className="h-8 w-8 text-blue-500" />
                      <h4 className="font-medium text-sm">HD Video</h4>
                      <p className="text-xs text-gray-600">Crystal clear video calls</p>
                    </div>
                  </Card>
                </div>

                <div>
                  <Card className="bg-white/70 backdrop-blur-sm border border-white/30 shadow-lg rounded-xl p-6 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <MessageCircle className="h-8 w-8 text-green-500" />
                      <h4 className="font-medium text-sm">Live Chat</h4>
                      <p className="text-xs text-gray-600">Text while you video chat</p>
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {/* Safety Tips */}
            {/* Debug info (development only) */}
            {process.env.NODE_ENV === "development" && (
              <div className="lg:col-span-3">
                <Card className="bg-white/70 backdrop-blur-sm border border-white/30 shadow-sm rounded-xl">
                  <CardContent className="p-3 text-center text-xs text-gray-600">
                    <strong>Debug:</strong> Connected: {isConnected ? "Yes" : "No"}, UserId:{" "}
                    {userId ? userId.slice(0, 8) : "None"}, Searching: {isSearching ? "Yes" : "No"}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t bg-white/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 text-center text-xs text-gray-600">
          By using this service, you agree to be respectful and follow community guidelines
        </div>
      </footer>

      {/* Small utility styles for slow pulse (Tailwind doesn't include custom timing by default) */}
      <style jsx>{`
        .animate-pulse-slow {
          animation: pulse 2.8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 0.7;
          }
          50% {
            transform: scale(1.08);
            opacity: 0.35;
          }
          100% {
            transform: scale(1);
            opacity: 0.7;
          }
        }
      `}</style>
    </div>
  );
}
