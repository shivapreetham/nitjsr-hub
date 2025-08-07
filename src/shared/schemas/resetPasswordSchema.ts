import * as z from 'zod';
export const resetPasswordSchema = z.object({
  verifyCode: z.string().length(6, 'Verification code must be 6 digits'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});