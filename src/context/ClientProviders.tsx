"use client";
import { SocketProvider } from "@/context/SocketProvider";
import { NotificationProvider } from "@/context/NotificationProvider";
import { LoadingProvider } from "@/context/LoadingProvider";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <SocketProvider>
      <NotificationProvider>
        <LoadingProvider>
          {children}
        </LoadingProvider>
      </NotificationProvider>
    </SocketProvider>
  );
}
