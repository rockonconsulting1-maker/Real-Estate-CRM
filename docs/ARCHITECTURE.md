# ARCHITECTURE.md — RC CRM

**System architecture, data flow, folder structure, and the patterns that hold the app together.**

Companion to `PROJECT.md`. Read this before writing any code.

---

## 1. The big picture

RC CRM is a static React SPA with no backend of its own. It talks to two things: **Supabase** (auth + edge functions + a small Postgres) and — only indirectly — **GoHighLevel** (the CRM system of record).

```
┌──────────────────────────────────────────────┐
│              React SPA (this build)           │
│  React 18 · Vite · TypeScript · Tailwind       │
│  shadcn/ui · TanStack Query · React Router      │
└───────────────┬────────────────────────────────┘
                │  HTTPS + Supabase session JWT
                ▼
┌──────────────────────────────────────────────┐
│                  Supabase                      │
│  ├─ Auth          web app users, sessions       │
│  ├─ Postgres      app metadata only (no CRM)    │
│  │                RLS on every table            │
│  └─ Edge Functions (16, Deno)                   │
│       ghl-proxy ── the GHL API gateway          │
└───────────────┬────────────────────────────────┘
                │  GHL API (LeadConnector), tokens
                │  attached server-side only
                ▼
┌──────────────────────────────────────────────┐
│            GoHighLevel sub-account              │
│  System of record: Contacts, Opportunities,     │
│  Properties, Offers, Tasks, Notes, Appointments, │
│  Associations                                   │
└──────────────────────────────────────────────┘
```

Two hard rules drive the whole architecture:

1. **The frontend never touches GHL directly.** Every GHL request is a POST to the `ghl-proxy` edge function, which resolves the location, attaches the GHL token server-side, forwards the call, logs it, and returns the response.
2. **No CRM data is mirrored to Supabase.** GHL is and remains the source of truth. Supabase Postgres holds only app metadata (user profiles, location links, audit log, saved views, document metadata, a note search index, drive-time cache).

---

## 2. Where data lives

| Data | Home | Frontend reaches it via |
|---|---|---|
| Contacts, Opportunities, Properties, Offers, Tasks, Notes, Appointments, Associations | GHL sub-account | `ghlProxy` -> `ghl-proxy` edge function |
| Web app user accounts, sessions | Supabase Auth | `@supabase/supabase-js` client |
| User profile, role, theme/density prefs | Supabase `app_users` | Supabase client (RLS-scoped) |
| User -> GHL location link, permission template | Supabase `user_location_links` | Supabase client (RLS-scoped) |
| Saved list views | Supabase `saved_views` | `list/upsert/delete-saved-view` edge functions |
| Document metadata + files | Supabase `documents` + Storage | Supabase client + Storage |
| Note full-text search index | Supabase `note_index` | `search-notes` / `global-search` edge functions |
| Drive-time estimates | Supabase `drive_time_cache` | `drive-time` edge function |
| GHL OAuth tokens | Supabase `ghl_tokens` (encrypted) | **Never** — edge-function-only |
| Audit log | Supabase `audit_log` | Read-only via Supabase client (agents) |

Full schema and edge-function reference: `Supabase.md`. Full data-layer contract: `API.md`.

---

## 3. Request flow

### 3.1 A CRM read (e.g. load the leads list)

```
Leads page mounts
  -> useLeads() TanStack Query hook
  -> ghlProxy.post({ method: 'POST', path: '/contacts/search', body: {...} })
  -> fetch() POST to <SUPABASE_URL>/functions/v1/ghl-proxy
         Authorization: Bearer <supabase session JWT>
  -> ghl-proxy: verify JWT -> load app_user -> resolve location
                -> (if assistant) check permission template
                -> decrypt GHL token -> call GHL -> write audit_log
  -> GHL response returned verbatim
  -> ghlProxy maps raw GHL JSON -> app view models (lib/ghl/*)
  -> TanStack Query caches under a structured query key
  -> component renders; skeleton -> data
```

### 3.2 A CRM write (e.g. move a lead to a new stage)

```
User drags a kanban card
  -> useUpdateOpportunityStage() mutation
  -> optimistic cache update (card moves instantly)
  -> ghlProxy.post({ method: 'PUT', path: '/opportunities/:id', body: {...} })
  -> ghl-proxy validates + forwards + audits
  -> success: toast confirms, query invalidated/refetched
  -> failure: optimistic update rolled back, error toast shown
```

Mutations are optimistic where the design calls for it (kanban moves, task complete, status changes). A `403` rolls back the optimistic change and shows a friendly "you don't have permission" toast — it never leaves the UI in a false state.

