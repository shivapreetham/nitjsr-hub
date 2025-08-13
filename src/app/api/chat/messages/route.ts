import getCurrentUser from '@/app/(shared)/serverActions/getCurrentUser';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prismadb';
import { pusherServer } from '@/lib/pusher';
import { withErrorHandler, validateRequestBody, requireAuth, CustomApiError } from '@/lib/errorHandler';
import { createMessageSchema } from '@/shared/schemas/apiSchemas';
import { z } from 'zod';

type CreateMessageInput = z.infer<typeof createMessageSchema>;

async function postHandler(request: Request) {
  const currentUser = await getCurrentUser();
  requireAuth(currentUser);

  // Validate request body
  const body = await validateRequestBody<CreateMessageInput>(request, createMessageSchema);
  const { message, image, conversationId, replyToId, type, fileUrl, fileName, fileType, fileSize } = body;

  // Check if conversation exists and user has access
  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      userIds: {
        has: currentUser!.id,
      },
    },
  });

  if (!conversation) {
    throw new CustomApiError('Conversation not found or access denied', 404, 'CONVERSATION_NOT_FOUND');
  }

  // Validate reply-to message if provided
  if (replyToId) {
    const replyToMessage = await prisma.message.findFirst({
      where: {
        id: replyToId,
        conversationId: conversationId,
      },
    });

    if (!replyToMessage) {
      throw new CustomApiError('Reply-to message not found in this conversation', 400, 'INVALID_REPLY_TO');
    }
  }

    // Determine message type based on file or content
    const determineMessageType = () => {
      if (type) return type;
      if (fileUrl || image) {
        const url = fileUrl || image;
        if (url && url.toLowerCase().includes('.gif')) return 'GIF';
        if (url && url.toLowerCase().match(/\.(mp4|webm|ogg|avi|mov|wmv)$/)) return 'VIDEO';
        if (url && url.toLowerCase().match(/\.(jpg|jpeg|png|webp|svg)$/)) return 'IMAGE';
        return 'FILE';
      }
      return 'TEXT';
    };

    const newMessage = await prisma.message.create({
      data: {
        body: message,
        image: image || fileUrl, // Keep image field for backward compatibility
        fileUrl: fileUrl || image,
        fileName,
        fileType,
        fileSize,
        type: determineMessageType(),
        conversation: {
          connect: {
            id: conversationId,
          },
        },
        sender: {
          connect: {
            id: currentUser!.id,
          },
        },
        seen: {
          connect: {
            id: currentUser!.id,
          },
        },
        ...(replyToId && {
          replyTo: {
            connect: {
              id: replyToId,
            },
          },
        }),
      },

      include: {
        sender: true,
        seen: true,
        replyTo: {
          include: {
            sender: true,
          },
        },
        reactions: {
          include: {
            user: true,
          },
        },
      },
    });

    const updatedConversation = await prisma.conversation.update({
      where: {
        id: conversationId,
      },
      data: {
        lastMessageAt: new Date(),
        messages: {
          connect: {
            id: newMessage.id,
          },
        },
      },
      include: {
        users: true,
        messages: {
          include: {
            seen: true,
          },
        },
      },
    });

    //
    await pusherServer.trigger(conversationId, 'messages:new', newMessage);

    // get last message
    const lastMessage =
      updatedConversation.messages[updatedConversation.messages.length - 1];

    // send notification in chat sidebar to all users in the conversation
    updatedConversation.users.map((user:any) => {
      pusherServer.trigger(user.email!, 'conversation:update', {
        id: conversationId,
        messages: [lastMessage],
      });
    });

    return NextResponse.json({
      success: true,
      data: newMessage,
    });
}

export const POST = withErrorHandler(postHandler);
