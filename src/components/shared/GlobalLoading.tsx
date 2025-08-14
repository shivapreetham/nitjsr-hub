'use client';

import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { ClipLoader } from 'react-spinners';
import LOADING_MESSAGES from '@/shared/constants/loadingMessages';
import getRandomIndex from '@/app/(app)/(chat)/(comp)/serverActions/getRandomIndex';
import { useLoading } from '@/context/LoadingProvider';

const GlobalLoading: React.FC = () => {
  const { isLoading, message } = useLoading();
  const index = getRandomIndex(LOADING_MESSAGES);
  const loadingText = message || LOADING_MESSAGES[index];

  return (
    <Transition.Root show={isLoading} as={Fragment}>
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
          <div className="fixed inset-0 bg-background/50 backdrop-blur-sm transition-opacity" />
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
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg glass-card px-8 py-6 text-center shadow-xl transition-all">
                <div className="flex flex-col items-center space-y-4">
                  <ClipLoader size={32} color="hsl(var(--primary))" />
                  <div className="max-w-sm">
                    <p className="text-foreground font-medium text-sm">{loadingText}</p>
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

export default GlobalLoading;