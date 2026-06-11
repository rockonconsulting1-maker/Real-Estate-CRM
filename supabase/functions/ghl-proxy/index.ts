import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.42.0';
import HighLevel, { GHLError } from '@gohighlevel/api-client';
import { verifyJwt, requireAnyUser } from '../_shared/auth.ts';
import { decryptToken } from '../_shared/crypto.ts';
import { logAudit } from '../_shared/audit.ts';
import { jsonError } from '../_shared/errors.ts';
import { corsHeaders } from '../_shared/cors.ts';

// GET endpoints on the GHL API that require a locationId query param.
const LOCATION_SCOPED_GET_PREFIXES = ['/contacts/', '/calendars/events', '/users/'];

/**
 * The client-supplied locationId is never trusted: any locationId already in
 * the query string is dropped, and the server-resolved one is set where the
 * upstream endpoint needs it (or wherever the client tried to supply one).
 */
function enforceLocationIdInPath(path: string, method: string, locationId: string): string {
  const url = new URL(path, 'https://ghl.invalid');
  const hadClientLocationId = url.searchParams.has('locationId');
  url.searchParams.delete('locationId');

  const requiresParam =
    method === 'GET' &&
    LOCATION_SCOPED_GET_PREFIXES.some((prefix) => url.pathname.startsWith(prefix));

  if (requiresParam || hadClientLocationId) {
    url.searchParams.set('locationId', locationId);
  }

  return url.pathname + url.search;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Auth & Profile
    const user = await verifyJwt(req);
    const appUser = await requireAnyUser(req);

    // 2. Resolve Location Link — primary and not revoked only
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    const { data: link, error: linkError } = await adminClient
      .from('user_location_links')
      .select('*')
      .eq('app_user_id', user.id)
      .eq('is_primary', true)
      .is('revoked_at', null)
      .limit(1)
      .maybeSingle();

    if (linkError || !link) {
      return new Response(JSON.stringify({ error: 'no_active_location' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 3. Request Extraction
    const { method: rawMethod, path: rawPath, body } = await req.json();
    const method = String(rawMethod ?? '').toUpperCase();

    // 4. Server-side locationId injection
    const path = enforceLocationIdInPath(String(rawPath ?? ''), method, link.ghl_location_id);
    if (body && typeof body === 'object' && !Array.isArray(body) && ['POST', 'PUT', 'PATCH'].includes(method)) {
      delete (body as Record<string, unknown>).locationId;
      (body as Record<string, unknown>).locationId = link.ghl_location_id;
    }

    // 5. Permission Enforcement
    if (appUser.role === 'assistant') {
      const { data: linkRow } = await adminClient
        .from('user_location_links')
        .select('permission_template, revoked_at')
        .eq('app_user_id', appUser.id)
        .eq('ghl_location_id', link.ghl_location_id)
        .single();

      if (!linkRow || linkRow.revoked_at) {
        return new Response(JSON.stringify({ error: 'assistant_access_revoked' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const template = linkRow.permission_template ?? 'full_except_settings';

      const { data: allowedRules } = await adminClient
        .from('assistant_permission_templates')
        .select('method, path_prefix')
        .eq('template', template);

      const allowed = (allowedRules ?? []).some(
        (rule: any) =>
          rule.method === method &&
          path.startsWith(rule.path_prefix)
      );

      if (!allowed) {
        await logAudit({
          app_user_id: appUser.id,
          ghl_location_id: link.ghl_location_id,
          ghl_user_id: link.ghl_user_id,
          action: `${method} ${path}`,
          method,
          path,
          status_code: 403,
        });
        return new Response(JSON.stringify({ error: 'permission_denied' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // 6. Proxy to GHL with 401 → token-refresh → single retry.
    //    The audit entry is written in `finally` so every outcome is recorded
    //    (success, GHL 4xx/5xx, token-refresh failure) with the real upstream
    //    status code.
    let upstreamStatus = 0;

    try {
      const { access_token } = await decryptToken(link.ghl_location_id);

      const clientConfig = {
        locationAccessToken: access_token,
        apiVersion: '2021-07-28',
      };

      let client = new HighLevel(clientConfig);
      let ghlResponse;

      try {
        const resp = await client.request({ method, url: path, data: body });
        ghlResponse = resp.data;
        upstreamStatus = resp.status ?? 200;
      } catch (e: any) {
        const status = e.status || e.statusCode;
        if (status !== 401) throw e;

        // Attempt on-demand refresh
        const refreshResponse = await fetch(`${supabaseUrl}/functions/v1/ghl-token-refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify({ locationId: link.ghl_location_id }),
        });

        if (!refreshResponse.ok) {
          console.error('[ghl-proxy] token refresh failed:', refreshResponse.status);
          throw e; // audit records the original upstream 401
        }

        const { access_token: newAccessToken } = await decryptToken(link.ghl_location_id);
        client = new HighLevel({
          ...clientConfig,
          locationAccessToken: newAccessToken,
        });

        const resp = await client.request({ method, url: path, data: body });
        ghlResponse = resp.data;
        upstreamStatus = resp.status ?? 200;
      }

      return new Response(JSON.stringify(ghlResponse), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (e: any) {
      if (!upstreamStatus) {
        upstreamStatus = e.status || e.statusCode || 500;
      }
      throw e;
    } finally {
      await logAudit({
        app_user_id: user.id,
        ghl_location_id: link.ghl_location_id,
        ghl_user_id: link.ghl_user_id,
        action: `${method} ${path}`,
        target_id: extractTargetId(path, body),
        method,
        path,
        status_code: upstreamStatus,
      });
    }
  } catch (error: any) {
    if (error instanceof GHLError) {
      return new Response(JSON.stringify({
        error: error.message,
        statusCode: error.status,
      }), {
        status: error.status || 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    return jsonError(error);
  }
});

function extractTargetId(path: string, body: any): string | undefined {
  const parts = path.split('?')[0].split('/').filter(Boolean);
  const idCandidate = parts[1];
  if (idCandidate && idCandidate.length > 5) return idCandidate;

  if (body) {
    return body.id || body.contactId || body.opportunityId || body.userId;
  }
  return undefined;
}
