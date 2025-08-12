import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/prismadb';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';

interface SessionUser {
  id: string;
  email: string;
}

export async function DELETE(
  request: NextRequest,
  {params}:{params :any}
) {
  try {
    // Get session and validate user
    const session = await getServerSession(authOptions);
    const user = session?.user as SessionUser | undefined;

    if (!user?.id) {
      return Response.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get and validate message ID from params
    const messageId = params.messageid;

    if (!messageId) {
      return Response.json(
        { success: false, message: 'Message ID is required' },
        { status: 400 }
      );
    }

    // Attempt to delete the message
    const deletedMessage = await prisma.anonymousMessage.deleteMany({
      where: {
        AND: [
          { id: messageId },
          { userId: user.id } // Ensure the user owns the message
        ]
      }
    });

    if (!deletedMessage.count) {
      return Response.json(
        { success: false, message: 'Message not found or already deleted' },
        { status: 404 }
      );
    }

    return Response.json(
      { success: true, message: 'Message deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error in DELETE:', error);
    
    // Check if it's a Prisma error related to invalid ID format
    if (error instanceof Error && error.message.includes('Invalid ObjectId')) {
      return Response.json(
        { success: false, message: 'Invalid message ID format' },
        { status: 400 }
      );
    }

    return Response.json(
      { success: false, message: 'Error deleting message' },
      { status: 500 }
    );
  }
}