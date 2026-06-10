# PROMPTS.md — RC CRM Build Prompts

**A sequenced set of prompts to drive the complete RC CRM build with Vibe AI Build.** Paste them into Vibe AI one at a time, in order. Each prompt names the reference docs and the `TASKS.md` section it covers.

## How to use this file

1. **Run Prompt 1.** It initializes the project and creates the empty `docs/` reference files.
2. **Fill the docs.** After Prompt 1 finishes, open each file in `docs/` and paste in the corresponding content (`PRD.md`, `PROJECT.md`, `DESIGN.md`, `ARCHITECTURE.md`, `Supabase.md`, `UI_MAP.md`, `COMPONENTS.md`, `API.md`). Do not skip this — every later prompt depends on these docs existing in the repo.
3. **Run Prompts 2 onward**, in order. Wait for each to finish before starting the next. Verify the result against the matching `TASKS.md` checklist before moving on.

**Reference docs that live in `docs/`:** `PRD.md`, `PROJECT.md`, `DESIGN.md`, `ARCHITECTURE.md`, `Supabase.md`, `UI_MAP.md`, `COMPONENTS.md`, `API.md` — plus `TASKS.md` and this `PROMPTS.md`.

**Standing rules** (already in the docs, repeated so Vibe AI keeps them every prompt): frontend only; no direct GoHighLevel calls — everything goes through the `ghlProxy` wrapper; only `VITE_`-prefixed public env vars; semantic color tokens only, never raw colors; mobile-first; permission-gated controls are hidden, not disabled; skeleton loaders, not spinners; every list/tab/widget has a designed empty state.

---

## Prompt 1 — Project initialization & doc scaffolding

*Covers `TASKS.md` §1.1. No prior docs needed.*

```
Start a new project: RC CRM — a mobile-first real estate CRM web app.

Initialize a React 18 + Vite + TypeScript (strict) project with Tailwind CSS
and tailwindcss-animate.

Create this exact folder structure under src/:
  lib/        lib/ghl/        providers/        hooks/
  components/ components/ui/  components/layout/ components/shared/
  components/shared/forms/    components/auth/   components/dashboard/
  components/leads/ components/contacts/ components/clients/
  components/properties/ components/offers/ components/calendar/
  components/tasks/ components/notes/  components/settings/
  pages/      pages/auth/      types/

Create src/lib/utils.ts exporting a cn() helper.
Add a .env.example with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, and
type them in src/vite-env.d.ts.
Set personalized metadata in index.html (title "RC CRM", description,
theme-color, favicon, lang="en").

Then create a docs/ folder at the project root and create these eight files,
each EMPTY except for a single H1 title line as a placeholder. Do not write
any other content into them — I will paste the content myself after this step:
  docs/PRD.md            -> "# PRD — RC CRM"
  docs/PROJECT.md        -> "# PROJECT — RC CRM"
  docs/DESIGN.md         -> "# DESIGN — RC CRM"
  docs/ARCHITECTURE.md   -> "# ARCHITECTURE — RC CRM"
  docs/Supabase.md       -> "# Supabase — RC CRM"
  docs/UI_MAP.md         -> "# UI_MAP — RC CRM"
  docs/COMPONENTS.md     -> "# COMPONENTS — RC CRM"
  docs/API.md            -> "# API — RC CRM"

Also create docs/TASKS.md and docs/PROMPTS.md as empty files with just their
H1 title line.

Do NOT build any features, pages, or styling yet. Stop after the project
skeleton and the empty docs files exist. Confirm the structure when done.
```

**After this prompt:** open every file in `docs/` and paste in its real content. Then continue.

---

## Prompt 2 — Design token system & Tailwind config

*Covers `TASKS.md` §1.2. Read: `docs/DESIGN.md`.*

```
Read docs/DESIGN.md fully before starting.

Implement the complete design token system from docs/DESIGN.md §2–3:

1. src/index.css — define every CSS variable for light mode (surfaces, ink,
   brand, semantic colors with -foreground pairs and -soft variants, radius
   tokens, elevation shadows). Then add a .dark block overriding every token
   for dark mode (dark elevation uses borders, not shadows).
2. Load Inter and JetBrains Mono from Google Fonts.
3. tailwind.config.ts — map every token: theme.extend.colors (all semantic
   tokens + -foreground pairs + soft variants), borderRadius (sm/DEFAULT/lg),
   fontFamily (sans = Inter, mono = JetBrains Mono), boxShadow (1 and 2),
   darkMode: 'class'. Register tailwindcss-animate.
4. Add the .tnum tabular-numeral helper and the stage-dot and
   image-placeholder utility classes.

No raw colors anywhere. Stop after the token system is in place.
```

