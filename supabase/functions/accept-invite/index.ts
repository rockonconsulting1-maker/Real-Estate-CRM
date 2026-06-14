import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.0";
import { verifyJwt } from "../_shared/auth.ts";
import { jsonError, ValidationError, PermissionError } from "../_shared/errors.ts";
import { getCorsHeaders } from '../_shared/cors.ts';

serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req.headers.get('origin'));

  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200, headers: corsHeaders });
  }

  try {
    const { token } = await req.json();
    if (!token) {
      throw new ValidationError('Token is required');
    }

    // 1. Get the caller's auth.uid
    const user = await verifyJwt(req);
    const callerId = user.id;
    const callerEmail = user.email;

    if (!callerEmail) {
      throw new ValidationError('User email not found in session');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // 2. Look up the invite directly with the service role client.
    const { data: invite, error: inviteError } = await adminClient
      .from('invites')
      .select('id, invited_email, invited_by_user_id, role, expires_at, accepted_at')
      .eq('token', token)
      .maybeSingle();

    // 3. Validate
    if (inviteError || !invite) {
      return new Response(JSON.stringify({ error: 'Invite not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (invite.accepted_at || new Date(invite.expires_at) < new Date()) {
      return new Response(JSON.stringify({ error: 'Invite expired or already used' }), {
        status: 410,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (invite.invited_email.toLowerCase() !== callerEmail.toLowerCase()) {
      throw new PermissionError('Email mismatch');
    }

    // 4. Mark the invite as accepted
    const { error: updateInviteError } = await adminClient
      .from('invites')
      .update({ accepted_at: new Date().toISOString() })
      .eq('token', token);

    if (updateInviteError) throw updateInviteError;

    // 5. Check if the caller already has a row in public.app_users. If not, insert.
    const { data: existingAppUser } = await adminClient
      .from('app_users')
      .select('id')
      .eq('id', callerId)
      .maybeSingle();

    if (!existingAppUser) {
      const { error: userInsertError } = await adminClient
        .from('app_users')
        .insert({
          id: callerId,
          email: callerEmail,
          role: 'assistant',
          full_name: user.user_metadata?.full_name || ''
        });
      if (userInsertError) throw userInsertError;
    }

    // 6. Resolve the inviting agent's ghl_location_id
    const { data: agent, error: agentError } = await adminClient
      .from('app_users')
      .select('ghl_location_id')
      .eq('id', invite.invited_by_user_id)
      .single();

    if (agentError || !agent?.ghl_location_id) {
      throw new Error('Inviting agent or their location not found');
    }

    const agentLocationId = agent.ghl_location_id;

    // 7. Insert into public.user_location_links
    const { error: linkError } = await adminClient
      .from('user_location_links')
      .upsert({
        app_user_id: callerId,
        ghl_location_id: agentLocationId,
        ghl_user_id: null // Migration ensures this column is nullable
      }, { onConflict: 'app_user_id,ghl_location_id' });

    if (linkError) throw linkError;

    // --- GHL User Creation Block ---
    let ghlUserId: string | null = null;
    try {
      const { data: tokenData, error: tokenError } = await adminClient
        .rpc('get_decrypted_ghl_token', { p_location_id: agentLocationId });

      const ghlAccessToken = Array.isArray(tokenData) ? tokenData[0]?.access_token : tokenData?.access_token;

      if (tokenError || !ghlAccessToken) {
        console.error('[accept-invite] GHL token unavailable (non-fatal):', tokenError);
      } else {
        const tempPassword = crypto.randomUUID().replace(/-/g, '').slice(0, 16) + 'Aa1!';
        const fullName = user.user_metadata?.full_name || 'Assistant';
        const firstName = fullName.split(' ')[0] || 'Assistant';
        const lastName = fullName.split(' ').slice(1).join(' ') || '';

        const ghlResponse = await fetch(
          'https://services.leadconnectorhq.com/users/',
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${ghlAccessToken}`,
              'Version': '2021-07-28',
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify({
              firstName,
              lastName,
              email: callerEmail,
              password: tempPassword,
              phone: '',
              type: 'account',
              role: 'user',
              locationIds: [agentLocationId],
              permissions: {
                contactsEnabled: true,
                opportunitiesEnabled: true,
                appointmentsEnabled: true,
                tagsEnabled: true,
                dashboardStatsEnabled: true,
                leadValueEnabled: false,
                settingsEnabled: false,
                exportEnabled: false,
                bulkRequestsEnabled: false,
                attributionReportEnabled: false,
                agentReportEnabled: false,
                membershipEnabled: false,
                facebookAdsReportEnabled: false,
                onlineListingsEnabled: false,
                phoneCallEnabled: true,
                campaignsEnabled: false,
                campaignsReadOnly: true,
                blogsEnabled: false,
                invoiceEnabled: false,
                reviewsEnabled: false,
                contentAiEnabled: false,
                refundsEnabled: false,
                recordPaymentEnabled: false,
                cancelSubscriptionEnabled: false,
                paymentsEnabled: false,
                communitiesEnabled: false,
                websitesEnabled: false,
                workflowsEnabled: false,
                workflowsReadOnly: true,
                socialPlanner: false,
              },
            }),
          }
        );

        if (ghlResponse.ok) {
          const ghlData = await ghlResponse.json();
          ghlUserId = ghlData?.user?.id ?? ghlData?.id ?? null;
          console.log('[accept-invite] GHL user created:', ghlUserId);
        } else {
          const errBody = await ghlResponse.text();
          console.error('[accept-invite] GHL user creation failed (non-fatal):', ghlResponse.status, errBody);
        }
      }

      if (ghlUserId) {
        await adminClient
          .from('user_location_links')
          .update({ ghl_user_id: ghlUserId })
          .eq('app_user_id', callerId)
          .eq('ghl_location_id', agentLocationId);

        await adminClient
          .from('app_users')
          .update({ ghl_user_id: ghlUserId })
          .eq('id', callerId);
      }
    } catch (ghlErr: any) {
      console.error('[accept-invite] Non-fatal GHL block error:', ghlErr?.message);
    }

    return new Response(
      JSON.stringify({
        success: true,
        role: 'assistant',
        ghl_location_id: agentLocationId,
        ghl_user_id: ghlUserId,
        ...(!ghlUserId ? { warning: 'GHL user could not be created automatically. Assistant can still use RC CRM.' } : {})
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err: any) {
    console.error('[accept-invite] Unhandled error:', err?.message ?? err);
    return new Response(
      JSON.stringify({ error: err?.message ?? 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
