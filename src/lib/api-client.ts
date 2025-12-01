/**
 * Authenticated API Client
 *
 * Client-side helper for making authenticated requests to API routes.
 * Automatically includes Firebase ID token in Authorization header.
 *
 * USAGE:
 * import { authenticatedFetch } from '@/lib/api-client';
 *
 * const response = await authenticatedFetch('/api/ai/insights', {
 *   method: 'POST',
 *   body: JSON.stringify({ entries: [...] })
 * });
 */

import { initializeFirebase } from '@/firebase';
import { User } from 'firebase/auth';

// Initialize Firebase and get auth instance
const { auth } = initializeFirebase();

/**
 * Error thrown when user is not authenticated
 */
export class AuthenticationError extends Error {
  constructor(message = 'User not authenticated') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

/**
 * Error thrown when rate limit is exceeded
 */
export class RateLimitError extends Error {
  retryAfter: number;

  constructor(retryAfter: number) {
    super(`Rate limit exceeded. Retry after ${retryAfter} seconds.`);
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}

/**
 * Error thrown for API errors
 */
export class ApiError extends Error {
  status: number;
  details?: any;

  constructor(status: number, message: string, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

/**
 * Get current Firebase user
 */
async function getCurrentUser(): Promise<User> {
  return new Promise((resolve, reject) => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      unsubscribe();
      if (user) {
        resolve(user);
      } else {
        reject(new AuthenticationError());
      }
    });
  });
}

/**
 * Get Firebase ID token for current user
 *
 * @param forceRefresh - Force token refresh
 * @returns Firebase ID token
 */
export async function getIdToken(forceRefresh = false): Promise<string> {
  try {
    const user = await getCurrentUser();
    return await user.getIdToken(forceRefresh);
  } catch (error) {
    if (error instanceof AuthenticationError) {
      throw error;
    }
    throw new AuthenticationError('Failed to get authentication token');
  }
}

/**
 * Make an authenticated API request
 *
 * Automatically includes Firebase ID token in Authorization header.
 * Handles common error cases (401, 429, etc.)
 *
 * @param url - API endpoint URL
 * @param options - Fetch options
 * @returns Fetch Response
 * @throws {AuthenticationError} If user is not authenticated
 * @throws {RateLimitError} If rate limit is exceeded
 * @throws {ApiError} For other API errors
 */
export async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  try {
    // Get ID token
    const token = await getIdToken();

    // Add Authorization header
    const headers = new Headers(options.headers);
    headers.set('Authorization', `Bearer ${token}`);
    headers.set('Content-Type', 'application/json');

    // Make request
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle common error cases
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      if (response.status === 401) {
        // Token might be expired, try refreshing once
        const refreshedToken = await getIdToken(true);
        headers.set('Authorization', `Bearer ${refreshedToken}`);

        const retryResponse = await fetch(url, {
          ...options,
          headers,
        });

        if (!retryResponse.ok) {
          throw new AuthenticationError(
            errorData.error || 'Authentication failed'
          );
        }

        return retryResponse;
      }

      if (response.status === 429) {
        const retryAfter = parseInt(
          response.headers.get('Retry-After') || '60',
          10
        );
        throw new RateLimitError(retryAfter);
      }

      throw new ApiError(
        response.status,
        errorData.error || 'API request failed',
        errorData.details
      );
    }

    return response;
  } catch (error) {
    // Re-throw known errors
    if (
      error instanceof AuthenticationError ||
      error instanceof RateLimitError ||
      error instanceof ApiError
    ) {
      throw error;
    }

    // Wrap unknown errors
    throw new ApiError(
      500,
      error instanceof Error ? error.message : 'A network error occurred.',
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}

/**
 * Make an authenticated JSON API request
 *
 * Convenience wrapper around authenticatedFetch that:
 * - Automatically serializes request body to JSON
 * - Automatically parses response as JSON
 * - Sets Content-Type header
 *
 * @param url - API endpoint URL
 * @param options - Request options
 * @returns Parsed JSON response
 */
export async function authenticatedJsonRequest<T = any>(
  url: string,
  options: {
    method?: string;
    body?: any;
    headers?: HeadersInit;
  } = {}
): Promise<T> {
  const { body, ...fetchOptions } = options;

  const response = await authenticatedFetch(url, {
    ...fetchOptions,
    body: body ? JSON.stringify(body) : undefined,
  });

  return await response.json();
}

/**
 * Hook-friendly authenticated fetch
 *
 * Returns a function that can be used in React components
 * without triggering eslint exhaustive-deps warnings.
 *
 * @returns Stable authenticated fetch function
 */
export function useAuthenticatedFetch() {
  return authenticatedFetch;
}

/**
 * Check if current user is authenticated
 *
 * @returns true if user is authenticated, false otherwise
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    await getCurrentUser();
    return true;
  } catch {
    return false;
  }
}
