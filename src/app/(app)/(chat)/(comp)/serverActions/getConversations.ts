import prisma from '@/shared/lib/prismadb';
import getCurrentUser from '../../../../(shared)/serverActions/getCurrentUser';

const getConversations = async () => {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser?.id) return [];

    // Fetch conversations with all required message fields
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
        messages: {
          orderBy: {
            createdAt: 'asc',
          },
          include: {
            sender: true,
            seen: true,
            replyTo: {
              include: {
                sender: true,
                seen: true,
              },
            },
            reactions: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    return conversations;
  } catch (error: any) {
    console.error('Error fetching conversations:', error);
    return [];
  }
};

export default getConversations;