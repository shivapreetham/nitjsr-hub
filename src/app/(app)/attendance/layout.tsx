// app/attendance/layout.tsx
'use client';
import Link from "next/link";
import { Calendar, Trophy, User } from "lucide-react";

export default function AttendanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-md">
        <div className="container mx-auto py-3 px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <User className="h-6 w-6" />
              <h1 className="text-xl font-semibold">Attendance Dashboard</h1>
            </div>
            <nav className="flex items-center">
              <Link 
                href="/attendance/calendar" 
                className="flex items-center gap-1.5 px-4 py-2 rounded-l-md hover:bg-primary/70 transition-colors"
              >
                <Calendar className="h-4 w-4" />
                <span>Calendar</span>
              </Link>
              <Link 
                href="/attendance/leaderboard" 
                className="flex items-center gap-1.5 px-4 py-2 rounded-r-md hover:bg-primary/70 transition-colors"
              >
                <Trophy className="h-4 w-4" />
                <span>Leaderboard</span>
              </Link>
            </nav>
          </div>
        </div>
      </header>
      <main className="container mx-auto py-6 px-4">
        <div className="bg-card rounded-lg shadow-sm p-4 md:p-6">
          <div>{children}</div>
        </div>
      </main>
      <footer className="container mx-auto py-4 px-4 text-center text-muted-foreground text-sm">
        <p>© {new Date().getFullYear()} Student Attendance System</p>
      </footer>
    </div>
  );
}