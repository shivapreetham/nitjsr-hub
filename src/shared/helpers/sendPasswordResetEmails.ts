import { Resend } from 'resend';
import { ApiResponse } from '@/shared/types/ApiResponse';

export async function sendPasswordResetEmail(
  email: string,
  username: string,
  verifyCode: string
): Promise<ApiResponse> {
  try {
    console.log('Sending password reset email...');

    if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL) {
      console.error('RESEND_API_KEY or RESEND_FROM_EMAIL is not set');
      return { success: false, message: 'Email service configuration is missing.' };
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    const { error } = await resend.emails.send({
      from: `NIT JSR Hub <${process.env.RESEND_FROM_EMAIL}>`, // e.g. no-reply@nitjsr-hub.fun
      to: email,
      subject: 'NIT JSR Hub | Password Reset Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #333;">Password Reset</h2>
          </div>
          
          <div style="margin-bottom: 30px;">
            <p>Hello, ${username}!</p>
            <p>Your password reset code for NIT JSR Hub is:</p>
            <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
              ${verifyCode}
            </div>
          </div>
          
          <div style="text-align: center; font-size: 12px; color: #666; margin-top: 30px; padding-top: 15px; border-top: 1px solid #ddd;">
            <p>NIT JSR Hub | NIT Jamshedpur | <a href="mailto:${process.env.RESEND_FROM_EMAIL}">Contact Support</a></p>
          </div>
        </div>
      `
    });

    if (error) {
      console.error('Error sending password reset email:', error);
      return { success: false, message: 'Failed to send password reset email.' };
    }

    console.log('Password reset email sent successfully.');
    return { success: true, message: 'Password reset email sent successfully.' };
  } catch (err) {
    console.error('Error sending password reset email:', err);
    return { success: false, message: 'Failed to send password reset email.' };
  }
}
