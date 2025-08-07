
import { z } from "zod";

export const productSchema = z.object({
  title: z.string().min(3, {
    message: "Title must be at least 3 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  price: z.coerce.number().positive({
    message: "Price must be a positive number.",
  }),
  category: z.string().min(1, {
    message: "Please select a category.",
  }),
  condition: z.string().optional(),
  hostel: z.string().optional(),
  mainImage: z.string().min(1, {
    message: "Please upload a main image.",
  }),
  images: z.array(z.string()).default([]),
  paymentQR: z.string().optional(),
});