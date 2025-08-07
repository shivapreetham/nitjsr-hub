"use client";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type WSContextType = {
  socket: WebSocket | null;
  send: (payload: any) => void;
  readyState: number | null;
  token: string | null;
};

const WebSocketContext = createContext<WSContextType | null>(null);

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [readyState, setReadyState] = useState<number | null>(null);
  const [token, setToken] = useState<string | null>(() => {
    try { return sessionStorage.getItem("omegle_token"); } catch { return null; }
  });

  useEffect(() => {
    const url = (process.env.NEXT_PUBLIC_OMEGLE_SERVER_URL) as string;
    if (!url) {
      console.error("Missing NEXT_PUBLIC_OMEGLE_SERVER_URL");
      return;
    }
    const ws = new WebSocket(url.replace(/^http/, "ws"));
    setSocket(ws);
    setReadyState(ws.readyState);

    ws.onopen = () => {
      setReadyState(ws.readyState);
      console.log("[GLOBAL WS] Connected to server");
      // if we have a token from a previous session, try reconnect
      const savedToken = sessionStorage.getItem("omegle_token");
      if (savedToken) {
        console.log("[GLOBAL WS] Attempting reconnect with token:", savedToken);
        ws.send(JSON.stringify({ type: "reconnect", token: savedToken }));
      }
    };

    ws.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data);
        if (data.type === "welcome") {
          // server gave us a token - persist it
          if (data.token) {
            sessionStorage.setItem("omegle_token", data.token);
            setToken(data.token);
            console.log("[GLOBAL WS] Received welcome token:", data.token);
          }
        } else if (data.type === "reconnect_ok") {
          // server accepted our reconnect: store room if provided
          if (data.room) {
            sessionStorage.setItem("omegle_room", JSON.stringify({ room: data.room }));
            console.log("[GLOBAL WS] Reconnect successful, room:", data.room);
          } else {
            console.log("[GLOBAL WS] Reconnect successful, no room assigned");
          }
        } else if (data.type === "reconnect_failed") {
          console.log("[GLOBAL WS] Reconnect failed, starting fresh");
          sessionStorage.removeItem("omegle_token");
          sessionStorage.removeItem("omegle_room");
          setToken(null);
        }
        // NOTE: we intentionally don't handle all messages here - pages/components can set ws.onmessage locally
        console.debug("[GLOBAL WS] message", data);
      } catch (err) {
        console.error("[GLOBAL WS] message parse error", err);
      }
    };

    ws.onclose = () => {
      setReadyState(ws.readyState);
      console.log("[GLOBAL WS] WebSocket closed");
    };
    
    ws.onerror = () => {
      setReadyState(ws.readyState);
      console.error("[GLOBAL WS] WebSocket error");
    };

    return () => {
      try { ws.close(); } catch {}
    };
  }, []);

  const send = (payload: any) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(payload));
    } else {
      console.warn("WebSocket not open yet", socket?.readyState);
    }
  };

  const value = useMemo(() => ({ socket, send, readyState, token }), [socket, readyState, token]);
  return <WebSocketContext.Provider value={value}>{children}</WebSocketContext.Provider>;
}

export const useWebSocket = () => {
  const ctx = useContext(WebSocketContext);
  if (!ctx) throw new Error("useWebSocket must be used inside WebSocketProvider");
  return ctx;
};
