import getCurrentUser from '@/app/(shared)/serverActions/getCurrentUser';
import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prismadb';
import { pusherServer } from '@/app/lib/pusher';


export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    const { conversationId } = await params;
    // console.log(params)
    // console.log(conversationId);
    if (!currentUser?.id || !currentUser?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // find the existing conversation
    const existingConversation = await prisma.conversation.findUnique({
      where: {
        id: conversationId,
      },
      include: {
        users: true,
      },
    });

    // check existing conversation
    if (!existingConversation) {
      return new NextResponse('Invalid ID', { status: 400 });
    }

    // delete the conversation
    const deletedConversation = await prisma.conversation.deleteMany({
      where: {
        id: conversationId,
        userIds: {
          hasSome: [currentUser.id],
        },
      },
    });

    existingConversation.users.forEach((user: any) => {
      if (user.email) {
        pusherServer.trigger(
          user.email,
          'conversation:delete',
          existingConversation
        );
      }
    });

    // return the deleted conversation
    return NextResponse.json(deletedConversation);
  } catch (error: any) {
    console.log(error, 'ERROR_CONVERSATION DELETE');
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
