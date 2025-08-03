import { NextResponse } from 'next/server';
import prisma from '@/shared/lib/prismadb';
import getCurrentUser from '@/app/(shared)/serverActions/getCurrentUser';
import { pusherServer } from '@/shared/lib/pusher';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ messageId: string }> }
) {
  try {
    const { messageId } = await params;

    if (!messageId) {
      return new NextResponse('Message ID is required', { status: 400 });
    }

    const message = await prisma.message.findUnique({
      where: {
        id: messageId
      },
      include: {
        seen: true,
        sender: true
      }
    });

    if (!message) {
      return new NextResponse('Message not found', { status: 404 });
    }

    return NextResponse.json(message);
  } catch (error) {
    console.log(error, 'ERROR_MESSAGE_GET');
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ messageId: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    const { messageId } = await params;

    if (!currentUser?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    if (!messageId) {
      return new NextResponse('Message ID is required', { status: 400 });
    }

    const existingMessage = await prisma.message.findUnique({
      where: {
        id: messageId
      },
      include: {
        seen: true,
        sender: true
      }
    });

    if (!existingMessage) {
      return new NextResponse('Message not found', { status: 404 });
    }

    // Check if the current user is the message sender
    if (existingMessage.senderId !== currentUser.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Delete the message
    const deletedMessage = await prisma.message.delete({
      where: {
        id: messageId
      },
      include: {
        seen: true,
        sender: true
      }
    });

    // Trigger Pusher event for real-time deletion
    await pusherServer.trigger(
      existingMessage.conversationId, 
      'message:delete', 
      {
        id: messageId,
        conversationId: existingMessage.conversationId
      }
    );

    return NextResponse.json(deletedMessage);
  } catch (error) {
    console.log(error, 'ERROR_MESSAGE_DELETE');
    return new NextResponse('Internal Error', { status: 500 });
  }
}