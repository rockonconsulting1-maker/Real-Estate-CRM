import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.0";
import { requireAgent } from "../_shared/auth.ts";
import { jsonError, ValidationError } from "../_shared/errors.ts";
import { getCorsHeaders } from '../_shared/cors.ts';

serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req.headers.get('origin'));

  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200, headers: corsHeaders });
  }

  try {
    // 1. Validate caller is an agent
    const agent = await requireAgent(req);

    // 2. Validate email
    const { email } = await req.json();
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      throw new ValidationError('Valid email is required');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // 3. Check if a pending invite already exists for this email for this agent
    console.log(`Checking for existing invite for email: ${email}, agent: ${agent.id}`);
    const { data: existingInvite } = await adminClient
      .from('invites')
      .select('*')
      .eq('invited_email', email)
      .eq('invited_by_user_id', agent.id)
      .is('accepted_at', null)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();

    if (existingInvite) {
      return new Response(JSON.stringify({ error: 'A pending invite already exists for this email.' }), {
        status: 409,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 4. Insert a new row into public.invites
    const { data: invite, error: inviteError } = await adminClient
      .from('invites')
      .insert({
        invited_email: email,
        invited_by_user_id: agent.id,
        role: 'assistant'
      })
      .select('id, token, invited_email, role, expires_at, created_at')
      .single();

    if (inviteError || !invite) {
      throw inviteError || new Error('Failed to create invite');
    }

    // 5 & 6. Call Supabase Auth Admin API to send the invite email
    const appBaseUrl = Deno.env.get('APP_BASE_URL');

    let linkData;
    try {
      const { data, error: linkError } = await adminClient.auth.admin.generateLink({
        type: 'invite',
        email,
        options: {
          redirectTo: `${appBaseUrl}/invite/accept?token=${invite.token}`,
        },
      });

      if (linkError) {
        // User already exists in auth.users — send a magic link instead
        if (
          linkError.message?.includes('already been registered') ||
          linkError.message?.includes('already registered')
        ) {
          console.log(`User ${email} already exists, falling back to magiclink`);
          const { data: magicData, error: magicError } = await adminClient.auth.admin.generateLink({
            type: 'magiclink',
            email,
            options: {
              redirectTo: `${appBaseUrl}/invite/accept?token=${invite.token}`,
            },
          });
          if (magicError) throw magicError;
          linkData = magicData;
        } else {
          throw linkError;
        }
      } else {
        linkData = data;
      }
    } catch (err) {
      console.error('Failed to generate link:', err);
      // Rollback invite record if auth invite fails
      await adminClient.from('invites').delete().eq('id', invite.id);

      return new Response(
        JSON.stringify({ error: 'Failed to generate invite link. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // linkData.properties.action_link contains the full magic link URL
    // Supabase still sends the email automatically when using generateLink
    const actionLink = linkData?.properties?.action_link ?? null;

    // Debug log — visible in Supabase dashboard → Edge Functions → Logs
    console.log('[invite-assistant] Generated magic link:', actionLink);

    // 7. Return 201 with the invite record
    return new Response(
      JSON.stringify({
        ...invite,
        magic_link: actionLink,
      }),
      {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    return jsonError(error, corsHeaders);
  }
});
