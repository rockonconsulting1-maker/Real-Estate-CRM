import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.42.0'
import { requireAnyUser } from '../_shared/auth.ts'
import { jsonError, ValidationError, PermissionError } from '../_shared/errors.ts'
import { getCorsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req.headers.get('origin'));

  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200, headers: corsHeaders });
  }

  try {
    const user = await requireAnyUser(req)
    const { id } = await req.json()

    if (!id) {
      throw new ValidationError('View ID is required')
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const adminClient = createClient(supabaseUrl, supabaseServiceKey)

    const { data: view, error: fetchError } = await adminClient
      .from('saved_views')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (fetchError) throw fetchError
    if (!view) {
      throw new ValidationError('View not found')
    }

    if (view.app_user_id !== user.id) {
      throw new PermissionError('You do not own this view')
    }

    if (view.is_system) {
      throw new PermissionError('System views cannot be deleted')
    }

    const { error: deleteError } = await adminClient
      .from('saved_views')
      .delete()
      .eq('id', id)

    if (deleteError) throw deleteError

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    return jsonError(error, corsHeaders)
  }
})
