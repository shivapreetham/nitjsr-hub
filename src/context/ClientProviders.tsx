"use client";
import { WebSocketProvider } from "@/context/WebSocketProvider";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <WebSocketProvider>
      {children}
    </WebSocketProvider>
  );
}
