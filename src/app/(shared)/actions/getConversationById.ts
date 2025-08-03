import prisma from '@/lib/prismadb';
import getCurrentUser from './getCurrentUser';

const getConversationById = async (conversationId: string) => {
  try {
    const currentUser = await getCurrentUser();
    // console.log("getting conv by id", conversationId);
    if (!currentUser) return null;

    const conversation = await prisma.conversation.findUnique({
      where: {
        id: conversationId,
      },
      include: {
        users: true,
      },
    });

    return conversation;
  } catch (error: any) {
    return null;
  }
};

export default getConversationById;
