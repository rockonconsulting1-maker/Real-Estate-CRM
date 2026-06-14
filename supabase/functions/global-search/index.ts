import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.42.0';
import { verifyJwt, requireAnyUser } from '../_shared/auth.ts';
import { decryptToken } from '../_shared/crypto.ts';
import { fetchGhl } from '../_shared/ghlClient.ts';
import { logAudit } from '../_shared/audit.ts';
import { jsonError, PermissionError } from '../_shared/errors.ts';
import { getCorsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req.headers.get('origin'));

  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200, headers: corsHeaders });
  }

  try {
    // 1. Auth & Context
    const user = await verifyJwt(req);
    const appUser = await requireAnyUser(req);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    const { data: link, error: linkError } = await adminClient
      .from('user_location_links')
      .select('*')
      .eq('app_user_id', user.id)
      .eq('is_primary', true)
      .maybeSingle();

    if (linkError || !link) {
      throw new PermissionError('No linked primary location found');
    }

    const { query, limit = 5 } = await req.json();
    if (!query) {
      return new Response(JSON.stringify({
        contacts: [], properties: [], offers: [], notes: []
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 2. Token
    const { access_token } = await decryptToken(link.ghl_location_id);

    // 3. Parallel Searches
    const searchTasks = [
      searchContacts(query, access_token, link.ghl_location_id),
      searchProperties(query, access_token, link.ghl_location_id),
      searchOffers(query, access_token, link.ghl_location_id),
      searchNotes(query, req.headers.get('Authorization')!)
    ];

    const results = await Promise.allSettled(searchTasks);

    const contactsRaw = results[0].status === 'fulfilled' ? results[0].value : [];
    const propertiesRaw = results[1].status === 'fulfilled' ? results[1].value : [];
    const offersRaw = results[2].status === 'fulfilled' ? results[2].value : [];
    const notesRaw = results[3].status === 'fulfilled' ? results[3].value : [];

    // 4. Ranking and Mapping
    const response = {
      contacts: rankAndMap(query, contactsRaw, mapContact).slice(0, limit),
      properties: rankAndMap(query, propertiesRaw, mapProperty).slice(0, limit),
      offers: rankAndMap(query, offersRaw, mapOffer).slice(0, limit),
      notes: notesRaw.slice(0, limit), // Notes are already ranked by the search-notes RPC
    };

    // 5. Audit Log
    await logAudit({
      app_user_id: user.id,
      ghl_location_id: link.ghl_location_id,
      ghl_user_id: link.ghl_user_id,
      action: `global_search: ${query}`,
      method: 'POST',
      path: '/global-search',
      status_code: 200,
    });

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    return jsonError(error, corsHeaders);
  }
});

async function searchContacts(query: string, token: string, locationId: string) {
  const resp = await fetchGhl('/contacts/search', 'POST', {
    locationId,
    q: query,
    limit: 20
  }, token);
  return resp.contacts || [];
}

async function searchProperties(query: string, token: string, locationId: string) {
  const resp = await fetchGhl('/objects/custom_objects.properties/records/search', 'POST', {
    locationId,
    filters: [
      { field: 'full_address', operator: 'contains', value: query }
    ],
    limit: 20
  }, token);
  return resp.records || [];
}

async function searchOffers(query: string, token: string, locationId: string) {
  const resp = await fetchGhl('/objects/custom_objects.real_estate_offer/records/search', 'POST', {
    locationId,
    filters: [
      { field: 'property_address', operator: 'contains', value: query }
    ],
    limit: 20
  }, token);
  return resp.records || [];
}

async function searchNotes(query: string, authHeader: string) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } }
  });

  const { data, error } = await supabase.rpc('search_notes_index', {
    search_query: query,
    max_results: 20
  });

  if (error) {
    console.error('Error searching notes:', error);
    return [];
  }
  return data || [];
}

function rankAndMap(query: string, items: any[], mapper: (item: any) => any) {
  return items
    .map(item => {
      const mapped = mapper(item);
      const searchStr = Object.values(mapped).join(' ').toLowerCase();
      const q = query.toLowerCase();

      let score = 0;
      if (searchStr.split(/\s+/).some(word => word.startsWith(q))) {
        score = 2;
      } else if (searchStr.includes(q)) {
        score = 1;
      }

      return { ...mapped, _score: score };
    })
    .filter(item => item._score > 0)
    .sort((a, b) => b._score - a._score)
    .map(({ _score, ...item }) => item);
}

function mapContact(c: any) {
  const name = c.contactName || `${c.firstName || ''} ${c.lastName || ''}`.trim() || 'Unknown';
  const role_hint = c.tags?.find((t: string) => ['buyer', 'lead', 'client', 'investor'].includes(t)) || 'contact';
  return {
    id: c.id,
    name,
    phone: c.phone,
    email: c.email,
    tags: c.tags || [],
    role_hint
  };
}

function mapProperty(p: any) {
  return {
    id: p.id,
    address: p.full_address || p.name || 'Unknown Address',
    price: p.price || 0,
    status: p.status || 'Active'
  };
}

function mapOffer(o: any) {
  return {
    id: o.id,
    property_address: o.property_address || 'Unknown',
    client_name: o.client_name || 'Unknown Client',
    price: o.purchase_price || 0,
    status: o.status || 'Pending'
  };
}
