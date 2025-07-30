// components/ActiveStatus.tsx
'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import useActiveChannel from '@/app/hooks/useActiveChannel';

const ActiveStatus = () => {
  const [isClient, setIsClient] = useState(false);
  useActiveChannel();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    // Set initial online status using axios
    axios.post('/api/users/status', { isOnline: true })
      .then(() => console.log('User set to online'))
      .catch((error) => console.error('Failed to set online status:', error));

    const handleBeforeUnload = () => {
      const data = JSON.stringify({ isOnline: false });
      const blob = new Blob([data], { type: 'application/json' });

      // Use navigator.sendBeacon for reliable transmission
      navigator.sendBeacon('/api/users/status', blob);
    };

    // Add and clean up event listener
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isClient]);

  return null;
};

export default ActiveStatus;
