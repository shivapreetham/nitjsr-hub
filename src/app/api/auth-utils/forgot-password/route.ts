import prisma from '@/lib/prismadb';
import { NextResponse } from 'next/server';
import { sendPasswordResetEmail } from '@/helpers/sendPasswordResetEmails';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    // For security, don't reveal if the user exists or not
    if (!user) {
      // Return success even if user doesn't exist to prevent email enumeration
      return NextResponse.json(
        { success: true, message: 'If an account with this email exists, a reset code has been sent' },
        { status: 200 }
      );
    }

    // Generate a 6-digit verification code
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verifyCodeExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Update user with verification code
    await prisma.user.update({
      where: { id: user.id },
      data: {
        verifyCode,
        verifyCodeExpiry
      }
    });

    // Send password reset email
    const emailResult = await sendPasswordResetEmail(email, user.username, verifyCode);

    if (!emailResult.success) {
      return NextResponse.json(
        { success: false, message: 'Failed to send reset email' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Password reset email sent successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in forgot password:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred' },
      { status: 500 }
    );
  }
}