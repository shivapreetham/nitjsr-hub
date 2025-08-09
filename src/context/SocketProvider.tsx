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
    // pass token in auth so server can reattach identity immediately
    const auth = { token: token || (typeof window !== 'undefined' ? sessionStorage.getItem("omegle_token") : null) };
    console.log("[SOCKET] Creating connection to:", url, "auth:", Boolean(auth.token));

    if (socketRef.current) {
      try { socketRef.current.removeAllListeners(); socketRef.current.disconnect(); } catch (e) {}
    }

    const newSocket = io(url, {
      transports: ['websocket', 'polling'],
      timeout: 5000,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      auth
    });

    newSocket.on('connect', () => {
      console.log("[SOCKET] Connected to server");
      setIsConnected(true);
    });

    newSocket.on('disconnect', (reason: any) => { console.log("[SOCKET] Disconnected:", reason); setIsConnected(false); });

    newSocket.on('connect_error', (error: any) => { console.error("[SOCKET] Connection error:", error); setIsConnected(false); });

    newSocket.on('welcome', (data: any) => {
      console.log("[SOCKET] Received welcome with token:", data.token);
      setToken(data.token);
      if (typeof window !== 'undefined') sessionStorage.setItem("omegle_token", data.token);
    });

    newSocket.on('reconnect_success', (data: any) => {
      console.log("[SOCKET] Reconnect successful", data);
      // server sends room,userId if applicable
      if (data && data.room) {
        // store and navigate handled by pages when observing socket events
      }
    });

    newSocket.on('reconnect_failed', () => {
      console.log("[SOCKET] Reconnect failed, clearing token");
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
    if (socketRef.current) { socketRef.current.disconnect(); socketRef.current.removeAllListeners(); socketRef.current = null; }
    createConnection();
  }, [createConnection]);

  const emit = useCallback((event: string, data?: any) => {
    if (!socketRef.current || !socketRef.current.connected) {
      console.warn("[SOCKET] Cannot emit - not connected");
      return false;
    }
    try {
      // token is sent in connection auth; but include for older server compatibility
      const payload = { ...(data || {}) };
      if (!payload.token && token) payload.token = token;
      socketRef.current.emit(event, payload);
      // debug log
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
