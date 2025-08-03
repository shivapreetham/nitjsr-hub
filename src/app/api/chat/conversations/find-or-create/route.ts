// app/api/conversations/find-or-create/route.ts
import { NextResponse } from "next/server";
import prisma from "@/shared/lib/prismadb";
import getCurrentUser from "@/app/(shared)/serverActions/getCurrentUser";

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser?.id || !currentUser?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { userId, productTitle } = body;

    if (!userId) {
      return new NextResponse("User ID is required", { status: 400 });
    }

    // Check if users are the same
    if (userId === currentUser.id) {
      return new NextResponse("Cannot create conversation with yourself", { status: 400 });
    }

    // Check if the other user exists
    const user = await prisma.user.findUnique({
      where: {
        id: userId
      }
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Check for existing conversation between the two users
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        AND: [
          {
            userIds: {
              has: currentUser.id
            }
          },
          {
            userIds: {
              has: userId
            }
          },
          {
            isGroup: false
          }
        ]
      }
    });

    // If conversation exists, return its ID
    if (existingConversation) {
      return NextResponse.json({ conversationId: existingConversation.id });
    }

    // Create new conversation
    const newConversation = await prisma.conversation.create({
      data: {
        users: {
          connect: [
            {
              id: currentUser.id
            },
            {
              id: userId
            }
          ]
        },
        isGroup: false
      }
    });

    // If product title provided, create initial message
    if (productTitle) {
      await prisma.message.create({
        data: {
          body: `Hi, I'm interested in your product: ${productTitle}`,
          conversation: {
            connect: {
              id: newConversation.id
            }
          },
          sender: {
            connect: {
              id: currentUser.id
            }
          }
        }
      });

      // Update conversation's lastMessageAt
      await prisma.conversation.update({
        where: {
          id: newConversation.id
        },
        data: {
          lastMessageAt: new Date()
        }
      });
    }

    return NextResponse.json({ conversationId: newConversation.id });
  } catch (error) {
    console.error("ERROR_CONVERSATIONS_FIND_OR_CREATE", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}