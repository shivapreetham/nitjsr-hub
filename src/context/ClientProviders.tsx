"use client";
import { SocketProvider } from "@/context/SocketProvider";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <SocketProvider>
      {children}
    </SocketProvider>
  );
}
