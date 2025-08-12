import prisma from '@/lib/prismadb';

const getMessages = async (conversationId: string) => {
  try {
    const messages = await prisma.message.findMany({
      where: {
        conversationId,
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
      orderBy: {
        createdAt: 'asc',
      },
    });

    return messages;
  } catch (error: any) {
    return [];
  }
};

export default getMessages;
