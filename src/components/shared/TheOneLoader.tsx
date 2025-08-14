'use client';

import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { ClipLoader } from 'react-spinners';
import LOADING_MESSAGES from '@/shared/constants/loadingMessages';
import getRandomIndex from '@/app/(app)/(chat)/(comp)/serverActions/getRandomIndex';

interface TheOneLoaderProps {
  /** Whether loading state is active */
  show?: boolean;
  /** Custom loading message (will be overridden by random joke if not provided) */
  message?: string;
  /** Whether to show as overlay/modal (default: true) */
  overlay?: boolean;
  /** Loading spinner size (default: 32) */
  size?: number;
  /** Custom className for container */
  className?: string;
  /** Whether to show the random joke (default: true) */
  showJoke?: boolean;
}

/**
 * 🎯 THE ONE AND ONLY LOADER COMPONENT 🎯
 * 
 * This is the SINGLE loading component that should be used EVERYWHERE in the app.
 * 
 * ✅ DO: Use this component for all loading states
 * ❌ DON'T: Create new loading components or use other loaders
 * 
 * Features:
 * - Consistent styling across the entire app
 * - Engaging jokes and fun messages
 * - Flexible configuration (overlay, inline, custom size)
 * - Beautiful animations and transitions
 * - Works with the global loading context
 * 
 * Usage:
 * - For global loading: <TheOneLoader show={isLoading} />
 * - For page loading: <TheOneLoader overlay={false} />
 * - For custom loading: <TheOneLoader message="Custom message" showJoke={false} />
 */
const TheOneLoader: React.FC<TheOneLoaderProps> = ({
  show = true,
  message,
  overlay = true,
  size = 32,
  className = '',
  showJoke = true
}) => {
  const index = getRandomIndex(LOADING_MESSAGES);
  const jokeMessage = LOADING_MESSAGES[index];
  
  // Use custom message if provided, otherwise use random joke
  const displayMessage = message || (showJoke ? jokeMessage : 'Loading...');

  // Non-overlay version (inline loading) - for page-level loading
  if (!overlay) {
    return (
      <div className={`flex flex-col items-center justify-center py-16 ${className}`}>
        <div className="relative">
          {/* Outer ring for visual appeal */}
          <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping" />
          <ClipLoader 
            size={size} 
            color="hsl(var(--primary))" 
            cssOverride={{
              borderWidth: '3px',
            }}
          />
        </div>
        <div className="mt-6 max-w-sm text-center">
          <p className="text-foreground font-medium text-sm leading-relaxed px-4">
            {displayMessage}
          </p>
        </div>
      </div>
    );
  }

  // Overlay/Modal version - for action-based loading
  return (
    <Transition.Root show={show} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={() => {}}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-background/60 backdrop-blur-sm transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-center justify-center min-h-full p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className={`relative transform overflow-hidden rounded-2xl bg-background/95 backdrop-blur-lg border border-border/50 px-8 py-6 text-center shadow-2xl transition-all max-w-sm ${className}`}>
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    {/* Outer ring for visual appeal */}
                    <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping" />
                    <ClipLoader 
                      size={size} 
                      color="hsl(var(--primary))" 
                      cssOverride={{
                        borderWidth: '3px',
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <p className="text-foreground font-semibold text-sm">
                      Hold tight!
                    </p>
                    <p className="text-foreground/80 font-medium text-sm leading-relaxed">
                      {displayMessage}
                    </p>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default TheOneLoader;