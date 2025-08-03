import { AlertCircle } from 'lucide-react';

export default function Error({ error }: { error: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center dark:bg-gray-900">
      <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg shadow max-w-md dark:shadow-gray-800">
        <div className="flex items-center text-red-600 dark:text-red-400 mb-4">
          <AlertCircle size={24} className="mr-2" />
          <h2 className="text-xl font-bold">Error</h2>
        </div>
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
        >
          Retry
        </button>
      </div>
    </div>
  );
} 