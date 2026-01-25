/**
 * API Error Handling Utilities
 * Provides retry logic and better error messages
 */

interface RetryOptions {
  maxAttempts?: number;
  delayMs?: number;
  backoff?: boolean;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public endpoint?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function fetchWithRetry<T>(
  url: string,
  options: RequestInit = {},
  retryOptions: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    delayMs = 1000,
    backoff = true
  } = retryOptions;

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new ApiError(
          getErrorMessage(response.status, errorText),
          response.status,
          url
        );
      }

      return await response.json();
    } catch (error) {
      lastError = error as Error;

      // Don't retry on 4xx errors (client errors)
      if (error instanceof ApiError && error.statusCode && error.statusCode < 500) {
        throw error;
      }

      // Don't retry on last attempt
      if (attempt === maxAttempts) {
        break;
      }

      // Wait before retrying
      const delay = backoff ? delayMs * attempt : delayMs;
      console.warn(`Request failed (attempt ${attempt}/${maxAttempts}). Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError || new Error('Request failed after retries');
}

function getErrorMessage(statusCode: number, responseText: string): string {
  switch (statusCode) {
    case 400:
      return 'Invalid request. Please check your input.';
    case 401:
      return 'Authentication required. Please log in.';
    case 403:
      return 'You don\'t have permission to access this resource.';
    case 404:
      return 'The requested resource was not found.';
    case 429:
      return 'Too many requests. Please slow down.';
    case 500:
      return 'Server error. Our team has been notified.';
    case 503:
      return 'Service temporarily unavailable. Please try again later.';
    default:
      return responseText || `Request failed with status ${statusCode}`;
  }
}

export function isNetworkError(error: unknown): boolean {
  return error instanceof TypeError && 
         (error.message.includes('fetch') || error.message.includes('network'));
}

export function getDisplayError(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }
  
  if (isNetworkError(error)) {
    return 'Network connection lost. Please check your internet connection.';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
}
