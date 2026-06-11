# Edge Functions Changelog

## 2026-06-11

### ghl-proxy v16 (source now tracked in `supabase/functions/ghl-proxy/`)

- **Location resolution fix:** the `user_location_links` lookup now filters
  `is_primary = true` and `revoked_at IS NULL`. If no active primary link
  exists the proxy returns `403 { error: 'no_active_location' }` instead of
  proxying with an arbitrary link row.
- **Server-side locationId injection:** the client-supplied `locationId` is
  never trusted. Any `locationId` in the request path's query string is
  stripped and replaced with the server-resolved one; GET requests to
  location-scoped endpoints (`/contacts/`, `/calendars/events`, `/users/`)
  always get `locationId` appended. For POST/PUT/PATCH JSON bodies,
  `body.locationId` is deleted and overwritten with the server-resolved value.
- **Audit on every outcome:** `logAudit()` now runs in a `finally` block
  around the upstream call, so success, GHL 4xx/5xx errors, and token-refresh
  failures are all recorded with the real upstream status code (previously
  only successes and assistant permission denials were logged). The assistant
  permission-denial path now also goes through the sanitizing `logAudit()`
  helper instead of a raw insert.
- The 401 → `ghl-token-refresh` → single-retry behavior is unchanged.

### _shared/cors.ts

- `Access-Control-Allow-Origin` is now `Deno.env.get('APP_BASE_URL')`,
  falling back to `*` (with a `console.warn`) only when the env var is unset.
  **Action required:** set the `APP_BASE_URL` secret on the project
  (`supabase secrets set APP_BASE_URL=https://<app-domain>`); until then the
  fallback keeps current behavior. Functions other than `ghl-proxy` pick up
  the new header on their next redeploy.

### Obsolete duplicates: ghl-proxy-final v5, update-assistant-template-final v5

- Verified nothing in the frontend invokes them (the app only calls
  `supabase.functions.invoke('ghl-proxy')` / `update-assistant-template`).
- Both were overwritten with tombstone stubs that return `410 Gone` and now
  require a JWT, removing the stale duplicated proxy code from the live
  surface. Actual deletion needs an authenticated CLI, which is not available
  in the automation environment — run:
  `supabase functions delete ghl-proxy-final --project-ref hnanbydtnchswrofupgd`
  `supabase functions delete update-assistant-template-final --project-ref hnanbydtnchswrofupgd`

### accept-invite v18 (deployed earlier today)

- Reads `public.invites` directly with the service-role client instead of the
  `lookup_invite` RPC, which was narrowed to non-sensitive columns by
  migration `20260611103402`.
