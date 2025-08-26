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
        title: "Attendance Data Not Available",
        description: "If you just added your credentials, please wait 5-10 minutes for your attendance data to be processed. If credentials are correct, attendance details will be displayed. Otherwise, your credentials may be wrong - please update them after 10-15 minutes. If you're sure your credentials work on the NIT JSR attendance portal, contact the web admins.",
        suggestions: [
          "Wait 5-10 minutes if you recently added credentials",
          "Check your credentials after 10-15 minutes if no data appears", 
          "Verify your credentials work on the official NIT portal",
          "Contact web admins if you're certain your credentials are correct"
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