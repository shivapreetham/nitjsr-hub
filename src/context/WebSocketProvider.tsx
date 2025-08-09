"use client";
import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";

type WSContextType = {
  socket: WebSocket | null;
  send: (payload: any) => void;
  readyState: number | null;
  token: string | null;
  isConnected: boolean;
  reconnect: () => void;
};

const WebSocketContext = createContext<WSContextType | null>(null);

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [readyState, setReadyState] = useState<number | null>(null);
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
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  const createConnection = useCallback(() => {
    const url = process.env.NEXT_PUBLIC_OMEGLE_SERVER_URL;
    if (!url) {
      console.error("[WS] Missing NEXT_PUBLIC_OMEGLE_SERVER_URL");
      return;
    }

    console.log("[WS] Creating new WebSocket connection");
    const ws = new WebSocket(url.replace(/^http/, "ws"));
    
    ws.onopen = () => {
      console.log("[WS] Connected to server");
      setReadyState(ws.readyState);
      setIsConnected(true);
      setReconnectAttempts(0);
      
      // Try to reconnect with existing token if available
      const savedToken = token || (typeof window !== 'undefined' ? sessionStorage.getItem("omegle_token") : null);
      if (savedToken) {
        console.log("[WS] Attempting reconnect with existing token");
        ws.send(JSON.stringify({ type: "reconnect", token: savedToken }));
      }
    };

    ws.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data);
        console.log("[WS] Global message received:", data.type);
        
        // Only handle global-level messages here
        if (data.type === "welcome" && data.token) {
          console.log("[WS] Received welcome with token:", data.token);
          setToken(data.token);
          if (typeof window !== 'undefined') {
            sessionStorage.setItem("omegle_token", data.token);
          }
        } else if (data.type === "reconnect_ok") {
          console.log("[WS] Reconnect successful");
          if (data.room) {
            console.log("[WS] Reconnected to room:", data.room);
          }
        } else if (data.type === "reconnect_failed") {
          console.log("[WS] Reconnect failed, starting fresh");
          setToken(null);
          if (typeof window !== 'undefined') {
            sessionStorage.removeItem("omegle_token");
            sessionStorage.removeItem("omegle_room");
          }
        }
        // Don't handle other message types here - let individual pages handle them
      } catch (err) {
        console.error("[WS] Message parse error:", err);
      }
    };

    ws.onclose = (event) => {
      console.log("[WS] Connection closed:", event.code, event.reason);
      setReadyState(ws.readyState);
      setIsConnected(false);
      
      // Attempt to reconnect if it wasn't a clean close
      if (event.code !== 1000 && reconnectAttempts < 5) {
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 10000);
        console.log(`[WS] Reconnecting in ${delay}ms (attempt ${reconnectAttempts + 1})`);
        setTimeout(() => {
          setReconnectAttempts(prev => prev + 1);
          createConnection();
        }, delay);
      }
    };
    
    ws.onerror = (error) => {
      console.error("[WS] WebSocket error:", error);
      setReadyState(ws.readyState);
      setIsConnected(false);
    };

    setSocket(ws);
    setReadyState(ws.readyState);
    
    return ws;
  }, [token, reconnectAttempts]);

  const reconnect = useCallback(() => {
    console.log("[WS] Manual reconnect triggered");
    if (socket) {
      socket.close();
    }
    setReconnectAttempts(0);
    createConnection();
  }, [socket, createConnection]);

  useEffect(() => {
    const ws = createConnection();
    
    return () => {
      if (ws) {
        console.log("[WS] Cleaning up WebSocket connection");
        ws.close(1000, "Component unmounting");
      }
    };
  }, []); // Only run once on mount

  const send = useCallback((payload: any) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      const message = JSON.stringify(payload);
      socket.send(message);
      console.log("[WS] Sent message:", payload.type);
      return true;
    } else {
      console.warn("[WS] Cannot send message - WebSocket not ready. State:", socket?.readyState);
      return false;
    }
  }, [socket]);

  const value = useMemo(() => ({ 
    socket, 
    send, 
    readyState, 
    token, 
    isConnected,
    reconnect
  }), [socket, send, readyState, token, isConnected, reconnect]);

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}

export const useWebSocket = () => {
  const ctx = useContext(WebSocketContext);
  if (!ctx) {
    throw new Error("useWebSocket must be used inside WebSocketProvider");
  }
  return ctx;
};