# API.md — RC CRM

**The data layer: how the React frontend talks to Supabase Edge Functions and, through them, to GoHighLevel. Covers the `ghlProxy` contract, edge-function clients, TanStack Query hooks, query keys, and every GHL endpoint the app uses.**

Companion to `ARCHITECTURE.md` and `Supabase.md`.

---

## 1. The two transports

The frontend has exactly two ways to reach data, both via the Supabase client:

1. **`ghlProxy`** — a thin wrapper over the `ghl-proxy` edge function. This is how all CRM data (contacts, opportunities, properties, offers, tasks, notes, appointments) is read and written.
2. **`edgeFunctions`** — thin clients over the non-proxy edge functions (search, saved views, drive time, invites).

Plus direct RLS-scoped Supabase table reads for app metadata (`app_users`, `user_location_links`, `audit_log`) — used only by `AuthProvider` and Settings.

**There is no third way.** No file calls `fetch('https://services.leadconnectorhq.com/...')`. No file calls GHL directly.

---

## 2. `lib/ghlProxy.ts`

A single function that posts a GHL request descriptor to `ghl-proxy` and returns the GHL response. It does not know about contacts or offers — it is a generic transport.

```ts
type GhlMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface GhlRequest {
  method: GhlMethod;
  path: string;          // GHL API path, e.g. '/contacts/search'
  body?: unknown;        // request body for POST/PUT/PATCH
}

// Calls supabase.functions.invoke('ghl-proxy', { body: req }).
// The session JWT is attached automatically by the Supabase client.
// Throws a typed ProxyError on non-2xx (carries status + message).
export async function ghlProxy<T = unknown>(req: GhlRequest): Promise<T>;
```

**Error mapping** (see `ARCHITECTURE.md` §8):

| Proxy status | `ProxyError.kind` | Handling |
|---|---|---|
| 401 | `unauthorized` | refresh session once, else sign out |
| 403 | `forbidden` | roll back optimistic update, friendly toast |
| 404 | `not_found` | page-level not-found state |
| 409 | `conflict` | inline form error |
| 422 | `bad_request` | generic "couldn't complete that" |
| 5xx / network | `server` / `network` | error state + retry |

`ghlProxy` never retries on `401`/`403` — those are terminal. TanStack Query is configured to do the same.

---

## 3. `lib/edgeFunctions.ts`

Typed clients for the non-proxy edge functions. Each is a one-liner over `supabase.functions.invoke`.

```ts
globalSearch(query: string, limit = 5)        // POST global-search
searchNotes(query: string, limit = 20)        // POST search-notes
driveTime(origin: string, destination: string)// POST drive-time
listSavedViews(scope: SavedViewScope)          // GET  list-saved-views?scope=
upsertSavedView(view: SavedViewInput)          // POST upsert-saved-view
deleteSavedView(id: string)                    // DELETE delete-saved-view
inviteAssistant(email: string)                 // POST invite-assistant
acceptInvite(token: string)                    // POST accept-invite
revokeAssistant(assistantUserId: string)       // POST revoke-assistant
updateAssistantTemplate(assistantUserId, tpl)  // POST update-assistant-template
```

Function request/response shapes and error codes: `Supabase.md` §5.3.

---

## 4. Mappers — `lib/ghl/*`

GHL returns verbose, deeply-nested JSON. Mappers convert raw GHL DTOs into clean app **view models** the UI consumes. Components and hooks never see raw GHL shapes.

| Module | Exports |
|---|---|
| `lib/ghl/contacts.ts` | `mapContact(raw) -> Contact`, `deriveContactRole(contact) -> ContactRole` |
| `lib/ghl/opportunities.ts` | `mapOpportunity(raw) -> Opportunity`, `stageById(...)`, pipeline helpers |
| `lib/ghl/properties.ts` | `mapProperty(rawRecord) -> Property` |
| `lib/ghl/offers.ts` | `mapOffer(rawRecord) -> Offer`, `offerExpiryState(offer)` |
| `lib/ghl/associations.ts` | `resolveLinkedContact(entity)`, `resolveRelations(recordId, assocIds)` |
| `lib/ghl/tasks.ts` / `notes.ts` | `mapTask(raw)`, `mapNote(raw)` |

