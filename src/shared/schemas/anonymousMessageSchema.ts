import { z } from 'zod'

export const anonymousMessageSchema = z.object({
  content: z
    .string()
    .min(1, { message: 'Content must be at least 10 characters.' })
    .max(10000, { message: 'Content must not be longer than 300 characters.' }),
});