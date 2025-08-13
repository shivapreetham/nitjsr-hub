import { useEffect, useState } from 'react';
import { useStreamVideoClient } from '@stream-io/video-react-sdk';

export const useCallParticipants = (callId: string | null) => {
  const [participantCount, setParticipantCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  const client = useStreamVideoClient();

  useEffect(() => {
    if (!client || !callId) {
      setParticipantCount(0);
      return;
    }

    const getParticipantCount = async () => {
      try {
        setIsLoading(true);
        // Query the specific call
        const { calls } = await client.queryCalls({ 
          filter_conditions: { id: callId } 
        });

        if (calls.length > 0) {
          const call = calls[0];
          // Get the current state of the call
          const callState = call.state;
          
          // Count participants who are currently connected
          const activeParticipants = callState.participants.length;
          
          setParticipantCount(activeParticipants);
        } else {
          setParticipantCount(0);
        }
      } catch (error) {
        console.error('Error fetching participant count:', error);
        setParticipantCount(0);
      } finally {
        setIsLoading(false);
      }
    };

    // Initial fetch
    getParticipantCount();

    // Set up polling every 10 seconds to keep count updated
    const interval = setInterval(getParticipantCount, 10000);

    return () => {
      clearInterval(interval);
    };
  }, [client, callId]);

  return { participantCount, isLoading };
};