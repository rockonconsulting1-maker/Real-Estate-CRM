# Supabase.md — RC CRM

**Everything Supabase: project, auth, database schema, RLS, edge functions, environment, and how the React frontend integrates with all of it.**

Companion to `PROJECT.md` and `ARCHITECTURE.md`. The Supabase backend is **already provisioned and deployed** — this document tells the frontend build how to use it. Do not modify the backend.

---

## 1. Project facts

| Field | Value |
|---|---|
| Project ID | `hnanbydtnchswrofupgd` |
| Project URL | `https://hnanbydtnchswrofupgd.supabase.co` |
| Region | `us-east-2` |
| Postgres | 17.6.1 |
| Edge Functions base | `https://hnanbydtnchswrofupgd.supabase.co/functions/v1/` |
| Status | Active, healthy |

Supabase plays four roles for RC CRM: **authentication**, **a secure GHL API proxy** (edge functions), **a small supplementary Postgres** (app metadata only — never CRM data), and **file storage** (documents).

---

## 2. Frontend integration

### 2.1 The client

```ts
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true, // needed for invite / recovery links
    },
  },
);
```

Only two env vars exist in the frontend. Both are public-safe — the anon key is meant to ship to browsers; RLS enforces access at the database layer.

```
VITE_SUPABASE_URL=https://hnanbydtnchswrofupgd.supabase.co
VITE_SUPABASE_ANON_KEY=<anon key>
```

No service role key, no GHL secrets, no client secret ever appears in frontend code or the bundle.

### 2.2 What the frontend calls

The frontend touches Supabase three ways:

1. **Auth** — `supabase.auth.*` for sign in/up, password reset, sessions.
2. **Direct table reads** — RLS-scoped `SELECT` on `app_users`, `user_location_links`, `audit_log` (agents). Used by `AuthProvider` and the Settings pages.
3. **Edge functions** — `supabase.functions.invoke(...)` for everything else: the GHL proxy, search, saved views, drive time, invites.

The frontend never writes directly to `ghl_tokens`, `audit_log`, `note_index`, or `drive_time_cache` — those are edge-function-only.

---

## 3. Authentication

Supabase Auth, email/password (magic link optional). Session JWT is attached automatically to every `functions.invoke` and direct table call by the Supabase client.

### 3.1 `AuthProvider`

`AuthProvider` is the single owner of session state.

```
on mount:
  session = supabase.auth.getSession()
  if session:
    appUser   = SELECT * FROM app_users WHERE id = session.user.id
    links     = SELECT * FROM user_location_links WHERE app_user_id = appUser.id
    expose { user, appUser, role, ghlLocationId, permissionTemplate, isRevoked }
  subscribe: supabase.auth.onAuthStateChange -> re-derive on change
```

