import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.42.0';
import HighLevel from 'https://esm.sh/@gohighlevel/api-client@3.0.0?target=es2022';
import { verifyJwt, requireAgent, getPrimaryLocation } from '../_shared/auth.ts';
import { decryptToken } from '../_shared/crypto.ts';
import { jsonError } from '../_shared/errors.ts';
import { getCorsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req.headers.get('origin'));

  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200, headers: corsHeaders });
  }

  try {
    const user = await verifyJwt(req);
    await requireAgent(req);
    const locationId = await getPrimaryLocation(user.id);

    const { access_token } = await decryptToken(locationId);
    const ghl = new HighLevel({
      locationAccessToken: access_token,
      apiVersion: '2021-07-28',
    });

    const body = await req.json();
    const cursor = body.cursor; // GHL uses 'startAfterId' or similar usually, but for simplicity we'll assume we can pass it to our caller.
    // Actually GHL V2 contacts/search uses 'searchAfter' or 'offset'

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Search for contacts
    const contactsResponse = await ghl.request({
      method: 'POST',
      url: '/contacts/search',
      data: {
        locationId,
        pageLimit: 20,
        searchAfter: cursor ? [cursor] : undefined,
      }
    });

    const contacts = contactsResponse.data.contacts || [];
    const nextCursor = contactsResponse.data.meta?.searchAfter?.[0];

    // 2. For each contact, fetch tasks
    for (const contact of contacts) {
      const tasksResponse = await ghl.request({
        method: 'GET',
        url: `/contacts/${contact.id}/tasks`,
        params: { locationId }
      });

      const tasks = tasksResponse.data.tasks || [];
      if (tasks.length > 0) {
        const { error: upsertError } = await supabase
          .from('task_index')
          .upsert(tasks.map((t: any) => ({
            id: t.id,
            ghl_location_id: locationId,
            contact_id: contact.id,
            title: t.title,
            body: t.body,
            due_date: t.dueDate,
            completed: t.status === 'completed',
            assigned_to: t.assignedTo,
            updated_at: new Date().toISOString()
          })), { onConflict: 'id' });

        if (upsertError) console.error(`Upsert error for contact ${contact.id}:`, upsertError);
      }
    }

    return new Response(JSON.stringify({ nextCursor }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Backfill error:', error);
    return jsonError(error, corsHeaders);
  }
});