---

## Prompt 3 — Foundation: Supabase, data layer & providers

*Covers `TASKS.md` §1.4. Read: `docs/ARCHITECTURE.md`, `docs/Supabase.md`, `docs/API.md`.*

```
Read docs/ARCHITECTURE.md, docs/Supabase.md, and docs/API.md before starting.

Build the data layer and providers (TASKS.md §1.4):

lib/
  supabase.ts      — Supabase client singleton (persistSession, autoRefresh,
                     detectSessionInUrl) from the VITE_ env vars.
  queryClient.ts   — TanStack Query client: staleTime 60s, retry 1, and never
                     retry on 401/403.
  queryKeys.ts     — the query-key factory exactly as in API.md §5.1.
  ghlProxy.ts      — authenticated wrapper over the ghl-proxy edge function;
                     typed ProxyError mapping per API.md §2.
  edgeFunctions.ts — typed clients for the non-proxy edge functions per
                     API.md §3.
  format.ts        — money(), shortMoney(), relativeDate(), countdown().
  ghl/             — mappers: contacts.ts (incl. deriveContactRole),
                     opportunities.ts, properties.ts, offers.ts,
                     associations.ts, tasks.ts, notes.ts.

types/             — shared GHL DTO + app view-model TypeScript types.

providers/
  AuthProvider.tsx       — Supabase session + app_users profile; useAuth();
                           handles revoked assistants.
  ThemeProvider.tsx      — light/dark/system + comfortable/compact; toggles
                           the .dark class on <html>.
  PermissionProvider.tsx — useCan(action) derived from role + permission
                           template.

Mount QueryClientProvider and all three providers in main.tsx.
Stop after the foundation is wired. No UI yet.
```

---

## Prompt 4 — shadcn/ui primitives, app shell & routing

*Covers `TASKS.md` §1.3, §1.5, §1.6. Read: `docs/COMPONENTS.md`, `docs/DESIGN.md`, `docs/UI_MAP.md`.*

```
Read docs/COMPONENTS.md, docs/DESIGN.md, and docs/UI_MAP.md before starting.

Part A — install every shadcn/ui primitive listed in COMPONENTS.md §1 into
components/ui/. Confirm each uses token utilities only, no raw colors.

Part B — build the app shell (TASKS.md §1.5) in components/layout/:
  AppShell, Sidebar (desktop, collapsible), BottomTabBar (mobile 6-tab),
  TopBar, SlideOutMenu, ContextFAB, StickyActionBar, PageHeader,
  RouteErrorBoundary, AuthGuard.
Follow the mobile and desktop shells in DESIGN.md §4 and the navigation
architecture in UI_MAP.md §2.

Part C — routing (TASKS.md §1.6):
  App.tsx — createBrowserRouter with the full route table from UI_MAP.md §1.
  Lazy-load every app route component. Auth route group has no shell; app
  route group is wrapped in AuthGuard + AppShell. Add pages/NotFound.tsx and
  the mandatory catch-all "*" route, always last.

Use placeholder page components for routes not yet built — each renders a
PageHeader and an EmptyState. Stop after the shell and routing work.
```

---

## Prompt 5 — Shared component library

*Covers `TASKS.md` §1.7. Read: `docs/COMPONENTS.md`, `docs/DESIGN.md`.*

```
Read docs/COMPONENTS.md §3 and docs/DESIGN.md §5 before starting.

Build every shared component in components/shared/ (TASKS.md §1.7):
  StatCard, Money, StageDot, RoleBadge, CountdownBadge, FilterChipRow,
  ScrollableTabBar, SavedViewDropdown, EmptyState, SkeletonLoader (card /
  list-row / kanban-column / stat variants), SwipeRow, AZScrubber, Kanban +
  KanbanCard, RecordList, DetailTabs, MasterDetailLayout, ActivityTimeline,
  NextAppointmentCard, DriveTimePill, NotificationSheet, CommandPalette,
  MapView, ImagePlaceholder, ThemeToggle, DensityToggle, PermissionGate,
  ConfirmDialog, and components/shared/forms/FormField.

Each component: small and single-responsibility, variants via
class-variance-authority, semantic tokens only, skeleton + empty variants
where applicable, accessible (labels, focus rings, 44x44 targets). Build with
realistic placeholder props so each renders standalone. Stop when the library
is complete.
```

