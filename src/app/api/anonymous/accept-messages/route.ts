// src/app/api/anonymous/accept-messages/route.ts
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import prisma from '@/lib/prismadb';
import { NextResponse } from 'next/server';

interface SessionUser {
  id: string;
  email: string;
  name?: string;
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as SessionUser | undefined;

    if (!user?.id) {
      return NextResponse.json({ 
        success: false, 
        message: 'Not authenticated' 
      }, { status: 401 });
    }

    const body = await request.json();
    const acceptAnonymousMessages = body.acceptAnonymousMessages;

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { isAcceptingAnonymousMessages: acceptAnonymousMessages },
      select: { isAcceptingAnonymousMessages: true }
    });

    return NextResponse.json({
      success: true,
      message: `Anonymous messages ${acceptAnonymousMessages ? 'enabled' : 'disabled'} successfully`,
      isAcceptingAnonymousMessages: updatedUser.isAcceptingAnonymousMessages
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to update message settings' 
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as SessionUser | undefined;

    if (!user?.id) {
      return NextResponse.json({ 
        success: false, 
        message: 'Not authenticated' 
      }, { status: 401 });
    }

    const foundUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { isAcceptingAnonymousMessages: true }
    });

    if (!foundUser) {
      return NextResponse.json({ 
        success: false, 
        message: 'User not found' 
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      isAcceptingAnonymousMessages: foundUser.isAcceptingAnonymousMessages
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to fetch message settings' 
    }, { status: 500 });
  }
}