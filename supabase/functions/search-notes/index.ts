import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.42.0';
import { verifyJwt, requireAnyUser } from '../_shared/auth.ts';
import { jsonError, PermissionError } from '../_shared/errors.ts';
import { logAudit } from '../_shared/audit.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Auth & Context
    const user = await verifyJwt(req);
    const appUser = await requireAnyUser(req);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: req.headers.get('Authorization')! } }
    });

    const bodyData = await req.json();
    const query = bodyData.query;
    const limit = bodyData.limit || 20;
    const offset = bodyData.offset || 0;

    let data;
    let error;

    if (!query) {
      // Return most recent notes for caller's location
      const result = await supabase
        .from('note_index')
        .select('*')
        .order('updated_at', { ascending: false })
        .range(offset, offset + limit - 1);
      data = result.data;
      error = result.error;
    } else {
      // Full-Text Search
      const result = await supabase.rpc('search_notes_index', {
        search_query: query,
        max_results: limit
      });
      data = result.data;
      error = result.error;
      // Note: search_notes_index doesn't currently support offset.
      // If needed, we could modify the RPC or handle it here if it returned more.
      // But for now we stick to the requirement.
    }

    if (error) throw error;

    // 3. Audit Log
    let locationId = data?.[0]?.ghl_location_id;
    if (!locationId) {
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const adminClient = createClient(supabaseUrl, supabaseServiceKey);
        const { data: link } = await adminClient
          .from('user_location_links')
          .select('ghl_location_id')
          .eq('app_user_id', user.id)
          .eq('is_primary', true)
          .maybeSingle();
        locationId = link?.ghl_location_id || 'unknown';
    }

    await logAudit({
      app_user_id: user.id,
      ghl_location_id: locationId,
      ghl_user_id: appUser.ghl_user_id,
      action: query ? `note_search: ${query}` : `note_list: limit=${limit}, offset=${offset}`,
      method: 'POST',
      path: '/search-notes',
      status_code: 200,
    });

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    return jsonError(error);
  }
});
