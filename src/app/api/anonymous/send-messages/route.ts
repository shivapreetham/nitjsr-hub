import { NextResponse } from 'next/server';
import prisma from '@/lib/prismadb';

export async function POST(request: Request) {
  try {
    const { username, content } = await request.json();

    if (!username || !content) {
      return NextResponse.json(
        { error: 'Username and content required' },
        { status: 400 }
      );
    }

    // First find the user
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        isVerified: true,
        isAcceptingAnonymousMessages: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (!user.isVerified) {
      return NextResponse.json(
        { error: 'User not verified' },
        { status: 403 }
      );
    }

    if (!user.isAcceptingAnonymousMessages) {
      return NextResponse.json(
        { error: 'User not accepting messages' },
        { status: 403 }
      );
    }

    // Create the message and associate it with the user
    const message = await prisma.anonymousMessage.create({
      data: {
        content,
        userId: user.id  // Directly specify the userId
      },
      include: {
        user: true  // Include user relation in response if needed
      }
    });

    return NextResponse.json(
      { message: 'Message sent', messageId: message.id },
      { status: 201 }
    );
    
  } catch (error) {
    console.error('Send error:', error);
    return NextResponse.json(
      { error: 'Send failed' },
      { status: 500 }
    );
  }
}
