// schemas/groupChatSchema.ts
import { z } from 'zod';
export const groupChatSchema = z.object({
    name: z.string()
      .min(3,{ message:'Group name must be at least 3 characters'})
      .max(50,{  message:'Group name cannot exceed 50 characters'})
      .regex(/^[a-zA-Z0-9\s-_]+$/,  {message:'Only letters, numbers, spaces, hyphens and underscores are allowed'}),
    members: z.array(z.string()),
    isAnonymous: z.boolean(),
    isGroup: z.literal(true)
  });

export type GroupChatFormData = z.infer<typeof groupChatSchema>;
