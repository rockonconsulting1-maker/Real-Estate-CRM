import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.42.0';

/**
 * Decrypts GHL tokens for a given location using the Vault-based RPC.
 */
export async function decryptToken(locationId: string): Promise<{ access_token: string, refresh_token: string }> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const adminClient = createClient(supabaseUrl, supabaseServiceKey);

  const { data, error } = await adminClient.rpc('get_decrypted_ghl_token', {
    p_location_id: locationId
  });

  if (error || !data || data.length === 0) {
    throw new Error('Failed to decrypt tokens for location: ' + locationId);
  }

  return data[0];
}

/**
 * Encryption is handled by the database trigger 'trigger_encrypt_ghl_tokens'.
 * This function is kept for structural compatibility but just returns the plain text.
 */
export function encryptToken(plainText: string): string {
  return plainText;
}
