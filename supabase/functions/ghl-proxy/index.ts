import { createClient } from '@supabase/supabase-js';
import HighLevel, { GHLError } from '@gohighlevel/api-client';
import { verifyJwt, requireAnyUser } from '../_shared/auth.ts';
import { decryptToken } from '../_shared/crypto.ts';
import { logAudit } from '../_shared/audit.ts';
import { jsonError } from '../_shared/errors.ts';
import { getCorsHeaders } from '../_shared/cors.ts';

// GET endpoints on the GHL API that require a locationId query param.
const LOCATION_SCOPED_GET_PREFIXES = ['/contacts/', '/calendars/events', '/users/'];

/**
 * The client-supplied locationId is never trusted: any locationId already in
 * the query string is dropped, and the server-resolved one is set where the
 * upstream endpoint needs it (or wherever the client tried to supply one).
 */
function enforceLocationIdInPath(path: string, method: string, locationId: string): string {
  try {
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
  } catch (e) {
    console.error('[ghl-proxy] Failed to parse path:', path, e);
    return path;
  }
}

Deno.serve(async (req) => {
  // 1. Immediate CORS Handling - MUST BE LAZY AND FIRST
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200, headers: corsHeaders });
  }

  try {
    // 2. Auth & Profile
    const user = await verifyJwt(req);
    const appUser = await requireAnyUser(req);

    // 3. Resolve Location Link — primary and not revoked only
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

    // 4. Request Extraction
    let bodyPayload;
    try {
      bodyPayload = await req.json();
    } catch (e) {
      // Body might be empty
    }

    const { method: rawMethod, path: rawPath, body } = bodyPayload || {};
    const method = String(rawMethod ?? 'GET').toUpperCase();

    // 5. Server-side locationId injection
    const path = enforceLocationIdInPath(String(rawPath ?? ''), method, link.ghl_location_id);

    // SDK handles its own locationId, but we keep this for consistency if using raw request
    if (body && typeof body === 'object' && !Array.isArray(body) && ['POST', 'PUT', 'PATCH'].includes(method)) {
      const forwardedBody = body as Record<string, unknown>;
      delete forwardedBody.locationId;
      forwardedBody.locationId = link.ghl_location_id;
    }

    // 6. Permission Enforcement
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

    // 7. Proxy to GHL with 401 → token-refresh → single retry.
    let upstreamStatus = 0;

    try {
      const { access_token } = await decryptToken(link.ghl_location_id);

      const clientConfig = {
        locationAccessToken: access_token,
        apiVersion: '2021-07-28' as any,
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
    if (error instanceof GHLError || (error && (error.name === 'GHLError' || error.constructor?.name === 'GHLError'))) {
      return new Response(JSON.stringify({
        message: error.message,
        statusCode: error.status || error.statusCode,
      }), {
        status: error.status || error.statusCode || 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    return jsonError(error, corsHeaders);
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
