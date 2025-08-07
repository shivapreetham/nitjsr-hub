import { z } from 'zod'

export const AcceptAnonymousMessageSchema = z.object({
  acceptAnonymousMessages: z.boolean(),
});