### 3.3 Auth bootstrap

```
App loads -> AuthProvider
  -> supabase.auth.getSession()
  -> if session: fetch app_users row + user_location_links
  -> derive { user, role, ghlLocationId, permissionTemplate }
  -> if no session: render only the /auth/* routes
  -> supabase.auth.onAuthStateChange keeps it live
```

---

## 4. Folder structure & responsibilities

```
src/
  main.tsx          Mounts providers + RouterProvider.
  App.tsx           Route tree. Lazy route components. Catch-all NotFound.
  index.css         Design tokens — CSS variables for light + dark.

  lib/
    supabase.ts     createClient() singleton from VITE_ env vars.
    ghlProxy.ts     post(): authed call to ghl-proxy. Throws typed errors.
    edgeFunctions.ts Thin clients for the non-proxy edge functions.
    queryClient.ts  QueryClient with sane defaults (staleTime, retry).
    queryKeys.ts    Query-key factory — the single source of cache keys.
    format.ts       money(), shortMoney(), relativeDate(), countdown().
    utils.ts        cn() and small pure helpers.
    ghl/
      contacts.ts   mapContact(raw) -> Contact view model + role derivation.
      opportunities.ts  mapOpportunity(raw), stage helpers.
      properties.ts custom-object record mappers.
      offers.ts     custom-object record mappers + expiry logic.
      associations.ts  relation resolution helpers.

  providers/
    AuthProvider.tsx       Session + app_user. Exposes useAuth().
    ThemeProvider.tsx      light/dark/system + comfortable/compact.
    PermissionProvider.tsx Exposes useCan(action) from role + template.

  hooks/            One hook module per domain. Wraps TanStack Query.
  components/       See COMPONENTS.md.
  pages/            See UI_MAP.md.
  types/            Shared TS types: GHL DTOs and app view models.
```

**Layering rule:** `pages` compose `components`; `components` call `hooks`; `hooks` call `lib`; `lib` calls Supabase / `ghl-proxy`. Data never flows the other way. Pages and components never call `fetch` or the Supabase client directly — always through a hook.

---

## 5. State management

Three distinct kinds of state, three distinct tools.

| State kind | Tool | Examples |
|---|---|---|
| Server state (CRM data) | TanStack Query | contacts, opportunities, offers, tasks, calendar events |
| Global app state | React Context | auth session, theme, permission flags |
| Local UI state | `useState` / `useReducer` | drawer open, active tab, filter chips, kanban drag |

**TanStack Query configuration (`lib/queryClient.ts`):**

- `staleTime`: 60s default — CRM data does not need to refetch on every focus.
- `retry`: 1 — and never retry on `401`/`403` (auth/permission errors are terminal).
- `refetchOnWindowFocus`: false for list/detail data; true for the dashboard.
- Query keys come exclusively from `lib/queryKeys.ts`. No inline key arrays.

**No browser storage for CRM data.** No `localStorage`/`sessionStorage` for contacts, offers, etc. The only persisted state is the Supabase session (managed by the Supabase client) and theme/density preference (synced to `app_users`, mirrored to a non-CRM key for first-paint).

---

## 6. Routing strategy

- React Router DOM v6, `createBrowserRouter`.
- Two route groups:
  - **Auth routes** (`/sign-in`, `/sign-up`, `/forgot-password`, `/connect-ghl`, `/accept-invite`) — no shell, no auth guard.
  - **App routes** — wrapped in `AuthGuard` + `AppShell`. Unauthenticated access redirects to `/sign-in`.
- Route components are lazy-loaded (`React.lazy`) so each page is its own chunk — keeps the initial bundle small (Vibe AI performance rule: lazy load large routes).
- A catch-all `*` route renders `NotFound`. This is mandatory and always last.
- Detail routes are parameterized: `/leads/:leadId`, `/contacts/:contactId`, `/clients/:clientId`, `/properties/:propertyId`, `/offers/:recordId`, `/notes/:noteId`.

Full route table: `UI_MAP.md`.

---

## 7. Permission model in the frontend

Permissions are enforced at three layers. The frontend is the **third and weakest** — it is cosmetic only.

1. **GHL** — source of truth. A GHL user without `contacts.write` cannot write contacts no matter what.
2. **`ghl-proxy`** — validates the caller's role and permission template before forwarding; returns `403` if out of scope.
3. **Frontend** — hides buttons, tabs, and FAB actions the user cannot perform.

