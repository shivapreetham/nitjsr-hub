import prisma from '@/lib/prismadb';
import { verifySchema } from '@/schemas/verifySchema';

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json();
    const result = verifySchema.safeParse({ email, code });

    if (!result.success) {
      return Response.json({
        success: false,
        message: result.error.format().code?._errors[0]
      }, { status: 400 });
    }

    const decodedEmail = decodeURIComponent(email);
    const user = await prisma.user.findUnique({
      where: { email: decodedEmail },
    });

    if (!user) {
      return Response.json({
        success: false,
        message: 'User not found'
      }, { status: 404 });
    }

    const isCodeValid = user.verifyCode === code;
    const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date();

    if (isCodeValid && isCodeNotExpired) {
      // Update with empty string instead of null for verifyCode
      await prisma.user.update({
        where: { email: decodedEmail },
        data: {
          isVerified: true,
          verifyCode: "", // Set to empty string instead of null
          verifyCodeExpiry: new Date(), // Set to current date instead of null
        },
      });

      return Response.json({
        success: true,
        message: 'Account verified successfully'
      }, { status: 200 });
    }

    if (!isCodeNotExpired) {
      return Response.json({
        success: false,
        message: 'Verification code has expired. Please sign up again to get a new code.'
      }, { status: 400 });
    }

    return Response.json({
      success: false,
      message: 'Incorrect verification code'
    }, { status: 400 });

  } catch (error) {
    console.error('Error verifying user:', error);
    return Response.json({
      success: false,
      message: 'Error verifying user'
    }, { status: 500 });
  }
}