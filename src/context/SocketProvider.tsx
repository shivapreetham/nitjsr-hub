"use client";
import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";

type SocketContextType = {
  socket: Socket | null;
  token: string | null;
  isConnected: boolean;
  reconnect: () => void;
  emit: (event: string, data?: any) => void;
};

const SocketContext = createContext<SocketContextType | null>(null);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      try { 
        return sessionStorage.getItem("omegle_token"); 
      } catch { 
        return null; 
      }
    }
    return null;
  });
  const [isConnected, setIsConnected] = useState(false);

  const createConnection = useCallback(() => {
    const url = process.env.NEXT_PUBLIC_OMEGLE_SERVER_URL || 'http://localhost:3001';
    console.log("[SOCKET] Creating connection to:", url);
    
    const newSocket = io(url, {
      transports: ['websocket', 'polling'],
      timeout: 5000,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    
    newSocket.on('connect', () => {
      console.log("[SOCKET] Connected to server");
      setIsConnected(true);
      
      // Try to reconnect with existing token
      const savedToken = token || (typeof window !== 'undefined' ? sessionStorage.getItem("omegle_token") : null);
      if (savedToken) {
        console.log("[SOCKET] Attempting reconnect with token");
        newSocket.emit('reconnect_user', { token: savedToken });
      }
    });

    newSocket.on('disconnect', (reason) => {
      console.log("[SOCKET] Disconnected:", reason);
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error("[SOCKET] Connection error:", error);
      setIsConnected(false);
    });

    // Handle global events
    newSocket.on('welcome', (data) => {
      console.log("[SOCKET] Received welcome with token:", data.token);
      setToken(data.token);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem("omegle_token", data.token);
      }
    });

    newSocket.on('reconnect_success', (data) => {
      console.log("[SOCKET] Reconnect successful");
      if (data.room) {
        console.log("[SOCKET] Reconnected to room:", data.room);
      }
    });

    newSocket.on('reconnect_failed', () => {
      console.log("[SOCKET] Reconnect failed, starting fresh");
      setToken(null);
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem("omegle_token");
        sessionStorage.removeItem("omegle_room");
      }
    });

    setSocket(newSocket);
    return newSocket;
  }, [token]);

  const reconnect = useCallback(() => {
    console.log("[SOCKET] Manual reconnect triggered");
    if (socket) {
      socket.disconnect();
    }
    createConnection();
  }, [socket, createConnection]);

  const emit = useCallback((event: string, data?: any) => {
    if (socket && isConnected) {
      socket.emit(event, data);
      console.log("[SOCKET] Emitted:", event);
      return true;
    } else {
      console.warn("[SOCKET] Cannot emit - not connected");
      return false;
    }
  }, [socket, isConnected]);

  useEffect(() => {
    const newSocket = createConnection();
    
    return () => {
      console.log("[SOCKET] Cleaning up connection");
      newSocket.disconnect();
    };
  }, []); // Only run once

  const value = useMemo(() => ({ 
    socket, 
    token, 
    isConnected,
    reconnect,
    emit
  }), [socket, token, isConnected, reconnect, emit]);

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) {
    throw new Error("useSocket must be used inside SocketProvider");
  }
  return ctx;
};