import { NextResponse } from "next/server";
import getCurrentUser from "@/app/(shared)/actions/getCurrentUser";
import prisma from "@/lib/prismadb";

export async function POST(
  request: Request,
  { params }: { params: any }
) {
  try {
    const { userId } = await request.json();
    const { conversationId } = params;
    if (!userId || !conversationId) {
      return new NextResponse('Invalid request data', { status: 400 });
    }
    const currentUser = await getCurrentUser();
    if (!currentUser?.id || !currentUser?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { users: true },
    });

    // Validate the conversation
    if (!conversation) {
      return new NextResponse('Invalid conversation ID', { status: 400 });
    }

    // Ensure the user is not already a member of the conversation
    const isUserAlreadyMember = conversation.users.some(user => user.id === userId);
    if (isUserAlreadyMember) {
      return new NextResponse('User is already a member of the conversation', { status: 400 });
    }

    // Add the user to the conversation's users
    const updatedConversation = await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        users: { connect: { id: userId } }, // Add the user to the conversation
        userIds: { push: userId },         // Update userIds array
      },
      include: { users: true },
    });

    // Add the conversation ID to the user's conversationIds
    await prisma.user.update({
      where: { id: userId },
      data: {
        conversationIds: { push: conversationId }, // Add conversation ID to user's conversationIds
      },
    });

    return NextResponse.json(updatedConversation);
  } catch (error) {
    console.error('ERROR_ADDING_USER_TO_CONVERSATION', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: any }
) {
  try {
    const currentUser = await getCurrentUser();
    const cparams = await params;
    const conversationId = cparams.conversationId;
    if (!currentUser?.id || !currentUser?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Find existing conversation
    const conversation = await prisma.conversation.findUnique({
      where: {
        id: conversationId,
      },
      include: {
        users: true
      }
    });

    if (!conversation) {
      return new NextResponse('Invalid conversation ID', { status: 400 });
    }

    // Check if this is a group conversation and not anonymous
    if (!conversation.isGroup || conversation.isAnonymous) {
      return new NextResponse('Operation not allowed', { status: 403 });
    }

    // Remove the current user from the conversation
    const updatedConversation = await prisma.conversation.update({
      where: {
        id: conversationId
      },
      data: {
        users: {
          disconnect: {
            id: currentUser.id
          }
        }
      },
      include: {
        users: true
      }
    });

    return NextResponse.json(updatedConversation);
  } catch (error) {
    console.error('ERROR_MEMBERS_DELETE', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}