**Role derivation** drives the entire role-aware UI (see `DESIGN.md` §10). `deriveContactRole` reads `contact_type`, `client_status`, `buyer_seller_type`, tags, and linked opportunities to produce one of the 17 roles (`buyer_lead`, `seller_lead`, `buyer_client`, `seller_client`, `past_buyer_client`, `vendor`, `soi`, `referral_partner`, etc.).

**Custom-field handling.** GHL custom fields are referenced by ID, not key, in API responses. Mappers resolve the `contact.*` / `custom_objects.*` field keys (from the GHL data model) to their values. Dropdown/radio/multi-select values use option **keys**, not labels — mappers translate keys to display labels.

---

## 5. TanStack Query hooks

One hook module per domain, all in `src/hooks/`. Pages and components only ever use hooks — never `ghlProxy` or `edgeFunctions` directly.

### 5.1 Query-key factory — `lib/queryKeys.ts`

The single source of cache keys. No inline key arrays anywhere.

```ts
export const qk = {
  contacts: {
    all: ['contacts'] as const,
    list: (filters: ContactFilters) => ['contacts', 'list', filters] as const,
    detail: (id: string) => ['contacts', 'detail', id] as const,
  },
  leads:        { list: (f) => ['leads','list',f], detail: (id) => ['leads','detail',id] },
  clients:      { list: (f) => ['clients','list',f], detail: (id) => ['clients','detail',id] },
  properties:   { list: (f) => ['properties','list',f], detail: (id) => ['properties','detail',id] },
  offers:       { list: (f) => ['offers','list',f], detail: (id) => ['offers','detail',id] },
  tasks:        { forContact: (cid) => ['tasks','contact',cid], all: ['tasks'] },
  notes:        { forContact: (cid) => ['notes','contact',cid], detail: (id) => ['notes','detail',id] },
  calendar:     { events: (range) => ['calendar','events',range] },
  associations: { relations: (rid, aids) => ['assoc',rid,aids] },
  dashboard:    { summary: ['dashboard','summary'] },
  savedViews:   { scope: (s) => ['savedViews',s] },
  search:       { global: (q) => ['search','global',q] },
};
```

### 5.2 Hook inventory

| Hook | Returns / does |
|---|---|
| `useContacts(filters)` | Contact list, type-filtered |
| `useContact(id)` | Single contact + custom fields + tags |
| `useCreateContact()` / `useUpdateContact()` | Contact mutations |
| `useLeads(filters)` | Lead pipeline contacts + linked opportunities |
| `useLead(id)` | Single lead detail |
| `useCreateLead()` / `useUpdateLead()` / `useConvertToClient()` | Lead mutations |
| `useClients(filters)` | Client pipeline opportunities |
| `useClient(id)` | Single client + linked contact + offers |
| `useUpdateOpportunityStage()` | Optimistic kanban stage move |
| `useProperties(filters)` | Property custom-object records |
| `useProperty(id)` | Property detail + linked contacts/offers |
| `useCreateProperty()` / `useUpdateProperty()` | Property mutations |
| `useOffers(filters)` | Offer custom-object records |
| `useOffer(id)` | Offer detail + buyer/seller/property relations |
| `useCreateOffer()` / `useUpdateOffer()` / `useUpdateOfferStatus()` | Offer mutations |
| `useTasksFor(entity)` | Tasks for any entity (resolves the linked contact first) |
| `useCreateTask()` / `useUpdateTask()` / `useCompleteTask()` | Task mutations (optimistic complete) |
| `useNotesFor(entity)` | Notes for any entity (resolves the linked contact first) |
| `useNote(id)` / `useCreateNote()` / `useUpdateNote()` / `useDeleteNote()` | Note ops |
| `useCalendarEvents(range)` | Calendar events for a date range |
| `useCreateAppointment()` / `useUpdateAppointment()` | Appointment mutations |
| `useDashboard()` | Aggregated dashboard data |
| `useSavedViews(scope)` / `useUpsertSavedView()` / `useDeleteSavedView()` | Saved views |
| `useGlobalSearch(query)` | Debounced global search |
| `useDriveTime(origin, dest)` | Cached drive-time lookup |
| `useTeam()` / `useInviteAssistant()` / `useRevokeAssistant()` / `useUpdateTemplate()` | Settings -> Team |
| `useAuditLog(filters)` | Integration Test Log (agents) |

