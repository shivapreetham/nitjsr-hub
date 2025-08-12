import getCurrentUser from '@/app/(shared)/serverActions/getCurrentUser';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prismadb';
import { pusherServer } from '@/lib/pusher';

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    const body = await request.json();
    const { message, image, conversationId, replyToId, type, fileUrl, fileName, fileType, fileSize } = body;

    if (!currentUser?.id || !currentUser?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Determine message type based on file or content
    const determineMessageType = () => {
      if (type) return type;
      if (fileUrl || image) {
        const url = fileUrl || image;
        if (url.toLowerCase().includes('.gif')) return 'GIF';
        if (url.toLowerCase().match(/\.(mp4|webm|ogg|avi|mov|wmv)$/)) return 'VIDEO';
        if (url.toLowerCase().match(/\.(jpg|jpeg|png|webp|svg)$/)) return 'IMAGE';
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
            id: currentUser.id,
          },
        },
        seen: {
          connect: {
            id: currentUser.id,
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

    return NextResponse.json(newMessage);
  } catch (error: any) {
    console.log(error, 'ERROR_MESSAGES');
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
