import { corsHeaders as defaultCorsHeaders } from './cors.ts';

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

export class PermissionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PermissionError';
  }
}

export class GhlError extends Error {
  status: number;
  // @ts-ignore
  constructor(message: string, status: number) {
    super(message);
    this.name = 'GhlError';
    this.status = status;
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export function jsonError(error: any, customCorsHeaders?: Record<string, string>) {
  console.error('Edge Function Error:', error);

  let status = 500;
  let message = 'Internal Server Error';

  const headers = {
    ...(customCorsHeaders || defaultCorsHeaders),
    'Content-Type': 'application/json',
  };

  // Support for @gohighlevel/api-client GHLError structure
  if (error && (error.name === 'GHLError' || error.constructor?.name === 'GHLError')) {
    status = error.status || 500;
    message = error.message || 'GHL API Error';

    return new Response(JSON.stringify({ error: message, statusCode: status }), {
      status,
      headers,
    });
  }

  if (error instanceof AuthError) {
    status = 401;
    message = error.message;
  } else if (error instanceof PermissionError) {
    status = 403;
    message = error.message;
  } else if (error instanceof GhlError) {
    status = error.status;
    message = error.message;
  } else if (error instanceof ValidationError) {
    status = 400;
    message = error.message;
  } else if (error instanceof Error) {
    message = error.message;
  }

  return new Response(JSON.stringify({ error: message }), {
    status,
    headers,
  });
}
