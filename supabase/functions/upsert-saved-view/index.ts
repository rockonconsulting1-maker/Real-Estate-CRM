import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.42.0'
import { requireAnyUser } from '../_shared/auth.ts'
import { jsonError, ValidationError } from '../_shared/errors.ts'
import { getCorsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req.headers.get('origin'));

  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200, headers: corsHeaders });
  }

  try {
    const user = await requireAnyUser(req)
    const { scope, name, filter_json, is_pinned } = await req.json()

    if (!scope || !name) {
      throw new ValidationError('Scope and name are required')
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const adminClient = createClient(supabaseUrl, supabaseServiceKey)

    const { data, error } = await adminClient
      .from('saved_views')
      .upsert({
        app_user_id: user.id,
        scope,
        name,
        filter_json: filter_json || {},
        is_pinned: !!is_pinned,
        is_system: false,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'app_user_id, scope, name'
      })
      .select()
      .single()

    if (error) throw error

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    return jsonError(error, corsHeaders)
  }
})
