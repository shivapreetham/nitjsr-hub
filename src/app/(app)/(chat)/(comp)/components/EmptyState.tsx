'use client';

const EmptyState = () => {
  return (
    <div className="px-4 py-10 sm:px-6 lg:px-8 h-full flex justify-center items-center bg-background dark:bg-card/95 ">
      <div className="text-center items-center flex flex-col">
        <div className="relative">
          <div className="h-32 w-32 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center mb-6">
            <svg 
              className="w-16 h-16 text-primary/60 dark:text-primary/80" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
              />
            </svg>
          </div>
        </div>
        
        <h3 className="text-2xl font-semibold text-foreground mb-2">
          Select a chat or start a new conversation
        </h3>
        <p className="text-muted-foreground text-sm">
          Choose an existing conversation or create a new one to start messaging
        </p>
      </div>
    </div>
  );
};

export default EmptyState;