export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center">
        <div className="animate-spin h-12 w-12 border-4 border-primary rounded-full border-t-transparent mb-4"></div>
        <p className="text-muted-foreground text-lg">Loading your attendance data...</p>
      </div>
    </div>
  );
} 