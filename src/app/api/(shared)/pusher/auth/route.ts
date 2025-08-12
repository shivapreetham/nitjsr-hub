// app/api/pusher/auth/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { pusherServer } from '@/lib/pusher';
import prisma from '@/lib/prismadb';

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const formData = await request.formData();
    const socket_id = formData.get('socket_id');
    const channel_name = formData.get('channel_name');

    if (!socket_id || !channel_name) {
      return new NextResponse('Invalid request data', { status: 400 });
    }

    // Fetch the current user with their lastSeen data
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        username: true,
        image: true,
        activeStatus: true,
        lastSeen: true
      }
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    // Create the auth response for Pusher
    const authResponse = pusherServer.authorizeChannel(
      socket_id.toString(),
      channel_name.toString(),
      {
        user_id: user.email,
        user_info: {
          email: user.email,
          name: user.username,
          image: user.image,
          activeStatus: true,
          lastSeen: user.lastSeen?.toISOString() // Convert Date to ISO string
        }
      }
    );

    console.log('Pusher auth response:', {
      channelName: channel_name,
      userId: user.email,
      lastSeen: user.lastSeen,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json(authResponse);
  } catch (error) {
    console.error('Pusher auth error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}