### 5.3 Mutation pattern

```
useUpdateOpportunityStage:
  onMutate:    cancel queries, snapshot cache, apply optimistic move
  mutationFn:  ghlProxy({ method:'PUT', path:`/opportunities/${id}`, body })
  onError:     restore snapshot, toast the ProxyError message
  onSuccess:   toast confirmation
  onSettled:   invalidate qk.clients.list / qk.leads.list as appropriate
```

Optimistic updates apply to: kanban stage moves, task complete, offer status change. Other mutations refetch on success without an optimistic phase.

---

## 6. GHL endpoints used (through `ghl-proxy`)

Every path below is sent as `{ method, path, body }` to `ghlProxy`. GHL API base and `Version` header are added server-side by the proxy.

### 6.1 Contacts (System object)

| Purpose | Method | Path |
|---|---|---|
| Search / list contacts | POST | `/contacts/search` |
| Get one contact | GET | `/contacts/{id}` |
| Create contact | POST | `/contacts/` |
| Update contact | PUT | `/contacts/{id}` |

`/contacts/search` body: `{ locationId, page, pageLimit, query, filters[], sort[] }`. Filters support `eq`, `not_eq`, `contains`, `not_contains`, `exists`, `not_exists`, `range`. Opportunity-nested and custom-field filters are supported (custom fields keyed `customFields.{id}`). Standard pagination caps at 10,000 records; cursor pagination (`searchAfter`) is unlimited.

### 6.2 Opportunities (System object)

| Purpose | Method | Path |
|---|---|---|
| Search opportunities | GET/POST | `/opportunities/search` |
| Update opportunity (stage, value, status) | PUT | `/opportunities/{id}` |
| Create opportunity | POST | `/opportunities/` |

Used for Leads (Lead Nurture pipeline) and Clients (Buyer / Seller Transaction pipelines). Stage moves write `pipelineStageId`.

### 6.3 Properties (Custom object `custom_objects.properties`)

| Purpose | Method | Path |
|---|---|---|
| Search properties | POST | `/objects/custom_objects.properties/records/search` |
| Get one property | GET | `/objects/custom_objects.properties/records/{id}` |
| Create property | POST | `/objects/custom_objects.properties/records` |
| Update property | PUT | `/objects/custom_objects.properties/records/{id}` |

Record search filters use `properties.{fieldName}` for built-ins and `customFields.{id}` for custom fields. **Updates of multi-value fields (owners, followers, multi-select, files) must use the `{ add, remove }` pattern**; scalar fields take direct values; `null` clears a field.

### 6.4 Offers (Custom object `custom_objects.real_estate_offer`)

| Purpose | Method | Path |
|---|---|---|
| Search offers | POST | `/objects/custom_objects.real_estate_offer/records/search` |
| Get one offer | GET | `/objects/custom_objects.real_estate_offer/records/{id}` |
| Create offer | POST | `/objects/custom_objects.real_estate_offer/records` |
| Update offer | PUT | `/objects/custom_objects.real_estate_offer/records/{id}` |

Same record-API rules as Properties.

### 6.5 Tasks (Sub-resource of Contact)

