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
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const connect = useCallback(() => {
    const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001';

    // Cleanup previous socket
    if (socketRef.current) {
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    const newSocket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      timeout: 10000,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      autoConnect: true,
    });

    socketRef.current = newSocket;

    newSocket.on('connect', () => {
      setIsConnected(true);
      newSocket.emit('init');
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('init_success', (data: { userId: string }) => {
      setUserId(data.userId);
    });

    newSocket.on('connect_error', (err) => {
      console.error('Socket connect_error', err);
      setIsConnected(false);
    });

  }, []);

  useEffect(() => {
    connect();
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [connect]);

  const emit = useCallback((event: string, data?: any) => {
    try {
      if (socketRef.current && typeof socketRef.current.emit === 'function') {
        socketRef.current.emit(event, data);
      } else {
        console.warn('Socket not ready to emit:', event);
      }
    } catch (err) {
      console.error('Emit error', err);
    }
  }, []);

  const value: SocketContextType = {
    socket: socketRef.current,
    isConnected,
    userId,
    emit,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used within a SocketProvider');
  return ctx;
};