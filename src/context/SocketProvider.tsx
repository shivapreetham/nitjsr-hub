"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  userId: string | null;
  emit: (event: string, data?: any) => void;
  reconnect: () => void;
}

const SocketContext = createContext<SocketContextType | null>(null);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | null>(null);
  const initializingRef = useRef<boolean>(false);

  const connect = useCallback(() => {
    if (initializingRef.current) return;
    initializingRef.current = true;

    const serverUrl = process.env.NEXT_PUBLIC_OMEGLE_SERVER_URL || 'http://localhost:10000';
    console.log('Connecting to:', serverUrl);

    const newSocket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      autoConnect: true,
      forceNew: true,
    });

    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
      setIsConnected(true);
      
      // Small delay to ensure connection is stable
      setTimeout(() => {
        console.log('Emitting init...');
        newSocket.emit('init');
      }, 100);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setIsConnected(false);
      setUserId(null);
      initializingRef.current = false;
    });

    newSocket.on('init_success', (data: { userId: string; token: string }) => {
      console.log('Init success:', data);
      setUserId(data.userId);
      initializingRef.current = false;
    });

    newSocket.on('connect_error', (err: Error) => {
      console.error('Socket connect_error:', err);
      setIsConnected(false);
      initializingRef.current = false;
    });

    newSocket.on('error', (err: any) => {
      console.error('Socket error:', err);
    });

    setSocket(newSocket);

    return () => {
      newSocket.removeAllListeners();
      newSocket.disconnect();
    };
  }, []);

  const reconnect = useCallback(() => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
      setUserId(null);
      initializingRef.current = false;
    }
    setTimeout(connect, 1000);
  }, [socket, connect]);

  useEffect(() => {
    const cleanup = connect();
    return cleanup;
  }, [connect]);

  const emit = useCallback((event: string, data?: any) => {
    if (socket && socket.connected) {
      console.log('Emitting:', event, data);
      socket.emit(event, data);
    } else {
      console.warn('Socket not connected, cannot emit:', event);
    }
  }, [socket]);

  const value: SocketContextType = {
    socket,
    isConnected,
    userId,
    emit,
    reconnect,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export const useSocket = (): SocketContextType => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used within a SocketProvider');
  return ctx;
};