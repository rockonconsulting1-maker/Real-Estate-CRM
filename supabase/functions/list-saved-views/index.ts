import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.42.0'
import { requireAnyUser } from '../_shared/auth.ts'
import { jsonError, ValidationError } from '../_shared/errors.ts'
import { getCorsHeaders } from '../_shared/cors.ts'

const SYSTEM_VIEWS: Record<string, Array<{ name: string, filter_json: any }>> = {
  leads: [
    { name: 'Hot Buyers', filter_json: { status: 'lead', tags: ['hot'] } },
    { name: 'Needs Follow-up', filter_json: { status: 'lead', last_contact_gt: 7 } },
  ],
  properties: [
    { name: 'Active Listings', filter_json: { status: 'active' } },
    { name: 'Recently Sold', filter_json: { status: 'sold', sold_date_gt: 30 } },
  ],
  tasks: [
    { name: 'Due Today', filter_json: { due_date: 'today', status: 'pending' } },
    { name: 'Overdue', filter_json: { due_date_lt: 'today', status: 'pending' } },
  ]
}

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req.headers.get('origin'));

  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200, headers: corsHeaders });
  }

  try {
    const user = await requireAnyUser(req)
    const { scope } = await req.json()

    if (!scope) {
      throw new ValidationError('Scope is required')
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const adminClient = createClient(supabaseUrl, supabaseServiceKey)

    const { data: existingViews, error: fetchError } = await adminClient
      .from('saved_views')
      .select('*')
      .eq('app_user_id', user.id)
      .eq('scope', scope)

    if (fetchError) throw fetchError

    const systemTemplates = SYSTEM_VIEWS[scope] || []
    const missingSystemTemplates = systemTemplates.filter(
      template => !existingViews.some(view => view.name === template.name && view.is_system)
    )

    if (missingSystemTemplates.length > 0) {
      const { data: seeded, error: seedError } = await adminClient
        .from('saved_views')
        .insert(missingSystemTemplates.map(t => ({
          app_user_id: user.id,
          scope,
          name: t.name,
          filter_json: t.filter_json,
          is_system: true
        })))
        .select()

      if (seedError) {
          console.error('Failed to seed system views:', seedError)
      } else if (seeded) {
          existingViews.push(...seeded)
      }
    }

    return new Response(JSON.stringify(existingViews), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    return jsonError(error, corsHeaders)
  }
})
