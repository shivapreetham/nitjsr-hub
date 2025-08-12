import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prismadb';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        image: true,
      }
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}