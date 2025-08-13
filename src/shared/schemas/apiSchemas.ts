import { z } from 'zod';

// Message API schemas
export const createMessageSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty').max(2000, 'Message too long'),
  conversationId: z.string().min(1, 'Conversation ID is required'),
  replyToId: z.string().optional(),
  type: z.enum(['TEXT', 'IMAGE', 'VIDEO', 'GIF', 'FILE', 'VIDEO_CALL', 'MARKETPLACE_INTEREST']).optional(),
  fileUrl: z.string().url().optional(),
  fileName: z.string().max(255).optional(),
  fileType: z.string().max(100).optional(),
  fileSize: z.number().min(0).max(10 * 1024 * 1024).optional(), // 10MB limit
  image: z.string().url().optional(),
});

// Product API schemas
export const createProductSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().min(1, 'Description is required').max(2000, 'Description too long'),
  price: z.number().min(0, 'Price must be non-negative').max(1000000, 'Price too high'),
  category: z.string().min(1, 'Category is required'),
  condition: z.string().optional(),
  hostel: z.string().optional(),
  mainImage: z.string().url('Invalid main image URL'),
  images: z.array(z.string().url()).max(10, 'Maximum 10 additional images').optional(),
  paymentQR: z.string().url().optional(),
});

export const updateProductSchema = createProductSchema.partial();

export const productInterestSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  interested: z.boolean(),
});

// User profile schemas
export const updateProfileSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(50, 'Username too long').optional(),
  image: z.string().url().optional(),
  mobileNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid mobile number').optional(),
  hostel: z.string().max(100).optional(),
  course: z.string().max(100).optional(),
  branch: z.string().max(100).optional(),
  batch: z.string().max(20).optional(),
});

export const updateCredentialsSchema = z.object({
  NITUsername: z.string().min(1, 'NIT Username is required').max(100),
  NITPassword: z.string().min(1, 'NIT Password is required').max(100),
});

// Conversation API schemas
export const createConversationSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  isGroup: z.boolean().optional(),
  members: z.array(z.string()).optional(),
  name: z.string().max(100).optional(),
});

export const updateConversationSchema = z.object({
  name: z.string().min(1).max(100).optional(),
});

// Anonymous message schemas
export const sendAnonymousMessageSchema = z.object({
  content: z.string().min(1, 'Message cannot be empty').max(1000, 'Message too long'),
  username: z.string().min(1, 'Username is required'),
});

export const toggleAnonymousMessagesSchema = z.object({
  isAccepting: z.boolean(),
});

// Authentication schemas
export const signUpSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(50, 'Username too long'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters').max(100, 'Password too long'),
});

export const verifyCodeSchema = z.object({
  email: z.string().email('Invalid email format'),
  code: z.string().length(6, 'Verification code must be 6 digits'),
});

export const forgotPasswordSchema = z.object({
  identifier: z.string().min(1, 'Email or username is required'),
});

export const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters').max(100, 'Password too long'),
});

// Cloudflare upload schemas
export const cloudflareUploadSchema = z.object({
  filename: z.string().min(1, 'Filename is required').max(255, 'Filename too long'),
  contentType: z.string().min(1, 'Content type is required'),
});

export const cloudflareDeleteSchema = z.object({
  imageUrl: z.string().url('Invalid image URL'),
});

// Reaction schemas
export const addReactionSchema = z.object({
  emoji: z.string().min(1, 'Emoji is required').max(10, 'Emoji too long'),
  messageId: z.string().min(1, 'Message ID is required'),
});

// Query parameter schemas
export const paginationSchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().min(1)).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().min(1).max(100)).optional(),
});

export const productFilterSchema = z.object({
  category: z.string().optional(),
  minPrice: z.string().regex(/^\d+(\.\d+)?$/).optional(),
  maxPrice: z.string().regex(/^\d+(\.\d+)?$/).optional(),
  search: z.string().max(200).optional(),
  hostel: z.string().optional(),
  sellerId: z.string().optional(),
  status: z.enum(['AVAILABLE', 'RESERVED', 'SOLD']).optional(),
  ...paginationSchema.shape,
});

// Error response schema (for documentation)
export const errorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  code: z.string().optional(),
  details: z.array(z.object({
    field: z.string(),
    message: z.string(),
  })).optional(),
});

// Success response schema (for documentation)
export const successResponseSchema = z.object({
  success: z.literal(true),
  data: z.any().optional(),
  message: z.string().optional(),
});