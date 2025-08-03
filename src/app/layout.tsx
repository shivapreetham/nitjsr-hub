// app/layout.tsx
import type { Metadata } from "next";
import AuthProvider from "@/context/AuthProvider";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeProvider";
import ActiveStatus from "@/components/status&sidebar/ActiveStatus";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: "NIT JSR Hub - Your goto website for NIT Jamshedpur",
  description: "Your goto website for NIT Jamshedpur - Exclusive social platform for NIT Jamshedpur students with chat, video calls, attendance tracking, and campus marketplace.",
  keywords: "NIT Jamshedpur, NIT JSR, campus platform, student portal, chat, video calls, attendance tracker, marketplace",
  authors: [{ name: "NIT JSR Hub Team" }],
  creator: "NIT JSR Hub",
  publisher: "NIT JSR Hub",
  robots: "index, follow",
  openGraph: {
    title: "NIT JSR Hub - Your goto website for NIT Jamshedpur",
    description: "Your goto website for NIT Jamshedpur - Exclusive social platform for NIT Jamshedpur students with chat, video calls, attendance tracking, and campus marketplace.",
    type: "website",
    locale: "en_US",
    siteName: "NIT JSR Hub",
    images: [
      {
        url: "/logo_nit.png",
        width: 512,
        height: 512,
        alt: "NIT JSR Hub Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NIT JSR Hub - Your goto website for NIT Jamshedpur",
    description: "Your goto website for NIT Jamshedpur - Exclusive social platform for NIT Jamshedpur students",
    images: ["/logo_nit.png"],
  },
  icons: {
    icon: "/logo_nit.png",
    shortcut: "/logo_nit.png",
    apple: "/logo_nit.png",
  },
  manifest: "/manifest.json",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-background min-h-screen" suppressHydrationWarning>
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <ActiveStatus />
            {children}
            <Toaster />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}