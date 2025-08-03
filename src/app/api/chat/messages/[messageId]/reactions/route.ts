import { NextRequest, NextResponse } from 'next/server';
import getCurrentUser from '@/app/(shared)/actions/getCurrentUser';
import prisma from '@/lib/prismadb';
import { pusherServer } from '@/lib/pusher';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ messageId: string }> }
) {
  const { messageId } = await params;
  try {
    const currentUser = await getCurrentUser();
    const { emoji } = await request.json();

    if (!currentUser?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    if (!emoji) {
      return new NextResponse('Emoji is required', { status: 400 });
    }

    // Check if reaction already exists
    const existingReaction = await prisma.reaction.findUnique({
      where: {
        messageId_userId_emoji: {
          messageId: messageId,
          userId: currentUser.id,
          emoji: emoji,
        },
      },
    });

    if (existingReaction) {
      // Remove the reaction (toggle off)
      await prisma.reaction.delete({
        where: {
          id: existingReaction.id,
        },
      });
    } else {
      // Add the reaction
      await prisma.reaction.create({
        data: {
          emoji,
          messageId: messageId,
          userId: currentUser.id,
        },
        include: {
          user: true,
        },
      });
    }

    // Get updated message with reactions
    const updatedMessage = await prisma.message.findUnique({
      where: {
        id: messageId,
      },
      include: {
        reactions: {
          include: {
            user: true,
          },
        },
        conversation: true,
      },
    });

    if (updatedMessage) {
      // Trigger Pusher event for real-time updates
      await pusherServer.trigger(
        updatedMessage.conversationId,
        'message:reaction-update',
        {
          messageId: messageId,
          reactions: updatedMessage.reactions,
        }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error handling reaction:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ messageId: string }> }
) {
  const { messageId } = await params;
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const reactions = await prisma.reaction.findMany({
      where: {
        messageId: messageId,
      },
      include: {
        user: true,
      },
    });

    return NextResponse.json(reactions);
  } catch (error) {
    console.error('Error fetching reactions:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 