---

## Prompt 6 — Authentication & onboarding

*Covers `TASKS.md` Milestone 2. Read: `docs/UI_MAP.md` §3, `docs/Supabase.md` §3, `docs/PRD.md`.*

```
Read docs/UI_MAP.md §3, docs/Supabase.md §3, and docs/PRD.md before starting.

Build all five auth pages (TASKS.md Milestone 2) in pages/auth/ with an
AuthLayout (centered card, no app shell):
  /sign-in         — email + password, signInWithPassword -> /dashboard.
  /sign-up         — agent registration; signUp + create app_users row
                     (role 'agent') -> /connect-ghl.
  /forgot-password — resetPasswordForEmail + confirmation state.
  /connect-ghl     — "Connect GoHighLevel" button -> GHL OAuth redirect
                     (state = supabase user id); read ?status on return.
  /accept-invite   — read ?token, set-password field, call the accept-invite
                     edge function; handle 404/410/403 as inline errors.

All forms use React Hook Form + Zod. Error copy describes the situation, not
the violation. Stop after auth works end to end.
```

---

## Prompt 7 — Dashboard

*Covers `TASKS.md` Milestone 3. Read: `docs/UI_MAP.md` §4, `docs/API.md`, `docs/COMPONENTS.md`.*

```
Read docs/UI_MAP.md §4, docs/API.md, and docs/COMPONENTS.md before starting.

Build the Dashboard (TASKS.md Milestone 3):
  - useDashboard() hook aggregating contacts, opportunities, calendar events,
    and per-contact tasks (all via ghlProxy).
  - components/dashboard/: GreetingHeader, NextAppointmentCard hero, StatCard
    row (Active Leads, Active Deals, Pipeline Value, Closed MTD),
    AttentionWidget, NewLeadsList, PendingOffersList, PipelineChart (recharts),
    GciProgress, ActivityTimeline, FocusModeToggle.
  - Mobile single-column layout; desktop three-column grid with Focus mode.
  - Skeletons and empty states for every widget.

Stop after the Dashboard renders on mobile and desktop, light and dark.
```

---

## Prompt 8 — Leads (list, kanban & detail)

*Covers `TASKS.md` Milestone 4. Read: `docs/UI_MAP.md` §5, `docs/API.md` §6.1–6.2, `docs/COMPONENTS.md`.*

```
Read docs/UI_MAP.md §5, docs/API.md §6.1–6.2, and docs/COMPONENTS.md before
starting.

Build the Leads feature (TASKS.md Milestone 4):
  Hooks: useLeads, useLead, useCreateLead, useUpdateLead, useConvertToClient,
  useUpdateOpportunityStage (optimistic).

  /leads — List/Kanban view toggle. LeadCard (role-aware, 4-field cap).
  7-stage Lead Nurture kanban (vertical mobile, horizontal desktop, collapsible
  lanes, lane header = dot + name + count + money sum). FilterChipRow
  (Hot/Warm/Cold/Buyer/Seller/Both/Investor/Renter). Sort by date added / last
  contact / name / lead score. SavedViewDropdown. SwipeRow actions. ContextFAB
  with AddLeadDrawer.

  /leads/:leadId — role-aware detail. 7 tabs (Details, Tasks, Notes,
  Appointments, Opportunities, Properties, Offers). Mobile StickyActionBar
  (Call/Text/Add Note/Convert to Client). Desktop three-panel master-detail.
  ConvertToClientModal. Skeleton + not-found + empty-tab states.

Stop after Leads list, kanban, and detail all work.
```

---

## Prompt 9 — Contacts (directory & detail)

*Covers `TASKS.md` §5.1–5.2. Read: `docs/UI_MAP.md` §6, `docs/API.md` §6.1, `docs/COMPONENTS.md`.*

