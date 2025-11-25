/**
 * Authentication and Rate Limiting Middleware
 *
 * Provides authentication, rate limiting, and CSRF protection for API routes.
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken, getAdminDb } from './firebase-admin';
import { DecodedIdToken } from 'firebase-admin/auth';

/**
 * Rate limit configuration for different endpoints
 */
export const RATE_LIMITS = {
  'ai-reflect': { limit: 10, windowMs: 3600000 }, // 10 per hour
  'ai-coping': { limit: 20, windowMs: 3600000 }, // 20 per hour
  'ai-insights': { limit: 5, windowMs: 3600000 }, // 5 per hour
  'ai-patterns': { limit: 10, windowMs: 3600000 }, // 10 per hour
  'lifemessages': { limit: 30, windowMs: 3600000 }, // 30 per hour
} as const;

export type RateLimitEndpoint = keyof typeof RATE_LIMITS;

/**
 * Authenticated request context
 */
export interface AuthContext {
  user: DecodedIdToken;
  userId: string;
}

/**
 * API handler with authentication context
 */
export type AuthenticatedHandler = (
  request: NextRequest,
  context: AuthContext
) => Promise<NextResponse>;

/**
 * Extract Firebase ID token from Authorization header
 */
function extractToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('Authorization');

  if (!authHeader) {
    return null;
  }

  // Support both "Bearer <token>" and just "<token>"
  const parts = authHeader.split(' ');
  if (parts.length === 2 && parts[0] === 'Bearer') {
    return parts[1];
  } else if (parts.length === 1) {
    return parts[0];
  }

  return null;
}

/**
 * Verify CSRF protection via origin validation
 */
function verifyCsrf(request: NextRequest): boolean {
  // Skip CSRF check for GET requests
  if (request.method === 'GET') {
    return true;
  }

  const origin = request.headers.get('Origin');
  const host = request.headers.get('Host');

  // If no origin header, check referer
  if (!origin) {
    const referer = request.headers.get('Referer');
    if (!referer) {
      return false; // No origin or referer - reject
    }
    // Verify referer matches host
    try {
      const refererUrl = new URL(referer);
      return refererUrl.host === host;
    } catch {
      return false;
    }
  }

  // Check if origin is allowed
  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : [];

  // Always allow same-origin
  try {
    const originUrl = new URL(origin);
    if (originUrl.host === host) {
      return true;
    }
  } catch {
    return false;
  }

  // Check against allowed origins
  return allowedOrigins.includes(origin);
}

/**
 * Check rate limit for user and endpoint
 *
 * @param userId - User ID to check
 * @param endpoint - Endpoint identifier
 * @returns true if within rate limit, false if exceeded
 */
async function checkRateLimit(
  userId: string,
  endpoint: RateLimitEndpoint
): Promise<{ allowed: boolean; retryAfter?: number }> {
  const config = RATE_LIMITS[endpoint];
  const now = Date.now();
  const windowStart = now - config.windowMs;

  const db = getAdminDb();
  const usageRef = db.collection('aiUsage');

  try {
    // Query usage within time window
    const snapshot = await usageRef
      .where('userId', '==', userId)
      .where('endpoint', '==', endpoint)
      .where('timestamp', '>', windowStart)
      .orderBy('timestamp', 'desc')
      .limit(config.limit + 1)
      .get();

    const requestCount = snapshot.size;

    if (requestCount >= config.limit) {
      // Rate limit exceeded
      const oldestRequest = snapshot.docs[snapshot.docs.length - 1];
      const oldestTimestamp = oldestRequest.data().timestamp as number;
      const retryAfter = Math.ceil((oldestTimestamp + config.windowMs - now) / 1000);

      return { allowed: false, retryAfter };
    }

    // Log this request
    await usageRef.add({
      userId,
      endpoint,
      timestamp: now,
      createdAt: new Date(),
    });

    return { allowed: true };
  } catch (error) {
    console.error('Rate limit check failed:', error);
    // On error, allow the request (fail open) but log the error
    return { allowed: true };
  }
}

/**
 * Authentication middleware wrapper
 *
 * Wraps an API route handler with:
 * - Authentication (Firebase ID token verification)
 * - Rate limiting (optional, per-endpoint)
 * - CSRF protection (origin validation)
 *
 * @param handler - The authenticated API handler
 * @param options - Middleware options
 * @returns Wrapped Next.js API route handler
 */
export function withAuth(
  handler: AuthenticatedHandler,
  options?: {
    rateLimit?: RateLimitEndpoint;
    skipCsrf?: boolean;
  }
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      // CSRF Protection
      if (!options?.skipCsrf && !verifyCsrf(request)) {
        return NextResponse.json(
          { error: 'Invalid origin' },
          { status: 403 }
        );
      }

      // Extract and verify token
      const token = extractToken(request);

      if (!token) {
        return NextResponse.json(
          { error: 'Missing authentication token' },
          { status: 401 }
        );
      }

      let decodedToken: DecodedIdToken;
      try {
        decodedToken = await verifyIdToken(token);
      } catch (error) {
        return NextResponse.json(
          {
            error: 'Invalid or expired token',
            details: error instanceof Error ? error.message : 'Authentication failed',
          },
          { status: 401 }
        );
      }

      const userId = decodedToken.uid;

      // Rate Limiting (optional)
      if (options?.rateLimit) {
        const rateLimitResult = await checkRateLimit(userId, options.rateLimit);

        if (!rateLimitResult.allowed) {
          return NextResponse.json(
            {
              error: 'Rate limit exceeded',
              retryAfter: rateLimitResult.retryAfter,
            },
            {
              status: 429,
              headers: {
                'Retry-After': String(rateLimitResult.retryAfter || 60),
              },
            }
          );
        }
      }

      // Create auth context
      const authContext: AuthContext = {
        user: decodedToken,
        userId,
      };

      // Call the actual handler
      return await handler(request, authContext);
    } catch (error) {
      console.error('Authentication middleware error:', error);
      return NextResponse.json(
        {
          error: 'Internal server error',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      );
    }
  };
}

/**
 * Validate request body with Zod schema
 *
 * Helper function for input validation in API routes
 */
export async function validateBody<T>(
  request: NextRequest,
  schema: { parse: (data: unknown) => T }
): Promise<{ data: T; error: null } | { data: null; error: NextResponse }> {
  try {
    const body = await request.json();
    const data = schema.parse(body);
    return { data, error: null };
  } catch (error: any) {
    return {
      data: null,
      error: NextResponse.json(
        {
          error: 'Invalid request body',
          details: error.errors || error.message || 'Validation failed',
        },
        { status: 400 }
      ),
    };
  }
}
