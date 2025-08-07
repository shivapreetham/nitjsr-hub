
import { z } from "zod";
export const messageSchema = z.object({
    message: z.string()
      .min(1, "Message cannot be empty")
      .refine((val:any) => {
        if (val.startsWith('@')) {
          return val.length <= 80;
        }
        return val.length <= 1000;
      }, {
        message: "Message exceeds maximum length"
      })
      .refine((val :any) => {
        if (val.startsWith('@')) {
          return val.split(' ').length <= 20;
        }
        return true;
      }, {
        message: "AI prompt cannot exceed 20 words"
      })
  });