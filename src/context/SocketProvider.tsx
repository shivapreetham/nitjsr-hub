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
    const savedToken = token || (typeof window !== 'undefined' ? sessionStorage.getItem("omegle_token") : null);
    console.log("[SOCKET] Creating connection to:", url, "auth:", Boolean(savedToken));

    if (socketRef.current) {
      try { socketRef.current.removeAllListeners(); socketRef.current.disconnect(); } catch(e) {}
      socketRef.current = null;
    }

    const s = io(url, {
      transports: ['websocket', 'polling'],
      timeout: 5000,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      auth: { token: savedToken }
    });

    s.on('connect', () => {
      console.log("[SOCKET] Connected to server");
      setIsConnected(true);
    });

    s.on('disconnect', (reason) => {
      console.log("[SOCKET] Disconnected:", reason);
      setIsConnected(false);
    });

    s.on('connect_error', (error) => {
      console.error("[SOCKET] Connection error:", error);
      setIsConnected(false);
    });

    s.on('welcome', (data: any) => {
      console.log("[SOCKET] Received welcome with token:", data.token);
      setToken(data.token);
      if (typeof window !== 'undefined') sessionStorage.setItem("omegle_token", data.token);
    });

    s.on('reconnect_success', (data: any) => {
      console.log("[SOCKET] reconnect_success", data);
      // UI will react to this as needed
    });

    s.on('reconnect_failed', () => {
      console.log("[SOCKET] reconnect_failed - clearing local token");
      setToken(null);
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem("omegle_token");
        sessionStorage.removeItem("omegle_room");
      }
    });

    socketRef.current = s;
    setSocket(s);
    return s;
  }, [token]);

  useEffect(() => {
    const s = createConnection();
    return () => {
      if (s) { s.removeAllListeners(); s.disconnect(); }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reconnect = useCallback(() => {
    console.log("[SOCKET] manual reconnect");
    if (socketRef.current) {
      try { socketRef.current.removeAllListeners(); socketRef.current.disconnect(); } catch(e) {}
      socketRef.current = null;
    }
    createConnection();
  }, [createConnection]);

  const emit = useCallback((event: string, data?: any) => {
    const s = socketRef.current;
    if (!s || !s.connected) {
      console.warn("[SOCKET] Cannot emit - not connected");
      return false;
    }
    const payload = { ...(data || {}) };
    if (!payload.token && token) payload.token = token;
    s.emit(event, payload);
    console.log("[SOCKET] Emitted:", event);
    return true;
  }, [token]);

  const value = useMemo(() => ({ socket, token, isConnected, reconnect, emit }), [socket, token, isConnected, reconnect, emit]);

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("useSocket must be used inside SocketProvider");
  return ctx;
};
