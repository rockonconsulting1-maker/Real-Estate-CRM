export function getCorsHeaders(requestOrigin?: string | null): Record<string, string> {
  const appBaseUrl = Deno.env.get('APP_BASE_URL') ?? '*';
  const allowedOrigin =
    appBaseUrl === '*'
      ? '*'
      : requestOrigin === appBaseUrl
      ? appBaseUrl
      : appBaseUrl; // fallback to configured origin

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
}

// Keep backward-compat export for other functions that import corsHeaders directly
export const corsHeaders = getCorsHeaders();
