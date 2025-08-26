import { AlertCircle, Settings, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Error({ error }: { error: string }) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    window.location.reload();
  };

  const isCredentialError = error.toLowerCase().includes('failed to fetch') || 
                           error.toLowerCase().includes('no attendance') ||
                           error.toLowerCase().includes('unauthorized') ||
                           error.toLowerCase().includes('credential');

  const getErrorMessage = () => {
    if (isCredentialError) {
      return {
        title: "Unable to Load Attendance Data",
        description: "This could be due to incorrect NIT portal credentials or the system is still processing your data.",
        suggestions: [
          "Wait 5-10 minutes if you recently updated your credentials",
          "Verify your NIT username and password are correct",
          "Check if your account works on the official NIT attendance portal",
          "Contact web admins if you're sure your credentials are correct"
        ]
      };
    }
    
    return {
      title: "Error Loading Data",
      description: error,
      suggestions: [
        "Try refreshing the page",
        "Check your internet connection",
        "Contact support if the issue persists"
      ]
    };
  };

  const errorInfo = getErrorMessage();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="bg-card border border-border rounded-xl shadow-lg p-6 max-w-md w-full space-y-6">
        <div className="flex items-center justify-center">
          <div className="bg-destructive/10 rounded-full p-3">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
        </div>
        
        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold text-foreground">{errorInfo.title}</h2>
          <p className="text-muted-foreground text-sm">{errorInfo.description}</p>
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold text-foreground text-sm">What you can try:</h3>
          <ul className="text-sm text-muted-foreground space-y-2">
            {errorInfo.suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex-1"
            variant="default"
          >
            {isRefreshing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </>
            )}
          </Button>
          
          {isCredentialError && (
            <Button
              onClick={() => router.push('/attendance')}
              variant="outline"
              className="flex-1"
            >
              <Settings className="h-4 w-4 mr-2" />
              Check Settings
            </Button>
          )}
        </div>

        {isCredentialError && (
          <div className="text-xs text-center text-muted-foreground bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-lg p-3">
            <p className="font-medium text-amber-800 dark:text-amber-200 mb-1">💡 Quick Tip</p>
            <p className="text-amber-700 dark:text-amber-300">
              If you just updated your credentials, the system needs 5-15 minutes to process your attendance data for the first time.
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 