// context/SocketProvider.tsx
"use client";
import React, { createContext, useContext, useEffect, useMemo, useState, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";

type SocketContextType = {
  socket: Socket | null;
  token: string | null;
  isConnected: boolean;
  reconnect: () => void;
  emit: (event: string, data?: any) => boolean;
};

const SocketContext = createContext<SocketContextType | null>(null);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window !== 'undefined') return sessionStorage.getItem("omegle_token");
    return null;
  });
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  const createConnection = useCallback(() => {
    const url = process.env.NEXT_PUBLIC_OMEGLE_SERVER_URL || 'http://localhost:3001';
    console.log("[SOCKET] Creating connection to:", url);

    if (socketRef.current) {
      try { socketRef.current.removeAllListeners(); socketRef.current.disconnect(); } catch (e) {}
    }

    const newSocket = io(url, {
      transports: ['websocket', 'polling'],
      timeout: 5000,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      console.log("[SOCKET] Connected to server");
      setIsConnected(true);
      const savedToken = token || (typeof window !== 'undefined' ? sessionStorage.getItem("omegle_token") : null);
      if (savedToken) {
        console.log("[SOCKET] Attempting reconnect with token");
        newSocket.emit('reconnect_user', { token: savedToken });
      }
    });

    newSocket.on('disconnect', (reason: any) => { console.log("[SOCKET] Disconnected:", reason); setIsConnected(false); });
    newSocket.on('connect_error', (error: any) => { console.error("[SOCKET] Connection error:", error); setIsConnected(false); });

    newSocket.on('welcome', (data: any) => {
      console.log("[SOCKET] Received welcome with token:", data.token);
      setToken(data.token);
      if (typeof window !== 'undefined') sessionStorage.setItem("omegle_token", data.token);
    });

    newSocket.on('reconnect_success', (data: any) => { console.log("[SOCKET] Reconnect successful", data); });
    newSocket.on('reconnect_failed', () => {
      console.log("[SOCKET] Reconnect failed, starting fresh");
      setToken(null);
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem("omegle_token");
        sessionStorage.removeItem("omegle_room");
      }
    });

    socketRef.current = newSocket;
    setSocket(newSocket);
    return newSocket;
  }, [token]);

  useEffect(() => {
    const s = createConnection();
    return () => {
      console.log("[SOCKET] Cleaning up connection");
      if (s) { s.removeAllListeners(); s.disconnect(); }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reconnect = useCallback(() => {
    console.log("[SOCKET] Manual reconnect triggered");
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current.removeAllListeners();
      socketRef.current = null;
    }
    createConnection();
  }, [createConnection]);

  const emit = useCallback((event: string, data?: any) => {
    if (!socketRef.current || !socketRef.current.connected) {
      console.warn("[SOCKET] Cannot emit - not connected");
      return false;
    }
    try {
      const payload = { ...(data || {}) };
      if (!payload.token && token) payload.token = token;
      socketRef.current.emit(event, payload);
      console.log("[SOCKET] Emitted:", event, payload);
      return true;
    } catch (err) {
      console.error("[SOCKET] Emit failed:", err);
      return false;
    }
  }, [token]);

  const value = useMemo(() => ({ socket, token, isConnected, reconnect, emit }), [socket, token, isConnected, reconnect, emit]);

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("useSocket must be used inside SocketProvider");
  return ctx;
};
