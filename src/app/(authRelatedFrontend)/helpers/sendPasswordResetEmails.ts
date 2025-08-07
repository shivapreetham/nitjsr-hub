import nodemailer from "nodemailer";
import { ApiResponse } from '@/shared/types/ApiResponse';

export async function sendPasswordResetEmail(
  email: string,
  username: string,
  verifyCode: string
): Promise<ApiResponse> {
  try {
    // Check if required environment variables are set
    if (!process.env.SENDGRID_API_KEY) {
      console.error('SENDGRID_API_KEY is not set');
      return { success: false, message: 'Email service configuration is missing.' };
    }

    if (!process.env.EMAIL_USER) {
      console.error('EMAIL_USER is not set');
      return { success: false, message: 'Email service configuration is missing.' };
    }

    const transport = await nodemailer.createTransport({
      service: 'SendGrid', // For Mailgun, set 'host' and 'port' instead
      auth: {
        user: 'apikey', // for SendGrid, 'user' is 'apikey'
        pass: process.env.SENDGRID_API_KEY, // set this API key as an environment variable
      },
    });
    
    const receiver = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'NIT JSR Hub | Password Reset Code',
      headers: {
        'List-Unsubscribe': ``,
      },
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
          
          <p>Please enter this code on the website to reset your password. This code will expire in 1 hour.</p>
          
          <p>If you didn't request this password reset, please ignore this email or contact support.</p>
        </div>
        
        <div style="text-align: center; font-size: 12px; color: #666; margin-top: 30px; padding-top: 15px; border-top: 1px solid #ddd;">
          <p>NIT JSR Hub | NIT Jamshedpur | <a href="#">Contact Support</a></p>
        </div>
      </div>
      `,
    };
    
    const result = await transport.sendMail(receiver);
    
    if(result.rejected.length > 0){
      return { success: false, message: 'Failed to send password reset email.' };
    }
    
    console.log(result, " Password reset email sent");
    return { success: true, message: 'Password reset email sent successfully.' };
  } catch (emailError) {
    console.error('Error sending password reset email:', emailError);
    return { success: false, message: 'Failed to send password reset email.' };
  }
}