`PermissionProvider` derives a `can(action)` helper from the user's `role` and `permission_template` (`read_only`, `leads_calendar`, `full_except_settings`, `custom`). Components call `useCan()` and conditionally render. If the proxy still returns `403` (template drift, race), the mutation rolls back and a toast explains it.

The agent always has full access. Only assistants are ever gated. Permission-gated UI is **hidden, never disabled** — an assistant should not see a greyed-out padlock; they simply do not see the control.

---

## 8. Error handling

| Error | Source | Frontend behavior |
|---|---|---|
| `401` | Expired/invalid session | Refresh session once; if still failing, sign out and route to `/sign-in`. |
| `403` | Permission denied / revoked assistant | Toast: friendly permission message. Roll back optimistic updates. If `assistant_access_revoked`, sign out. |
| `404` | Record not found | Render the page-level not-found state, not a global crash. |
| `409` | Duplicate (e.g. pending invite) | Inline form error. |
| `422` | Bad GHL params | Developer-facing toast in dev; generic "couldn't complete that" in prod. |
| `5xx` | GHL or edge-function failure | Toast + a retry affordance. Query stays in `isError`; skeleton replaced by an error state with Retry. |
| Network | Offline | Toast: "You appear to be offline." TanStack Query retries on reconnect. |

Every page renders three states deliberately: **loading** (skeleton), **error** (message + retry), **empty** (designed empty state). A wrapping `ErrorBoundary` catches render-time crashes per route so one broken page never takes down the shell.

---

## 9. GHL data model — what the app touches

GHL is the system of record. The app reads and writes these object types:

| Object | GHL type | Key fields |
|---|---|---|
| Contact | System-defined | `firstName`, `lastName`, `email`, `phone`, `tags`, `customFields`, `assignedTo`, `type` |
| Opportunity | System-defined | `name`, `pipelineId`, `pipelineStageId`, `status`, `monetaryValue`, `contactId` |
| Property | Custom object `custom_objects.properties` | `mls` (required, unique), `address`, `price`, `status`, beds/baths/sqft, `images` |
| Offer | Custom object `custom_objects.real_estate_offer` | `offer_id` (required), `purchase_price`, `deposit_amount`, `expiry_date`, `closing_date`, `status` |
| Task | Sub-resource of Contact | `title`, `dueDate`, `status`, `assignedTo` |
| Note | Sub-resource of Contact | `body`, `dateAdded`, `updatedAt` |
| Appointment | Calendar event | `startTime`, `endTime`, `title`, `calendarId`, `contactId` |

**Three pipelines** drive the kanban boards:

- Lead Nurture (`dcKjydejKreefHfsXQx6`) — 8 stages, used by `/leads`.
- Buyer Transaction (`lsNchTsvghJQKPBYCS9Z`) — 10 stages, used by `/clients` (buyer).
- Seller Transaction (`F5uB4bZnB0M8YgJ86sLg`) — 9 stages, used by `/clients` (seller).

> The PRD's page specs describe simplified stage counts for some boards; the pipeline IDs and full stage lists above (from the GHL data model) are authoritative. Render whatever stages the pipeline actually returns from the API rather than hardcoding a count.

### 9.1 The Associations constraint (important)

Tasks and Notes are **sub-resources of a Contact** in GHL (`/contacts/{id}/tasks`, `/contacts/{id}/notes`). There is no standalone task or note endpoint.

Any detail page for a non-contact record (an Opportunity, Property, or Offer) that needs to show Tasks or Notes must **first resolve the linked Contact** via the Associations API, then fetch the sub-resource from that contact. This resolution is encapsulated in `lib/ghl/associations.ts` and surfaced through hooks (`useTasksFor(entity)`, `useNotesFor(entity)`) so pages never deal with it directly.

Calendar events: `GET /calendars/events` requires `calendarId` / `userId` / `groupId` plus `startTime` + `endTime` (ISO-8601). `contactId` is **not** a valid filter and returns `422`.

---

## 10. Build & deployment

- Output is a static `dist/` produced by `npm run build`.
- Deployable to any static host (Netlify, Vercel, S3). No server runtime.
- The build needs exactly two env vars at build time: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
- `index.html` carries app metadata (title, description, theme-color, favicon). Per Vibe AI guidance, set personalized metadata and semantic HTML.
- The Supabase backend (project `hnanbydtnchswrofupgd`) and its edge functions are already deployed and are out of scope for this build.

---

*Companion docs: `PROJECT.md`, `UI_MAP.md`, `COMPONENTS.md`, `API.md`, `DESIGN.md`, `Supabase.md`.*