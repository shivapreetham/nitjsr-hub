import { NextResponse } from "next/server";
import prisma from "@/lib/prismadb";
import type { NextRequest } from "next/server";

// Interface for conversation data to ensure type safety
interface Conversation {
  id: string;
  name: string | null;
  userIds: string[];
}

export async function POST(req: NextRequest) {
  // Restrict to POST requests
  if (req.method !== "POST") {
    return NextResponse.json({ message: "Method not allowed" }, { status: 405 });
  }

  try {
    // Fetch all conversations with relevant fields
    const allConversations = await prisma.conversation.findMany({
      select: {
        id: true,
        name: true,
        userIds: true,
      },
    });

    // Define index signature for nameToConversations
    const nameToConversations: { [key: string]: Conversation[] } = {};

    // Group conversations by name, filtering out null names
    allConversations.reduce((acc, conv) => {
      if (conv.name !== null) { // Null check for name
        if (!acc[conv.name]) { // Line 31: acc[conv.name]
          acc[conv.name] = [];
        }
        acc[conv.name].push(conv); // Line 32: acc[conv.name].push
      }
      return acc;
    }, nameToConversations);

    // Process each group of duplicates
    for (const [name, conversations] of Object.entries(nameToConversations)) { // Line 34: Object.entries(nameToConversations)
      if (name !== null && conversations.length > 1) {
        // Choose the primary conversation (e.g., with most users)
        const primaryConv = conversations.sort((a, b) => b.userIds.length - a.userIds.length)[0];
        const duplicateConvs = conversations.filter((c) => c.id !== primaryConv.id);
        const duplicateIds = duplicateConvs.map((c) => c.id);

        // Update messages to point to the primary conversation
        await prisma.message.updateMany({
          where: {
            conversationId: {
              in: duplicateIds,
            },
          },
          data: {
            conversationId: primaryConv.id,
          },
        });

        // Merge userIds from duplicates into the primary conversation
        const allUserIds = new Set(duplicateConvs.flatMap((c) => c.userIds));
        const primaryUserIds = new Set(primaryConv.userIds);
        const usersToAdd = [...allUserIds].filter((userId) => !primaryUserIds.has(userId));
        if (usersToAdd.length > 0) {
          await prisma.conversation.update({
            where: { id: primaryConv.id },
            data: {
              userIds: {
                push: usersToAdd,
              },
            },
          });
        }

        // Update users' conversationIds
        for (const userId of allUserIds) {
          const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { conversationIds: true },
          });
          if (user) {
            const updatedConversationIds = user.conversationIds.map((id) =>
              duplicateIds.includes(id) ? primaryConv.id : id
            );
            const uniqueIds = [...new Set(updatedConversationIds)];
            await prisma.user.update({
              where: { id: userId },
              data: {
                conversationIds: uniqueIds,
              },
            });
          }
        }

        // Delete duplicate conversations
        await prisma.conversation.deleteMany({
          where: {
            id: {
              in: duplicateIds,
            },
          },
        });

        console.log(`Merged duplicates for group ${name} into conversation ${primaryConv.id}`);
      }
    }

    return NextResponse.json({ message: "Cleanup completed successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error during cleanup:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}