| Purpose | Method | Path |
|---|---|---|
| List tasks for a contact | GET | `/contacts/{id}/tasks` |
| Create task | POST | `/contacts/{id}/tasks` |
| Update task (complete/edit/delete) | PUT | `/contacts/{id}/tasks/{taskId}` |

There is **no standalone task endpoint.** The Tasks page aggregates tasks client-side across the relevant contacts. Detail pages for Opportunity/Property/Offer resolve the linked Contact via Associations first.

### 6.6 Notes (Sub-resource of Contact)

| Purpose | Method | Path |
|---|---|---|
| List notes for a contact | GET | `/contacts/{id}/notes` |
| Create note | POST | `/contacts/{id}/notes` |
| Update note | PUT | `/contacts/{id}/notes/{noteId}` |

Same contact-resolution rule as Tasks. Note **search** uses the `search-notes` edge function (Postgres FTS index), not GHL.

### 6.7 Calendar / Appointments

| Purpose | Method | Path |
|---|---|---|
| List events | GET | `/calendars/events` |
| Create appointment | POST | `/calendars/events` |
| Update appointment | PUT | `/calendars/events/{id}` |

`GET /calendars/events` **requires** `calendarId` / `userId` / `groupId` plus `startTime` + `endTime` (ISO-8601). **`contactId` is not a valid filter** and returns `422` — never send it.

### 6.8 Associations (Relations API)

| Purpose | Method | Path |
|---|---|---|
| Get relations for a record | POST | `/associations/relations/{recordId}` |
| Search relations | GET/POST | `/associations/relations/search` |
| Get associations by object key | GET | `/associations/objectkey/{objectKey}` |
| Create relation | POST | `/associations/relations` |

Key associations used by the app: Contact↔Opportunity (system), Contact↔Property, Contact↔Offer (buyer/seller roles), Property↔Offer, Business↔Contact. The mapper layer resolves these so pages can ask "give me the tasks for this offer" and the hook silently does relation -> contact -> tasks.

### 6.9 Users (Settings → Team)

GHL user creation for assistants happens inside the `accept-invite` edge function, not from the frontend. The frontend manages assistants only through `invite-assistant` / `revoke-assistant` / `update-assistant-template`.

---

## 7. Pipelines reference

The kanban boards read these pipelines. Render the stages the API returns rather than hardcoding.

| Pipeline | ID | Used by |
|---|---|---|
| Lead Nurture | `dcKjydejKreefHfsXQx6` | `/leads` (8 stages) |
| Buyer Transaction | `lsNchTsvghJQKPBYCS9Z` | `/clients` buyer (10 stages) |
| Seller Transaction | `F5uB4bZnB0M8YgJ86sLg` | `/clients` seller (9 stages) |

Stage colors come from GHL and are rendered as small decorative dots only — never as filled card backgrounds (see `DESIGN.md` §4).

---

## 8. Search

The top-bar search and the desktop command palette use the `global-search` edge function, which runs four parallel searches (GHL contacts, GHL properties, GHL offers, local note FTS) and returns `{ contacts, properties, offers, notes }`, each ranked and limited. Debounce input ~250ms. The Notes-page search uses `search-notes` (note index only).

---

## 9. Caching & invalidation rules

- List queries: `staleTime` 60s. Detail queries: 60s. Dashboard: 30s, refetch on focus.
- After a mutation, invalidate the narrowest set of keys that changed — e.g. updating a contact invalidates `qk.contacts.detail(id)` and `qk.contacts.list(*)`, plus `qk.leads.list(*)` if the contact is a lead.
- A stage move invalidates both the source and the affected board's list key.
- Never invalidate `['contacts']` wholesale when a single detail key would do — it causes board-wide refetch flicker.
- Search results are not persisted; they are short-lived (`staleTime` 0) and cleared when the query empties.

---

*Companion docs: `PROJECT.md`, `ARCHITECTURE.md`, `Supabase.md`, `UI_MAP.md`, `COMPONENTS.md`, `DESIGN.md`.*