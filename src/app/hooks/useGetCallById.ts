import { useEffect, useState, useCallback } from 'react';
import { Call, useStreamVideoClient } from '@stream-io/video-react-sdk';

export const useGetCallById = (id: string | string[]) => {
  const [call, setCall] = useState<Call>();
  const [isCallLoading, setIsCallLoading] = useState(true);

  const client = useStreamVideoClient();

  const loadCall = useCallback(async () => {
    if (!client || !id) return;

    try {
      setIsCallLoading(true);
      // https://getstream.io/video/docs/react/guides/querying-calls/#filters
      const { calls } = await client.queryCalls({ filter_conditions: { id } });

      if (calls.length > 0) {
        setCall(calls[0]);
      }

      setIsCallLoading(false);
    } catch (error) {
      console.error('Error loading call:', error);
      setIsCallLoading(false);
    }
  }, [client, id]);

  useEffect(() => {
    loadCall();
  }, [loadCall]);

  return { call, isCallLoading };
};
