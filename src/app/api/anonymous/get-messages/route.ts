import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import prisma from '@/lib/prismadb';

interface SessionUser {
  id: string;
  email: string;
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser | undefined;

  if (!user?.id) {
    return NextResponse.json(
      { success: false, message: 'Not authenticated' },
      { status: 401 }
    );
  }

  try {
    const messages = await prisma.anonymousMessage.findMany({
      where: {
        userId: user.id
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        content: true,
        createdAt: true
      }
    });

    if (!messages.length) {
      return NextResponse.json(
        { message: 'You have no messages yet 😒', success: false },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { 
        success: true,
        anonymousMessages: messages 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('An unexpected error occurred in getting msgs:', error);
    return NextResponse.json(
      { message: 'Internal server error', success: false },
      { status: 500 }
    );
  }
}