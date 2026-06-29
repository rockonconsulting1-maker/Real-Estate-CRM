import { corsHeaders as defaultCorsHeaders } from './cors.ts';

export class AppError extends Error {
  constructor(message: string, public status: number = 400, public code: string = 'error') {
    super(message);
    this.name = 'AppError';
  }
}

export class AuthError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, 'unauthorized');
    this.name = 'AuthError';
  }
}

export class PermissionError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 403, 'forbidden');
    this.name = 'PermissionError';
  }
}

export class GhlError extends AppError {
  constructor(message: string, status: number = 400) {
    super(message, status, 'ghl_error');
    this.name = 'GhlError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, 'validation_error');
    this.name = 'ValidationError';
  }
}

export function jsonError(error: any, customCorsHeaders?: Record<string, string>) {
  console.error('Edge Function Error:', error);

  const status = error.status || 500;
  const message = error.message || 'Internal Server Error';
  const code = error.code || 'internal_error';

  const headers = {
    ...(customCorsHeaders || defaultCorsHeaders),
    'Content-Type': 'application/json',
  };

  return new Response(
    JSON.stringify({
      error: {
        message,
        code,
        status,
      },
    }),
    {
      status,
      headers,
    }
  );
}
