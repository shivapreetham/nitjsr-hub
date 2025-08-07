export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center dark:bg-gray-900">
      <div className="flex flex-col items-center">
        <div className="animate-spin h-12 w-12 border-4 border-blue-500 rounded-full border-t-transparent mb-4"></div>
        <p className="text-gray-600 dark:text-gray-300 text-lg">Loading your attendance data...</p>
      </div>
    </div>
  );
} 