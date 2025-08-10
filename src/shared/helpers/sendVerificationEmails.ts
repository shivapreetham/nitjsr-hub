import { Resend } from 'resend';
import { ApiResponse } from '@/shared/types/ApiResponse';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(
  email: string,
  username: string,
  verifyCode: string
): Promise<ApiResponse> {
  try {
    const { data, error } = await resend.emails.send({
      from: `NIT JSR Hub <${process.env.RESEND_FROM_EMAIL}>`, // e.g. "NIT JSR Hub <no-reply@nitjsr-hub.fun>"
      to: email,
      subject: 'NIT JSR Hub | Verification Code',
      html: `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verification Code</title>
          </head>
          <body style="font-family: Arial, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2>Hello, ${username}!</h2>
              <p>Your verification code for NIT JSR Hub is:</p>
              <h3 style="color: green;">${verifyCode}</h3>
              <p>Please enter this code on the website to verify your email.</p>
              <p>Thank you!</p>
              <p style="font-size: 12px; color: gray;">
                NIT JSR Hub | NIT Jamshedpur | <a href="mailto:${process.env.RESEND_FROM_EMAIL}">Contact Support</a>
              </p>
              <p style="font-size: 12px; color: gray;">If you didn’t request this, please ignore this email.</p>
            </div>
          </body>
        </html>
      `
    });

    if (error) {
      console.error('Resend email error:', error);
      return { success: false, message: 'Failed to send verification email.' };
    }

    console.log('Resend email result:', data);
    return { success: true, message: 'Verification email sent successfully.' };

  } catch (emailError) {
    console.error('Error sending verification email:', emailError);
    return { success: false, message: 'Failed to send verification email.' };
  }
}