It exposes `useAuth()`. If `isRevoked` (the assistant's link row has `revoked_at` set), the app signs the user out and routes to `/sign-in`.

### 3.2 Auth operations by page

| Page | Operation |
|---|---|
| `/sign-in` | `supabase.auth.signInWithPassword({ email, password })` |
| `/sign-up` | `supabase.auth.signUp(...)` -> creates `app_users` row, `role = 'agent'` -> route to `/connect-ghl` |
| `/forgot-password` | `supabase.auth.resetPasswordForEmail(email, { redirectTo })` |
| `/connect-ghl` | Redirect to GHL OAuth with `state = <supabase user id>`; on return read `?status=success|error` |
| `/accept-invite` | User signs in via the invite link, then frontend calls the `accept-invite` edge function with the token |

The `app_users` row for an agent is created at sign-up; for an assistant it is created by the `accept-invite` edge function.

---

## 4. Database schema (`public`)

Supabase Postgres holds **app metadata only**. No contacts, opportunities, properties, offers, tasks, notes, or appointments — those live in GHL. The `note_index` table is a search **cache**, explicitly not a source of truth.

### 4.1 Enums

| Enum | Values |
|---|---|
| `app_user_role` | `agent`, `assistant` |
| `theme_pref` | `light`, `dark`, `system` |
| `density_pref` | `comfortable`, `compact` |

### 4.2 Tables

**`app_users`** — profile mirror of `auth.users`.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | = `auth.users.id` |
| `email` | text unique | |
| `full_name` | text | nullable |
| `avatar_url` | text | nullable; Supabase Storage path |
| `role` | `app_user_role` | `agent` or `assistant` |
| `phone` | text | nullable |
| `ghl_user_id` | text | nullable; GHL platform user ID |
| `ghl_location_id` | text | nullable; primary GHL location |
| `theme_pref` | `theme_pref` | default `system` |
| `density_pref` | `density_pref` | default `comfortable` |
| `created_at` / `updated_at` | timestamptz | |

**`user_location_links`** — links an app user to a GHL location, with permission template + revocation.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `app_user_id` | uuid FK | -> `app_users.id` |
| `ghl_location_id` | text | |
| `ghl_user_id` | text | nullable (GHL user creation is best-effort) |
| `is_primary` | boolean | default `false`; `true` for the agent |
| `permission_template` | text | `read_only` \| `leads_calendar` \| `full_except_settings` (default) \| `custom` |
| `revoked_at` | timestamptz | nullable; set when the agent revokes an assistant |
| `created_at` / `updated_at` | timestamptz | |

Unique on `(app_user_id, ghl_location_id)`.

**`ghl_tokens`** — GHL OAuth tokens per location. Encrypted at rest via a Vault-backed DB trigger. **Never readable by the frontend** — edge functions only, via the `get_decrypted_ghl_token` RPC.

**`audit_log`** — append-only log of every GHL call and permission denial made through the proxy. Columns: `id`, `app_user_id`, `ghl_location_id`, `ghl_user_id`, `action`, `target_id`, `method`, `path`, `status_code`, `created_at`. Secrets are sanitized to `[REDACTED]` before insertion. Frontend reads it (agents) for the Integration Test Log; never writes it.

**`invites`** — short-lived assistant invite tokens. Columns: `id`, `token` (uuid, used in the invite link), `invited_email`, `invited_by_user_id`, `role` (`assistant` only), `expires_at` (default `now() + 7 days`), `accepted_at`, `created_at`.

**`assistant_permission_templates`** — method/path-prefix rules per permission template. Used by `ghl-proxy` to evaluate assistant requests. Columns: `id`, `template`, `method`, `path_prefix`.

**`assistant_permission_allowlist`** — a static method/path allowlist applied to all assistants. Columns: `id`, `method`, `path_prefix`, `created_at`.

**`drive_time_cache`** — cached drive-time lookups. Columns include `origin_hash`, `dest_hash`, `bucket_ts`, `seconds`, `distance_meters`, `provider`. Read/written by the `drive-time` edge function only.

**`saved_views`** — custom + system filtered views for list pages. Columns: `id`, `app_user_id`, `scope` (`leads` \| `clients` \| `properties` \| `offers` \| `tasks` \| `contacts`), `name`, `filter_json` (jsonb), `is_pinned`, `is_system`, `created_at`, `updated_at`. System views cannot be edited or deleted by users.

**`documents`** — metadata for files uploaded to Supabase Storage and attached to a CRM entity. Columns: `id`, `app_user_id`, `ghl_location_id`, `entity_type` (`property` \| `client` \| `offer`), `entity_id` (the GHL object ID), `storage_path`, `filename`, `mime_type`, `size_bytes`, `uploaded_at`, `deleted_at` (soft delete).

**`note_index`** — full-text search index for GHL notes. A **cache only**. Columns: `id`, `ghl_note_id` (unique), `ghl_location_id`, `ghl_contact_id`, `title`, `body`, `tsv` (tsvector, GIN-indexed, auto-maintained), `created_at`, `updated_at`. Populated by the `ghl-webhook-notes` edge function; queried via the `search_notes_index` RPC.

### 4.3 RPCs

| RPC | Purpose | Caller |
|---|---|---|
| `get_decrypted_ghl_token(p_location_id)` | Returns decrypted `{ access_token, refresh_token }` | Edge functions (service role) |
| `current_app_user()` | The `app_users` row for the current JWT | Edge functions / frontend |
| `current_primary_location()` | Primary GHL location ID for the current user | Edge functions / frontend |
| `lookup_invite(p_token)` | Invite row for a token | `accept-invite` |
| `search_notes_index(search_query, max_results)` | Ranked full-text note search | `search-notes`, `global-search` |

### 4.4 RLS — what the frontend can see

All tables have RLS enabled. The frontend uses the anon key, so it only ever sees what RLS permits:

- `app_users` — a user reads/updates their own row; an agent additionally reads all users in their location.
- `user_location_links` — a user reads their own links; an agent reads all links for their primary location.
- `ghl_tokens` — **no frontend access at all.**
- `invites` — agents insert/select/update invites for their location; assistants have no access.
- `audit_log` — agents select all rows for their location; assistants select only their own; no frontend writes.
- `saved_views`, `documents` — a user reads/writes their own rows.
- `note_index`, `drive_time_cache` — effectively edge-function-only from the app's perspective.

Edge functions use the service role key and bypass RLS deliberately.

---

## 5. Edge functions

16 functions, all Deno, all with `verify_jwt: false` (JWT is validated **inside** each function). The frontend calls them with `supabase.functions.invoke(name, { body })`, which attaches the session JWT automatically.

### 5.1 The one that matters most — `ghl-proxy`

The central API gateway. **Every GHL call goes through it.** See `API.md` for the full client contract.

- **Method:** POST. **Auth:** any authenticated user (agent or non-revoked assistant).
- **Body:** `{ method, path, body? }` — where `method`/`path` describe the GHL request.
- **Flow:** verify JWT -> load `app_users` -> resolve location from `user_location_links` -> if assistant, evaluate `permission_template` against `assistant_permission_templates` (deny -> `403` + audit) -> decrypt GHL token -> call GHL (`fetchGhl`), retry once on `401` after `ghl-token-refresh` -> write `audit_log` -> return GHL response verbatim.
- **Errors:** `401` invalid JWT · `403` no location / revoked / permission denied · `5xx` GHL or internal failure.
- `ghl-proxy-final` is a stable-tagged deployment of the same function.

### 5.2 Full function index

| Slug | Auth | Purpose | Frontend uses it for |
|---|---|---|---|
| `ghl-proxy` | Any user | Proxy all GHL API calls | All CRM data — see `API.md` |
| `ghl-oauth-callback` | None (OAuth redirect) | Exchange GHL OAuth code for tokens | `/connect-ghl` (browser is redirected here) |
| `ghl-token-refresh` | Internal | Refresh GHL access tokens | Not called directly by the frontend |
| `invite-assistant` | Agent only | Send an assistant invite email | Settings -> Team -> Invite Assistant |
| `accept-invite` | Authenticated invitee | Provision the assistant account | `/accept-invite` page |
| `revoke-assistant` | Agent only | Revoke an assistant's access | Settings -> Team -> Revoke |
| `update-assistant-template` | Agent only | Change an assistant's permission template | Settings -> Team -> Edit Permissions |
| `global-search` | Any user | Search contacts, properties, offers, notes | Top-bar search / command palette |
| `drive-time` | Any user | Compute/cache drive time between addresses | `DriveTimePill` on Calendar / Dashboard |
| `list-saved-views` | Any user | List saved views for a scope | `SavedViewDropdown` |
| `upsert-saved-view` | Any user | Create/update a saved view | "Save current as..." |
| `delete-saved-view` | Any user | Delete a saved view | Saved view management |
| `ghl-webhook-notes` | None (GHL webhook) | Maintain `note_index` | Not called by the frontend |
| `search-notes` | Any user | Full-text note search | Notes page search |
| `ghl-proxy-final` | Any user | Stable `ghl-proxy` deployment | Alternate proxy target |
| `update-assistant-template-final` | Agent only | Stable `update-assistant-template` | Alternate target |

### 5.3 Function request shapes the frontend needs

```
invite-assistant         POST { email }
accept-invite            POST { token }
revoke-assistant         POST { assistant_user_id }
update-assistant-template POST { assistant_user_id, template }
global-search            POST { query, limit }
drive-time               POST { origin, destination }
list-saved-views         GET  ?scope=leads
upsert-saved-view        POST { id?, scope, name, filter_json, is_pinned }
delete-saved-view        DELETE { id }
search-notes             POST { query, limit }
```

`accept-invite` returns `404` (not found), `410` (expired/used), `403` (email mismatch). `invite-assistant` returns `409` if a pending invite already exists. Surface these as inline form errors.

### 5.4 CORS

All functions allow `*` origin and respond `200 ok` to `OPTIONS` preflight. The Supabase client handles this transparently.

---

## 6. Key flows through Supabase

### 6.1 GHL OAuth connect (agent onboarding)

```
1. Agent on /connect-ghl clicks "Connect GHL"
2. Browser -> GHL OAuth consent, state = <supabase user id>
3. GHL redirects -> ghl-oauth-callback edge function
4. Function exchanges code for tokens, upserts ghl_tokens (trigger encrypts),
   links the user in user_location_links with is_primary = true
5. Redirect -> APP_BASE_URL/connect-ghl?status=success
6. Frontend reads ?status, shows success, routes to /dashboard
```

### 6.2 Assistant invite & accept

```
1. Agent: Settings -> Team -> Invite Assistant (email + template)
2. Frontend invokes invite-assistant -> inserts invites row,
   generates a magic/invite link, emails it
3. Assistant clicks the link -> lands on /accept-invite?token=...
   (the link also establishes a Supabase session)
4. Frontend invokes accept-invite { token }
   -> validates token, creates app_users (role assistant),
      links user_location_links, best-effort-creates the GHL user
5. Assistant is in, scoped by their permission template
```

### 6.3 Assistant revoke

```
Agent: Settings -> Team -> Revoke
  -> invoke revoke-assistant { assistant_user_id }
  -> sets user_location_links.revoked_at = now()
  -> assistant's next ghl-proxy call returns 403 assistant_access_revoked
  -> frontend signs them out
```

Revocation is immediate — JWT is verified and the revocation checked on every edge-function call.

---

## 7. Storage

The `documents` table references Supabase Storage paths. Storage buckets are not yet provisioned in the project. The Documents tabs on Property / Client / Offer detail pages should:

- Read document **metadata** from the `documents` table (RLS-scoped).
- Treat actual upload/download as available once a bucket exists; until then, render the documents list from metadata and gate upload behind a graceful "storage not yet configured" empty state rather than crashing.

Avatar and business-logo uploads (Settings) follow the same pattern — wire the UI to Supabase Storage, degrade gracefully if the bucket is absent.

---

## 8. Permission templates (assistant scoping)

An assistant's `user_location_links.permission_template` decides what `ghl-proxy` lets through:

| Template | Scope |
|---|---|
| `read_only` | GET requests to safe endpoints only |
| `leads_calendar` | Read + create on contacts (leads) and calendar/appointments |
| `full_except_settings` | Full CRM access except settings endpoints (default for new assistants) |
| `custom` | Bespoke rules in `assistant_permission_templates` with `template = 'custom'` |

The frontend mirrors this with `PermissionProvider.can(action)` so it can hide controls the template would reject — but the proxy is the real gate. If a `403` slips through, roll back and toast.

---

## 9. What the frontend must NOT do

- Must not read or write `ghl_tokens`.
- Must not write `audit_log`, `note_index`, or `drive_time_cache`.
- Must not call GHL directly — only `ghl-proxy`.
- Must not embed the service role key, GHL client secret, or any secret.
- Must not mirror CRM data into Supabase tables — GHL stays the source of truth.
- Must not modify the edge functions or database schema — the backend is fixed.

---

*Companion docs: `PROJECT.md`, `ARCHITECTURE.md`, `API.md`, `UI_MAP.md`, `COMPONENTS.md`, `DESIGN.md`.*