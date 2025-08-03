import { useEffect, useState, useCallback } from 'react';
import { Call, useStreamVideoClient } from '@stream-io/video-react-sdk';
import getCurrentUser from '@/app/(shared)/actions/getCurrentUser';

export const useGetCalls = () => {
  const client = useStreamVideoClient();
  const [calls, setCalls] = useState<Call[]>();
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    try {
      const user = await getCurrentUser();
      setUserId(user?.id || null);
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const loadCalls = useCallback(async () => {
    if (!client || !userId) return;

    setIsLoading(true);

    try {
      const { calls } = await client.queryCalls({
        sort: [{ field: 'starts_at', direction: -1 }],
        filter_conditions: {
          starts_at: { $exists: true },
          $or: [{ created_by_user_id: userId }, { members: { $in: [userId] } }],
        },
      });

      setCalls(calls);
    } catch (error) {
      console.error('Error loading calls:', error);
    } finally {
      setIsLoading(false);
    }
  }, [client, userId]);

  useEffect(() => {
    loadCalls();
  }, [loadCalls]);

  const now = new Date();

  const endedCalls = calls?.filter(({ state: { startsAt, endedAt } }: Call) => {
    return (startsAt && new Date(startsAt) < now) || !!endedAt;
  });

  const upcomingCalls = calls?.filter(({ state: { startsAt } }: Call) => {
    return startsAt && new Date(startsAt) > now;
  });

  return { endedCalls, upcomingCalls, callRecordings: calls, isLoading };
};
