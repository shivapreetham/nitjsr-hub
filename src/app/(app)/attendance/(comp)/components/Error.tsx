import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Error({ error }: { error: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="bg-destructive/10 border border-destructive/20 p-6 rounded-lg shadow max-w-md">
        <div className="flex items-center text-destructive mb-4">
          <AlertCircle size={24} className="mr-2" />
          <h2 className="text-xl font-bold">Error</h2>
        </div>
        <p className="text-destructive">{error}</p>
        <Button
          onClick={() => window.location.reload()}
          variant="destructive"
          className="mt-4"
        >
          Retry
        </Button>
      </div>
    </div>
  );
} 