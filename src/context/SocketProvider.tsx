"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  userId: string | null;
  emit: (event: string, data?: any) => void;
}

const SocketContext = createContext<SocketContextType | null>(null);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  // Use ref to hold the socket so emits/listeners always reference the latest socket
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const connect = useCallback(() => {
    const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001';

    // If there is an existing socket, clean it up first
    if (socketRef.current) {
      try {
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
      } catch (err) {
        console.warn("Error while disconnecting previous socket", err);
      }
      socketRef.current = null;
    }

    const socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      timeout: 10000,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      autoConnect: true,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to server via socket.io:', socket.id);
      setIsConnected(true);
      // ask server to init the user
      socket.emit('init');
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setIsConnected(false);
    });

    socket.on('init_success', (data: { userId: string }) => {
      console.log('init_success', data);
      setUserId(data.userId);
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connect_error', err);
      setIsConnected(false);
    });

    // keep a small console debug for other events if needed
    // socket.onAny((event, ...args) => console.debug('[socket event]', event, args));
  }, []);

  useEffect(() => {
    connect();
    // cleanup on unmount
    return () => {
      if (socketRef.current) {
        try {
          socketRef.current.removeAllListeners();
          socketRef.current.disconnect();
        } catch (err) {
          console.warn("Socket cleanup error", err);
        }
        socketRef.current = null;
      }
    };
  }, [connect]);

  // emit helper: always use socketRef.current (don't gate on isConnected boolean which can be stale)
  const emit = useCallback((event: string, data?: any) => {
    try {
      if (socketRef.current && socketRef.current.connected) {
        socketRef.current.emit(event, data);
      } else if (socketRef.current) {
        // If socket exists but not connected yet, try emit anyway (socket.io will queue until connected)
        socketRef.current.emit(event, data);
      } else {
        console.warn('emit called but socketRef.current is null', event, data);
      }
    } catch (err) {
      console.error('emit error', err);
    }
  }, []);

  const value: SocketContextType = {
    socket: socketRef.current,
    isConnected,
    userId,
    emit
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used within a SocketProvider');
  return ctx;
};
