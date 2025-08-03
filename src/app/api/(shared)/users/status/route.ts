// app/api/users/status/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/shared/lib/prismadb';

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    const body = await req.json();
    const { isOnline } = body;

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        activeStatus: isOnline,
        lastSeen: new Date()
      }
    });

    console.log('Status update:', { email: session.user.email, isOnline });
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Status update error:', error);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}
