'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import { useNotification } from '@/context/NotificationProvider';
import { createVideoCallNotification } from '@/shared/utils/notificationHelpers';

interface CallIntegrationProps {
  conversationId: string;
}

const CallIntegration: React.FC<CallIntegrationProps> = ({ conversationId }) => {
  const { data: session } = useSession();
  const params = useParams();
  const meetingId = params?.id as string;
  const { addNotification } = useNotification();

  useEffect(() => {
    const sendCallMessage = async () => {
      if (!session?.user?.email || !meetingId) return;

      try {
        // Send a message to the conversation about the call
        const response = await fetch('/api/chat/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: `📞 Started a video call - Join here: ${window.location.origin}/videoChat/meeting/${meetingId}`,
            conversationId: conversationId,
            image: null,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to send call message');
        }
      } catch (error) {
        console.error('Error sending call message:', error);
      }
    };

    // Check if we're coming from a chat call
    const urlParams = new URLSearchParams(window.location.search);
    const fromChat = urlParams.get('fromChat');
    const chatConversationId = urlParams.get('conversationId');

    if (fromChat === 'true' && chatConversationId === conversationId) {
      sendCallMessage();
      
      // Create a video call notification
      const notification = createVideoCallNotification(
        session?.user?.name || 'Someone',
        'incoming',
        session?.user?.image || undefined
      );
      addNotification(notification);
    }
  }, [session?.user?.email, meetingId, conversationId]);

  return null; // This component doesn't render anything
};

export default CallIntegration; 