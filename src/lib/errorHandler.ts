import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

export interface ApiError {
  message: string;
  statusCode: number;
  code?: string;
}

export class CustomApiError extends Error implements ApiError {
  statusCode: number;
  code?: string;

  constructor(message: string, statusCode: number = 500, code?: string) {
    super(message);
    this.name = 'CustomApiError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

export function handleApiError(error: unknown, context: string = 'API'): NextResponse {
  console.error(`[${context}]`, error);

  // Handle custom API errors
  if (error instanceof CustomApiError) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        code: error.code,
      },
      { status: error.statusCode }
    );
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const fieldErrors = error.errors.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    }));

    return NextResponse.json(
      {
        success: false,
        error: 'Validation failed',
        details: fieldErrors,
      },
      { status: 400 }
    );
  }

  // Handle Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        return NextResponse.json(
          {
            success: false,
            error: 'A record with this information already exists',
            code: 'DUPLICATE_RECORD',
          },
          { status: 409 }
        );
      case 'P2025':
        return NextResponse.json(
          {
            success: false,
            error: 'The requested record was not found',
            code: 'RECORD_NOT_FOUND',
          },
          { status: 404 }
        );
      case 'P2003':
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid reference to related record',
            code: 'FOREIGN_KEY_CONSTRAINT',
          },
          { status: 400 }
        );
      case 'P2014':
        return NextResponse.json(
          {
            success: false,
            error: 'The requested change would violate a required relation',
            code: 'RELATION_CONSTRAINT',
          },
          { status: 400 }
        );
      default:
        return NextResponse.json(
          {
            success: false,
            error: 'Database operation failed',
            code: 'DATABASE_ERROR',
          },
          { status: 500 }
        );
    }
  }

  // Handle Prisma validation errors
  if (error instanceof Prisma.PrismaClientValidationError) {
    return NextResponse.json(
      {
        success: false,
        error: 'Invalid data provided',
        code: 'VALIDATION_ERROR',
      },
      { status: 400 }
    );
  }

  // Handle network/timeout errors
  if (error instanceof Error) {
    if (error.message.includes('timeout')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Request timeout. Please try again.',
          code: 'TIMEOUT_ERROR',
        },
        { status: 408 }
      );
    }

    if (error.message.includes('ECONNREFUSED') || error.message.includes('fetch failed')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unable to connect to external service. Please try again later.',
          code: 'CONNECTION_ERROR',
        },
        { status: 503 }
      );
    }

    // Return the error message for known Error instances (but don't expose sensitive info)
    const safeMessage = error.message.length > 200 ? 'An unexpected error occurred' : error.message;
    return NextResponse.json(
      {
        success: false,
        error: safeMessage,
        code: 'UNKNOWN_ERROR',
      },
      { status: 500 }
    );
  }

  // Fallback for unknown error types
  return NextResponse.json(
    {
      success: false,
      error: 'An unexpected error occurred. Please try again later.',
      code: 'INTERNAL_SERVER_ERROR',
    },
    { status: 500 }
  );
}

// Utility function to wrap API handlers with error handling
export function withErrorHandler(
  handler: (request: Request, context?: any) => Promise<NextResponse>
) {
  return async (request: Request, context?: any): Promise<NextResponse> => {
    try {
      return await handler(request, context);
    } catch (error) {
      const endpoint = request.url.split('/api/')[1] || 'unknown';
      return handleApiError(error, endpoint);
    }
  };
}

// Utility function to validate request body
export async function validateRequestBody<T>(
  request: Request,
  schema: any
): Promise<T> {
  try {
    const body = await request.json();
    return schema.parse(body);
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new CustomApiError('Invalid JSON in request body', 400, 'INVALID_JSON');
    }
    throw error; // Re-throw validation errors to be handled by the error handler
  }
}

// Utility function to check authentication
export function requireAuth(currentUser: any): void {
  if (!currentUser?.id || !currentUser?.email) {
    throw new CustomApiError('Authentication required', 401, 'UNAUTHORIZED');
  }

  if (!currentUser?.isVerified) {
    throw new CustomApiError('Email verification required', 403, 'EMAIL_NOT_VERIFIED');
  }
}

// Utility function for rate limiting check
export function checkRateLimit(userId: string, action: string): void {
  // This is a placeholder - implement actual rate limiting logic here
  // You could use Redis, in-memory cache, or database-based rate limiting
  // For now, we'll just add the interface
}

// Utility function to sanitize sensitive data from logs
export function sanitizeForLogging(data: any): any {
  const sensitiveFields = ['password', 'hashedPassword', 'token', 'secret', 'apiKey'];
  
  if (typeof data !== 'object' || data === null) {
    return data;
  }

  const sanitized = { ...data };
  
  for (const field of sensitiveFields) {
    if (field in sanitized) {
      sanitized[field] = '[REDACTED]';
    }
  }

  return sanitized;
}