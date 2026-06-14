import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.42.0'
import { requireAnyUser } from '../_shared/auth.ts'
import { logAudit } from '../_shared/audit.ts'
import { jsonError, ValidationError } from '../_shared/errors.ts'
import { getCorsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req.headers.get('origin'));

  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200, headers: corsHeaders });
  }

  try {
    const user = await requireAnyUser(req)
    const { origin, destination, departureAt } = await req.json()

    if (!origin || !destination) {
      throw new ValidationError('Origin and destination are required')
    }

    const departureDate = departureAt ? new Date(departureAt) : new Date()
    const bucketMs = 15 * 60 * 1000
    const bucketDate = new Date(Math.floor(departureDate.getTime() / bucketMs) * bucketMs)
    const bucketTs = bucketDate.toISOString()

    const originHash = await hashString(origin.trim().toLowerCase())
    const destHash = await hashString(destination.trim().toLowerCase())

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const adminClient = createClient(supabaseUrl, supabaseServiceKey)

    const { data: cached } = await adminClient
      .from('drive_time_cache')
      .select('*')
      .eq('origin_hash', originHash)
      .eq('dest_hash', destHash)
      .eq('bucket_ts', bucketTs)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .maybeSingle()

    if (cached) {
      await logAudit({
        app_user_id: user.id,
        ghl_location_id: user.ghl_location_id || '',
        ghl_user_id: user.ghl_user_id || '',
        action: 'drive-time-lookup',
        target_id: `${originHash.slice(0, 8)}->${destHash.slice(0, 8)}`,
        method: 'CACHE',
        path: '/drive-time',
        status_code: 200
      })

      return new Response(JSON.stringify({
        seconds: cached.seconds,
        distanceMeters: cached.distance_meters,
        provider: cached.provider,
        cachedAt: cached.created_at
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const mapboxToken = Deno.env.get('MAPBOX_TOKEN')
    if (!mapboxToken) {
      throw new Error('MAPBOX_TOKEN is not configured')
    }

    const originCoords = await resolveToCoords(origin, mapboxToken)
    const destCoords = await resolveToCoords(destination, mapboxToken)

    const coordsString = `${originCoords.lon},${originCoords.lat};${destCoords.lon},${destCoords.lat}`
    const matrixUrl = `https://api.mapbox.com/directions-matrix/v1/mapbox/driving/${coordsString}?access_token=${mapboxToken}&annotations=duration,distance&sources=0&destinations=1`

    const matrixRes = await fetch(matrixUrl)
    if (!matrixRes.ok) {
      const errText = await matrixRes.text()
      throw new Error(`Mapbox API error: ${errText}`)
    }

    const matrixData = await matrixRes.json()
    const seconds = Math.round(matrixData.durations[0][0])
    const distanceMeters = Math.round(matrixData.distances[0][0])

    const { data: saved, error: cacheError } = await adminClient
      .from('drive_time_cache')
      .insert({
        origin_text: origin,
        dest_text: destination,
        origin_hash: originHash,
        dest_hash: destHash,
        bucket_ts: bucketTs,
        seconds,
        distance_meters: distanceMeters,
        provider: 'mapbox'
      })
      .select()
      .single()

    if (cacheError) {
      console.error('Failed to cache drive-time:', cacheError)
    }

    await logAudit({
        app_user_id: user.id,
        ghl_location_id: user.ghl_location_id || '',
        ghl_user_id: user.ghl_user_id || '',
        action: 'drive-time-lookup',
        target_id: `${originHash.slice(0, 8)}->${destHash.slice(0, 8)}`,
        method: 'API',
        path: '/drive-time',
        status_code: 200
    })

    return new Response(JSON.stringify({
      seconds,
      distanceMeters,
      provider: 'mapbox',
      cachedAt: saved?.created_at || new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    return jsonError(error, corsHeaders)
  }
})

async function hashString(str: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(str)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

async function resolveToCoords(query: string, token: string): Promise<{ lon: number, lat: number }> {
  const coordMatch = query.match(/^(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)$/)
  if (coordMatch) {
    return { lon: parseFloat(coordMatch[1]), lat: parseFloat(coordMatch[2]) }
  }
  const geocodeUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${token}&limit=1`
  const res = await fetch(geocodeUrl)
  if (!res.ok) throw new Error(`Geocoding failed: ${await res.text()}`)
  const data = await res.json()
  if (!data.features || data.features.length === 0) {
    throw new ValidationError(`Could not resolve address: ${query}`)
  }
  const [lon, lat] = data.features[0].center
  return { lon, lat }
}
