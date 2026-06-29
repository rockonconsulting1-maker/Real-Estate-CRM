import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.42.0';
import { requireAgent } from '../_shared/auth.ts';
import { jsonError, ValidationError, PermissionError } from '../_shared/errors.ts';
import { getCorsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req.headers.get('origin'));

  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200, headers: corsHeaders });
  }

  try {
    // 1. Validate caller is an agent
    const agent = await requireAgent(req);

    // 2. Request Extraction & Validation
    const { assistant_user_id, template } = await req.json();

    if (!assistant_user_id || !template) {
      throw new ValidationError('assistant_user_id and template are required');
    }

    const allowedTemplates = ['read_only', 'leads_calendar', 'full_except_settings', 'custom'];
    if (!allowedTemplates.includes(template)) {
      throw new ValidationError('Invalid template value');
    }

    // 3. Confirm target user exists and is an assistant
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    const { data: assistant, error: assistantError } = await adminClient
      .from('app_users')
      .select('id, role')
      .eq('id', assistant_user_id)
      .single();

    if (assistantError || !assistant) {
      return new Response(JSON.stringify({ error: 'Assistant not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (assistant.role !== 'assistant') {
      throw new PermissionError('Target user is not an assistant');
    }

    // 4. Confirm link exists and is not revoked in the agent's location
    const { data: link, error: linkError } = await adminClient
      .from('user_location_links')
      .select('id')
      .eq('app_user_id', assistant_user_id)
      .eq('ghl_location_id', agent.ghl_location_id)
      .is('revoked_at', null)
      .single();

    if (linkError || !link) {
      return new Response(JSON.stringify({ error: 'Assistant link not found or revoked' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 5. Update template
    const { error: updateError } = await adminClient
      .from('user_location_links')
      .update({ permission_template: template })
      .eq('app_user_id', assistant_user_id)
      .eq('ghl_location_id', agent.ghl_location_id)
      .is('revoked_at', null);

    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({ success: true, assistant_user_id, template }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    return jsonError(error, corsHeaders);
  }
});
