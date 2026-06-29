export function getCorsHeaders(requestOrigin?: string | null): Record<string, string> {
  const appBaseUrl = Deno.env.get('APP_BASE_URL');

  // Default to the specific app base URL if provided, otherwise wildcard.
  let allowedOrigin = appBaseUrl ?? '*';

  // If the request origin is one of our known app domains or a preview/local domain, allow it.
  if (requestOrigin) {
    const origin = requestOrigin.toLowerCase();
    const isVibePreview = origin.endsWith('vibepreview.com') || origin.endsWith('vibepreview.com/');
    const isLocal = origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:');

    if (origin === appBaseUrl?.toLowerCase() || isVibePreview || isLocal) {
      allowedOrigin = requestOrigin;
    }
  }

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-client-info',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, PATCH, DELETE',
    'Access-Control-Max-Age': '86400',
  };
}

/**
 * Backward-compat shim for any function still using the static import.
 * Note: Static imports cannot support dynamic origin validation.
 * Functions should prefer getCorsHeaders(req.headers.get('origin')).
 */
export const corsHeaders = {
  get 'Access-Control-Allow-Origin'() {
    return Deno.env.get('APP_BASE_URL') ?? '*';
  },
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-client-info',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, PATCH, DELETE',
};
