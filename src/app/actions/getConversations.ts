import prisma from '@/lib/prismadb';
import getCurrentUser from './getCurrentUser';

const getConversations = async () => {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser?.id) return [];

    // First fetch just the conversations with users
    const conversations = await prisma.conversation.findMany({
      orderBy: {
        lastMessageAt: 'desc',
      },
      where: {
        userIds: {
          has: currentUser.id,
        },
      },
      include: {
        users: true,
      }
    });

    // Then enhance each conversation with its messages
    const enhancedConversations = await Promise.all(
      conversations.map(async (conversation) => {
        try {
          // First get messages without including sender to avoid null issues
          const messages = await prisma.message.findMany({
            where: {
              conversationId: conversation.id,
            },
            orderBy: {
              createdAt: 'desc',
            },
            select: {
              id: true,
              body: true,
              image: true,
              createdAt: true,
              senderId: true,
              seenIds: true,
            },
          });
          
          // Then fetch sender information separately for valid senderIds
          const validMessages = await Promise.all(
            messages.map(async (message) => {
              if (!message.senderId) {
                return null; // Skip messages without sender
              }
              
              try {
                const sender = await prisma.user.findUnique({
                  where: { id: message.senderId },
                  select: { id: true, username: true, email: true, image: true }
                });
                
                const seen = await prisma.user.findMany({
                  where: { id: { in: message.seenIds } },
                  select: { id: true, username: true, email: true, image: true }
                });
                
                return {
                  ...message,
                  sender,
                  seen,
                };
              } catch (error) {
                console.error(`Error fetching sender for message ${message.id}:`, error);
                return null; // Skip this message if sender fetch fails
              }
            })
          );
          
          // Filter out null messages
          const filteredMessages = validMessages.filter(msg => msg !== null);
          
          return {
            ...conversation,
            messages: filteredMessages,
          };
        } catch (error) {
          console.error(`Error fetching messages for conversation ${conversation.id}:`, error);
          // Return conversation with empty messages array if there's an error
          return {
            ...conversation,
            messages: [],
          };
        }
      })
    );

    return enhancedConversations;
  } catch (error: any) {
    console.error("Error fetching conversations:", error);
    return [];
  }
};

export default getConversations;