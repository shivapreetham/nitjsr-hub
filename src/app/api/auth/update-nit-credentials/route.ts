import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../[...nextauth]/options';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
import { nitCredentialsSchema } from '@/shared/schemas/signUpSchema';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validate input
    const validationResult = nitCredentialsSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid credentials format',
          errors: validationResult.error.flatten().fieldErrors
        },
        { status: 400 }
      );
    }

    const { NITUsername, NITPassword } = validationResult.data;

    // Update user's NIT credentials
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        NITUsername,
        NITPassword,
      },
      select: {
        id: true,
        NITUsername: true,
        // Don't return the password for security
      }
    });

    return NextResponse.json({
      success: true,
      message: 'NIT credentials updated successfully',
      user: {
        id: updatedUser.id,
        NITUsername: updatedUser.NITUsername,
        hasNitCredentials: Boolean(updatedUser.NITUsername),
      }
    });

  } catch (error) {
    console.error('Error updating NIT credentials:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}