```
Read docs/UI_MAP.md §6, docs/API.md §6.1, and docs/COMPONENTS.md before
starting.

Build the Contacts feature (TASKS.md §5.1–5.2):
  Hooks: useContacts, useContact, useCreateContact, useUpdateContact.

  /contacts — master directory. ContactCard (role-aware). Mobile: role
  FilterChipRow (All/Leads/Clients/Past Clients/Vendors/SOI/Other),
  alphabetical list, right-edge AZScrubber. Desktop: MasterDetailLayout with a
  lazy-loaded preview pane. Sort: alphabetical / recently added / last
  interaction. AddContactModal (bare GHL contact, no pipeline).

  /contacts/:contactId — role-aware detail. ContactDetailHeader (Call/Text/
  Email/Add Task). 7 tabs. ContactDetailSections (Lead Info / Engagement / SOI
  / Vendor Info shown per role). EditContactDrawer. Role-driven tab/section
  hiding — a vendor never sees Opportunities/Properties.

Stop after Contacts directory and detail work.
```

---

## Prompt 10 — Clients (list, kanban & detail)

*Covers `TASKS.md` §5.3–5.4. Read: `docs/UI_MAP.md` §7, `docs/API.md` §6.2, `docs/COMPONENTS.md`.*

```
Read docs/UI_MAP.md §7, docs/API.md §6.2, and docs/COMPONENTS.md before
starting.

Build the Clients feature (TASKS.md §5.3–5.4):
  Hooks: useClients, useClient (reuse useUpdateOpportunityStage).

  /clients — ClientCard. ClientKanban with a PipelineToggle (Buyer Transaction
  <-> Seller Transaction). Mobile: vertical kanban. Desktop: horizontal kanban
  OR table view (Stage/Client/DOM/Active Offers/Value). SavedViewDropdown,
  filters, sort. ConvertToClientModal (shared with Leads).

  /clients/:clientId — ClientProgressBar (transaction steps, always visible).
  Buyer panel (Search Requirements, Associated Properties, Offers Made,
  pre-approval). Seller panel (DOM, Showings, Listed Property, Incoming Offers).
  Both = panels stacked on mobile / side-by-side on wide desktop. Shared tabs:
  Opportunities, Tasks, Notes, Appointments, Documents (graceful empty state if
  no storage bucket). Mobile StickyActionBar (Call/Text/Add Note/Add
  Appointment). Desktop two-pane master-detail.

Stop after Clients list, kanban, and detail work.
```

---

## Prompt 11 — Properties (list, kanban, map & detail)

*Covers `TASKS.md` §6.1–6.2. Read: `docs/UI_MAP.md` §8, `docs/API.md` §6.3 & §6.8, `docs/COMPONENTS.md`.*

```
Read docs/UI_MAP.md §8, docs/API.md §6.3 and §6.8, and docs/COMPONENTS.md
before starting.

Build the Properties feature (TASKS.md §6.1–6.2):
  Hooks: useProperties, useProperty, useCreateProperty, useUpdateProperty.

  /properties — three-view toggle: List / Kanban / Map. PropertyCard.
  PropertyKanban (4-stage property pipeline, vertical mobile / horizontal
  desktop). PropertyMapView (stage-colored pins, clustering, pin mini-card ->
  detail; use the map-placeholder treatment). Filters: stage / price range /
  beds-baths / property type. Sort: price / date added / DOM. AddPropertyModal
  (creates custom_objects.properties record + owner-contact association).

  /properties/:propertyId — PropertyHeroCarousel (price, MLS, beds/baths/sqft,
  address). 7 tabs (Overview, Contacts, Tasks, Notes, Appointments,
  Opportunities, Offers). Offers tab = OfferComparisonTable (sticky row
  headers; horizontally scrollable on mobile, full table on desktop).
  Tasks/Notes resolve the linked contact via Associations first. Mobile
  StickyActionBar (Share/Add Showing/Add Offer/Add Note). Desktop two-pane.

Stop after Properties list, kanban, map, and detail work.
```

---

## Prompt 12 — Offers (list & detail)

*Covers `TASKS.md` §6.3–6.4. Read: `docs/UI_MAP.md` §9, `docs/API.md` §6.4 & §6.8, `docs/COMPONENTS.md`.*

