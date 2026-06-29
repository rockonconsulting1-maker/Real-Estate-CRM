import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.0";
import { requireAgent } from "../_shared/auth.ts";
import { jsonError, ValidationError, PermissionError } from "../_shared/errors.ts";
import { getCorsHeaders } from '../_shared/cors.ts';

serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req.headers.get('origin'));

  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200, headers: corsHeaders });
  }

  try {
    // 1. Validate caller is an agent
    const agent = await requireAgent(req);

    // 2. Validate assistant_user_id
    const { assistant_user_id } = await req.json();
    if (!assistant_user_id) {
      throw new ValidationError('assistant_user_id is required');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // 3. Confirm target user is an assistant
    const { data: targetUser, error: targetUserError } = await adminClient
      .from('app_users')
      .select('id, role, ghl_location_id')
      .eq('id', assistant_user_id)
      .single();

    if (targetUserError || !targetUser || targetUser.role !== 'assistant') {
      throw new PermissionError('Target user not found or is not an assistant');
    }

    // 4. Confirm ownership (location match)
    const { data: agentUser } = await adminClient
      .from('app_users')
      .select('ghl_location_id')
      .eq('id', agent.id)
      .single();

    // Check user_location_links for ownership
    const { data: link, error: linkError } = await adminClient
      .from('user_location_links')
      .select('*')
      .eq('app_user_id', assistant_user_id)
      .eq('ghl_location_id', agentUser?.ghl_location_id)
      .is('revoked_at', null)
      .maybeSingle();

    if (linkError || !link) {
      throw new PermissionError('Assistant not found in your location or already revoked');
    }

    // 5. Update user_location_links set revoked_at = now()
    const { error: updateError } = await adminClient
      .from('user_location_links')
      .update({ revoked_at: new Date().toISOString() })
      .eq('app_user_id', assistant_user_id)
      .eq('ghl_location_id', agentUser?.ghl_location_id)
      .is('revoked_at', null);

    if (updateError) throw updateError;

    // 6. Return 200
    return new Response(JSON.stringify({ success: true, revoked_user_id: assistant_user_id }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    return jsonError(error, corsHeaders);
  }
});
