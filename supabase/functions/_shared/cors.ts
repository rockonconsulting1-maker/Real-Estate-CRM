const appBaseUrl = Deno.env.get('APP_BASE_URL');

if (!appBaseUrl) {
  console.warn('[cors] APP_BASE_URL is not set; falling back to Access-Control-Allow-Origin: *');
}

export const corsHeaders = {
  'Access-Control-Allow-Origin': appBaseUrl ?? '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
