import { createClient } from '@supabase/supabase-js';
import { AuthError, PermissionError } from './errors.ts';

export async function getSupabaseClient(req: Request) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    throw new AuthError('Missing Authorization header');
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

  const client = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: { Authorization: authHeader },
    },
  });

  return client;
}

export async function verifyJwt(req: Request) {
  const client = await getSupabaseClient(req);
  const { data: { user }, error } = await client.auth.getUser();

  if (error || !user) {
    throw new AuthError(error?.message || 'Invalid token');
  }

  return user;
}

export async function requireAnyUser(req: Request) {
  const user = await verifyJwt(req);

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const adminClient = createClient(supabaseUrl, supabaseServiceKey);

  // Direct table query instead of current_app_user RPC
  const { data: appUser, error } = await adminClient
    .from('app_users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error || !appUser) {
    throw new AuthError('User profile not found');
  }

  // Assistant revocation check
  if (appUser.role === 'assistant') {
    const { data: link, error: linkError } = await adminClient
      .from('user_location_links')
      .select('id')
      .eq('app_user_id', appUser.id)
      .is('revoked_at', null)
      .limit(1)
      .maybeSingle();

    if (linkError || !link) {
      throw new PermissionError('assistant_access_revoked');
    }
  }

  return appUser;
}

export async function requireAgent(req: Request) {
  const appUser = await requireAnyUser(req);
  if (appUser.role !== 'agent') {
    throw new PermissionError('Agent role required');
  }
  return appUser;
}

export async function getPrimaryLocation(userId: string) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const adminClient = createClient(supabaseUrl, supabaseServiceKey);

  // Direct table query instead of current_primary_location RPC
  const { data: link, error } = await adminClient
    .from('user_location_links')
    .select('ghl_location_id')
    .eq('app_user_id', userId)
    .eq('is_primary', true)
    .maybeSingle();

  if (error || !link?.ghl_location_id) {
    throw new PermissionError('No primary location found');
  }

  return link.ghl_location_id;
}
