// app/api/chat/validate-group-name/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prismadb';
import { groupChatSchema } from '@/shared/schemas/groupChatSchema';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');

    // Validate the group name using the schema
    const result = groupChatSchema.shape.name.safeParse(name);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.error.errors[0].message,
        },
        { status: 400 }
      );
    }

    // Check if the group name already exists
    const existingGroup = await prisma.conversation.findFirst({
      where: {
        name: name,
        isGroup: true,
      },
    });

    if (existingGroup) {
      return NextResponse.json(
        {
          success: false,
          message: 'Group name is already taken',
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Group name is available',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error checking group name:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error checking group name',
      },
      { status: 500 }
    );
  }
}