```
Read docs/UI_MAP.md §9, docs/API.md §6.4 and §6.8, and docs/COMPONENTS.md
before starting.

Build the Offers feature (TASKS.md §6.3–6.4):
  Hooks: useOffers, useOffer, useCreateOffer, useUpdateOffer,
  useUpdateOfferStatus (optimistic).

  /offers — OfferCard (price, CountdownBadge, status, buyer/seller avatar).
  Group-by toggle (Property / Client / Status). OfferAccordionGroup with
  per-group counts. Pinned "Active negotiations" section at the top. SwipeRow
  Update Status. Desktop: OfferTable with bulk-select for bulk PDF/email,
  accordion-view toggle. Select 2+ offers on the same property ->
  OfferComparisonColumns side-by-side. AddOfferDrawer (creates real_estate_offer
  record + property/contact associations).

  /offers/:recordId — OfferKeyGrid (2x2 key values on mobile). 6 tabs (Details,
  Tasks, Notes, Appointments, Documents, Opportunity). NegotiationTimeline
  (counters/revisions/acceptances + amount sparkline). Mobile StickyActionBar
  (Share PDF/Log Event/Add Task/Update Status). Desktop two-pane.

Stop after Offers list and detail work.
```

---

## Prompt 13 — Calendar

*Covers `TASKS.md` §7.1. Read: `docs/UI_MAP.md` §10, `docs/API.md` §6.5, `docs/COMPONENTS.md`.*

```
Read docs/UI_MAP.md §10, docs/API.md §6.5, and docs/COMPONENTS.md before
starting.

Build the Calendar (TASKS.md §7.1):
  Hooks: useCalendarEvents, useCreateAppointment, useUpdateAppointment,
  useDriveTime.

  /calendar — view toggle Agenda / Day / Week / Month. AgendaView (mobile
  default, infinite scroll, DriveTimePill between events). DayView (swipe
  left/right to change day). WeekView (desktop default). MonthView.
  CalendarEventBlock; unified timeline combining appointments and tasks.
  ConflictBanner on desktop (overlap detection + one-click Reschedule).
  TaskDropTarget on desktop (drag a task onto a slot). AddAppointmentDrawer
  (GHL calendar event linked to a contact). EventDetailSheet (details, linked
  contact, meeting notes, reschedule/cancel).

  Constraint: GET /calendars/events requires calendarId/userId/groupId plus
  startTime + endTime; never send contactId as a filter.

Stop after the Calendar works in all four views.
```

---

## Prompt 14 — Tasks

*Covers `TASKS.md` §7.2. Read: `docs/UI_MAP.md` §11, `docs/API.md` §6.6, `docs/COMPONENTS.md`.*

```
Read docs/UI_MAP.md §11, docs/API.md §6.6, and docs/COMPONENTS.md before
starting.

Build the Tasks page (TASKS.md §7.2):
  Hooks: useTasksFor aggregation, useCreateTask, useUpdateTask, useCompleteTask
  (optimistic).

  /tasks — TaskRow with SwipeRow (right = Complete, left = Reschedule/Delete).
  TaskFilterTabs (All/Today/Overdue/Upcoming/Completed; mobile default =
  Today+Overdue merged). Grouping by contact / due date / status. Mobile
  quick-add FAB (title only; pre-links contact on a contact-detail page).
  Desktop three-pane (filters + saved views / task list / TaskInlineEditor)
  with a TaskSchedulerMiniCalendar and a bulk-editable table-view toggle.
  AddTaskDrawer.

  Constraint: tasks are sub-resources of a contact (/contacts/{id}/tasks);
  aggregate client-side; non-contact records resolve the linked contact first.

Stop after the Tasks page works on mobile and desktop.
```

---

## Prompt 15 — Notes

*Covers `TASKS.md` §7.3. Read: `docs/UI_MAP.md` §12, `docs/API.md` §6.6 & §8, `docs/Supabase.md` §5.*

```
Read docs/UI_MAP.md §12, docs/API.md §6.6 and §8, and docs/Supabase.md §5
before starting.

Build the Notes feature (TASKS.md §7.3):
  Hooks: useNotesFor, useNote, useCreateNote, useUpdateNote, useDeleteNote.

  /notes — NoteGrid / NoteListItem view toggle. Search via the search-notes
  edge function (full-text index). NoteColorFilter; sort by date / by contact.

  /notes/new and /notes/:noteId — RichTextEditor + NoteEditorToolbar. Delete
  confirmation via ConfirmDialog.

Stop after the Notes list, editor, and search work.
```

---

## Prompt 16 — Settings

*Covers `TASKS.md` §7.4. Read: `docs/UI_MAP.md` §13, `docs/Supabase.md`, `docs/API.md`.*

