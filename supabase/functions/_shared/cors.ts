export function getCorsHeaders(requestOrigin?: string | null): Record<string, string> {
  const appBaseUrl = Deno.env.get('APP_BASE_URL');
  const allowedOrigin = appBaseUrl ?? '*';
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
}

/**
 * Backward-compat shim for any function still using the static import.
 * Uses property getters to ensure environment variables are read lazily
 * at request time, not module load time.
 */
export const corsHeaders = {
  get 'Access-Control-Allow-Origin'() {
    return Deno.env.get('APP_BASE_URL') ?? '*';
  },
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
