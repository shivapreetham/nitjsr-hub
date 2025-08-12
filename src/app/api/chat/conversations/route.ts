import getCurrentUser from '@/app/(shared)/serverActions/getCurrentUser';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prismadb';
import { pusherServer } from '@/lib/pusher';

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    const body = await request.json();
    const { name  , members, isAnonymous, isGroup, userId } = body;
    // console.log(currentUser);
    if (!currentUser?.id || !currentUser?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    if (isGroup && (!members || !name || members.length < 2)) {
      return new NextResponse('Group should atleast have 3 members', {
        status: 400,
      });
    }

    if (isGroup) {
      const newConversation = await prisma.conversation.create({
        data: {
          name,
          isGroup,
          isAnonymous: isAnonymous || false,
          users: {
            connect: [
              { id: currentUser.id },
              ...members.map((member: { value: string }) => ({
                id: member.value,
              })),
            ],
          },
        },
        include: {
          users: true,
        },
      });

      newConversation.users.forEach((user: any) => {
        if (user.email) {
          pusherServer.trigger(user.email, 'conversation:new', newConversation);
        }
      });

      return NextResponse.json(newConversation);
    }

    const existingConversations = await prisma.conversation.findMany({
      where: {
        OR: [
          {
            userIds: {
              equals: [currentUser.id, userId],
            },
          },
          {
            userIds: {
              equals: [userId, currentUser.id],
            },
          },
        ],
      },
    });

    const existingConversation = existingConversations[0];

    if (existingConversation) {
      return NextResponse.json(existingConversation);
    }

    const newConversation = await prisma.conversation.create({
      data: {
        isAnonymous: isAnonymous || false,
        users: {
          connect: [{ id: currentUser.id }, { id: userId }],
        },
      },
      include: {
        users: true,
      },
    });

    newConversation.users.map((user: any) => {
      if (user.email) {
        pusherServer.trigger(user.email, 'conversation:new', newConversation);
      }
    });

    return NextResponse.json(newConversation);
  } catch (error: any) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}