```
Read docs/UI_MAP.md §13, docs/Supabase.md, and docs/API.md before starting.

Build the Settings area (TASKS.md §7.4):
  Hooks: useTeam, useInviteAssistant, useRevokeAssistant, useUpdateTemplate,
  useAuditLog.

  /settings — nested sections:
    ProfileSection (all users) — AvatarUpload, name, email, phone, password.
    BusinessDetailsSection (agent only) — LogoUpload, address, contact info,
      social links.
    TeamSection (agent only) — assistant list, AssistantRow with Edit
      Permissions / Revoke, InviteAssistantDialog.
    IntegrationSection (agent only) — connection status, sub-account ID,
      connected GHL user, token health, Reconnect.
    AboutSection (all users) — app version, release channel.
  /settings/integration/log (agent only) — IntegrationTestLogTable reading
    audit_log via useAuditLog.

  Permission-gate the sections — assistants see only Profile and About.

Stop after Settings works for both agent and assistant roles.
```

---

## Prompt 17 — Cross-cutting QA & polish pass

*Covers `TASKS.md` Milestone 8. Read: all docs.*

```
Run a full QA and polish pass over the entire app (TASKS.md Milestone 8).

States — confirm every data-fetched section has a layout-matched skeleton,
every list/tab/widget has a designed empty state, every page has an error
state with Retry, and every detail route has a not-found state.

Permissions — confirm every assistant-restricted control is hidden (not
disabled) via PermissionGate, 403s roll back optimistic updates with a
friendly toast, and the revoked-assistant flow signs the user out.

Theme & responsive — verify every route in light and dark mode and at 393px
mobile and 1440px desktop. Kanban vertical on mobile, horizontal on desktop
everywhere. Density toggle works.

Motion & accessibility — motion values match DESIGN.md §7 and respect
prefers-reduced-motion; touch targets >= 44x44; list rows >= 64pt; icon-only
buttons have labels; status color is paired with text/icon; focus rings
visible on keyboard focus.

Data & build — no raw color classes anywhere; no direct GHL calls (everything
through ghlProxy); only VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY in the
bundle; no localStorage/sessionStorage for CRM data; routes lazy-loaded;
npm run build produces a clean dist/ with zero type errors.

End-to-end — verify: (1) Dashboard -> next appointment -> Property Detail ->
Add Offer -> compare with a second offer; (2) sign up -> connect GHL ->
dashboard; (3) invite assistant -> accept invite -> scoped access.

Fix everything that fails. Conclude with a summary of what was checked and
suggest any follow-up features.
```

---

## Prompt sequence at a glance

| # | Prompt | TASKS.md | Key docs |
|---|---|---|---|
| 1 | Init & doc scaffolding | §1.1 | — |
| 2 | Design tokens & Tailwind | §1.2 | DESIGN |
| 3 | Foundation: Supabase, data layer, providers | §1.4 | ARCHITECTURE, Supabase, API |
| 4 | shadcn primitives, app shell, routing | §1.3, §1.5, §1.6 | COMPONENTS, DESIGN, UI_MAP |
| 5 | Shared component library | §1.7 | COMPONENTS, DESIGN |
| 6 | Authentication & onboarding | Milestone 2 | UI_MAP, Supabase, PRD |
| 7 | Dashboard | Milestone 3 | UI_MAP, API, COMPONENTS |
| 8 | Leads | Milestone 4 | UI_MAP, API, COMPONENTS |
| 9 | Contacts | §5.1–5.2 | UI_MAP, API, COMPONENTS |
| 10 | Clients | §5.3–5.4 | UI_MAP, API, COMPONENTS |
| 11 | Properties | §6.1–6.2 | UI_MAP, API, COMPONENTS |
| 12 | Offers | §6.3–6.4 | UI_MAP, API, COMPONENTS |
| 13 | Calendar | §7.1 | UI_MAP, API, COMPONENTS |
| 14 | Tasks | §7.2 | UI_MAP, API, COMPONENTS |
| 15 | Notes | §7.3 | UI_MAP, API, Supabase |
| 16 | Settings | §7.4 | UI_MAP, Supabase, API |
| 17 | QA & polish | Milestone 8 | all |

---

*Pairs with `TASKS.md`. Companion docs: `PRD.md`, `PROJECT.md`, `ARCHITECTURE.md`, `Supabase.md`, `API.md`, `DESIGN.md`, `UI_MAP.md`, `COMPONENTS.md`.*