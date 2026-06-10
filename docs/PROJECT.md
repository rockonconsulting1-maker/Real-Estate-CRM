# PROJECT.md — RC CRM

**The master project plan for building RC CRM with Vibe AI Build.**

This is the entry-point document. It defines what is being built, the rules of the build, and the milestone plan Vibe AI follows. Every other planning document (`ARCHITECTURE.md`, `UI_MAP.md`, `COMPONENTS.md`, `API.md`, `DESIGN.md`, `Supabase.md`) is a deep-dive referenced from here.

---

## 1. What we are building

RC CRM is a focused, mobile-first web application for an individual real estate agent. It is a curated CRM experience layered on top of a GoHighLevel (GHL) sub-account.

- **One web app account = one real estate agent.** Not a brokerage tool. Each installation serves exactly one agent and their personal GHL sub-account.
- **GHL is the system of record.** All CRM data — contacts, opportunities, properties, offers, tasks, notes, appointments, associations — lives in GHL.
- **Supabase is the application backbone.** It provides authentication, session management, a secure GHL API proxy, audit logging, document storage, full-text note search, drive-time caching, and saved views.
- **The frontend is a static SPA.** It is built to a `dist/` folder. It never calls GHL directly — all GHL traffic flows through the `ghl-proxy` Supabase Edge Function.

The product target: make a busy independent agent's day feel obvious, calm, and fast — on a phone between showings and on a laptop at home.

### 1.1 User roles

| Role | Description |
|---|---|
| **RE Agent** | Primary account owner. Admin of the GHL sub-account. Full access to all features and settings. |
| **Assistant** | Staff member invited by the agent. Access scoped to the GHL user permissions the agent granted. |

Assistants cannot invite other assistants, change sub-account settings, access the GHL integration panel, or act outside their permission scope. Permission enforcement happens at three layers (GHL → `ghl-proxy` → frontend); the frontend layer is cosmetic only (it hides what the user cannot do; it never enforces).

---

## 2. Tech stack (locked)

This stack is fixed by Vibe AI Build's capabilities. Do not substitute.

| Layer | Technology |
|---|---|
| Framework | React 18 |
| Build tool | Vite |
| Language | TypeScript (strict) |
| Routing | React Router DOM v6 |
| Styling | Tailwind CSS with a CSS-variable token system |
| UI components | shadcn/ui on Radix UI primitives |
| Server state | TanStack Query |
| Local state | React Context + hooks |
| Forms | React Hook Form + Zod |
| Icons | lucide-react |
| Charts | recharts |
| Dates | date-fns |
| Auth | Supabase Auth (`@supabase/supabase-js`) |
| Backend / API proxy | Supabase Edge Functions (Deno) — already deployed |
| Supplementary DB | Supabase Postgres — already provisioned |
| CRM system of record | GoHighLevel sub-account |

Only pre-installed packages may be used. The backend (Supabase project `hnanbydtnchswrofupgd` and its 16 edge functions) already exists — RC CRM's job is to build the **frontend** that consumes it.

---

## 3. Build rules (Vibe AI must follow)

These rules are non-negotiable and apply to every file generated.

1. **Frontend only.** No backend code. All logic runs in the browser. The Supabase Edge Functions already exist and are not modified by this build.
2. **No direct GHL calls.** No file may call `services.leadconnectorhq.com`. Every GHL request goes through the `ghlProxy` client wrapper → `ghl-proxy` edge function. See `API.md`.
3. **Environment variables are `VITE_`-prefixed and public-safe only.** The frontend ships exactly two config values: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. No secrets — no GHL tokens, client secrets, or service role keys — ever reach the browser.
4. **Semantic tokens only.** Never hardcode colors (`bg-blue-600`, `text-white`, `#fff`). Use the CSS-variable token system mapped through Tailwind. See `DESIGN.md`.
5. **Mobile-first.** Every layout is designed mobile-first and adapts up to desktop. Kanban boards are vertical on mobile, horizontal on desktop.
6. **Permission-aware UI.** Any button, tab, or action the current user cannot perform is *hidden*, never disabled-and-visible. A `403` from an edge function shows a friendly toast and does not mutate local state.
7. **Skeleton loaders, not spinners.** Every data-fetched section has a skeleton loader matching its final layout. No layout shift on swap.
8. **Small, focused components.** Keep logic separate from presentation. Use `class-variance-authority` for variants. Extract reusable logic into `src/hooks/`.
9. **A catch-all `*` route** rendering `NotFound` must always be present at the bottom of the router.
10. **Every list, tab, and widget has a designed empty state.** Never render "No data".

---

## 4. Repository structure

```
src/
  main.tsx                 App entry — providers, router mount
  App.tsx                  Route definitions (incl. catch-all *)
  index.css                Design tokens (CSS variables, light + dark)
  vite-env.d.ts

  lib/
    supabase.ts            Supabase client singleton
    ghlProxy.ts            Authenticated GHL proxy client wrapper
    queryClient.ts         TanStack Query client config
    queryKeys.ts           Centralized query-key factory
    utils.ts               cn() + shared helpers
    format.ts              Money / date / countdown formatters
    ghl/                   GHL data mappers (raw GHL -> app view models)

  providers/
    AuthProvider.tsx       Supabase session + app_user profile
    ThemeProvider.tsx      Light/dark, density preference
    PermissionProvider.tsx Derived can() helper from role + template

  hooks/
    useContacts.ts  useLeads.ts  useClients.ts  useProperties.ts
    useOffers.ts  useTasks.ts  useNotes.ts  useCalendar.ts
    useDashboard.ts  useSavedViews.ts  useGlobalSearch.ts  ...

  components/
    ui/                    shadcn/ui primitives
    layout/                AppShell, Sidebar, BottomTabBar, TopBar
    shared/                StatCard, FilterChipRow, CountdownBadge, ...
    leads/  clients/  properties/  offers/  contacts/
    calendar/  tasks/  notes/  dashboard/  settings/

  pages/
    auth/                  SignIn, SignUp, ForgotPassword, AcceptInvite, ConnectGhl
    Dashboard.tsx
    Leads.tsx  LeadDetail.tsx
    Contacts.tsx  ContactDetail.tsx
    Clients.tsx  ClientDetail.tsx
    Properties.tsx  PropertyDetail.tsx
    Offers.tsx  OfferDetail.tsx
    Calendar.tsx
    Tasks.tsx
    Notes.tsx  NoteEditor.tsx
    Settings.tsx  (+ nested settings sections)
    NotFound.tsx

  types/                   Shared TypeScript types (GHL + app models)
```

Full detail of each area lives in `ARCHITECTURE.md` (structure + data flow), `UI_MAP.md` (routes + pages), and `COMPONENTS.md` (component inventory).

---

## 5. Companion documents

| Document | Covers |
|---|---|
| `ARCHITECTURE.md` | System architecture, data flow, folder structure, state management, auth flow, routing strategy, error handling |
| `UI_MAP.md` | Every route and page, navigation architecture, page-by-page views/tabs, mobile vs desktop layouts |
| `COMPONENTS.md` | The full component library — primitives, shared components, page-specific components, shadcn/ui inventory |
| `API.md` | The data layer — `ghlProxy` contract, edge-function clients, TanStack Query hooks, query keys, all GHL endpoints used, GHL data model |
| `DESIGN.md` | The master design system — tokens, typography, spacing, elevation, components, motion, accessibility |
| `Supabase.md` | Everything Supabase — project, auth, database schema, RLS, edge functions, env vars, frontend integration |

Read order for the build: `PROJECT.md` -> `ARCHITECTURE.md` -> `Supabase.md` -> `API.md` -> `DESIGN.md` -> `UI_MAP.md` -> `COMPONENTS.md`.

---

## 6. Milestone plan

The build is organized into seven milestones. Each milestone is a top-level task in Vibe AI's `todo_manager`. Sub-tasks within a milestone are listed as checklists. Work milestones in order — later milestones depend on the foundation laid by earlier ones.

### Milestone 1 — Foundation & app shell

The skeleton everything else hangs off of. No CRM features yet.

- [ ] Initialize Vite + React + TypeScript project; configure Tailwind and `tailwind.config.ts`.
- [ ] Implement the design token system in `src/index.css` (light + dark). See `DESIGN.md`.
- [ ] Install and configure the shadcn/ui primitives listed in `COMPONENTS.md`.
- [ ] Create `lib/supabase.ts` (Supabase client) and `lib/queryClient.ts` (TanStack Query).
- [ ] Build `AuthProvider`, `ThemeProvider`, `PermissionProvider`.
- [ ] Build `lib/ghlProxy.ts` — the authenticated GHL proxy wrapper. See `API.md`.
- [ ] Build the app shell: `AppShell`, desktop `Sidebar`, mobile `BottomTabBar`, `TopBar`, slide-out menu, `ContextFAB`, `StickyActionBar`.
- [ ] Define all routes in `App.tsx` with lazy-loaded route components and a catch-all `NotFound`.
- [ ] Build an `AuthGuard` route wrapper that redirects unauthenticated users to `/sign-in`.

### Milestone 2 — Authentication & onboarding

- [ ] `/sign-in` — email/password via Supabase Auth.
- [ ] `/sign-up` — agent self-registration; creates `app_users` row with `role = 'agent'`.
- [ ] `/forgot-password` — Supabase `resetPasswordForEmail`.
- [ ] `/connect-ghl` — post-sign-up GHL OAuth flow; handles `?status=success|error` callback.
- [ ] `/accept-invite` — assistant onboarding; calls `accept-invite` edge function with token + chosen password.

### Milestone 3 — Dashboard

- [ ] `/dashboard` — greeting, `NextAppointmentCard` hero, `StatCard` row, "what needs attention" widget, New Leads list, Pending Offers list, filterable `ActivityTimeline`.
- [ ] Desktop three-column layout with Focus mode toggle.
- [ ] `useDashboard` hook aggregating contacts, opportunities, calendar events, and tasks.

### Milestone 4 — Leads

- [ ] `/leads` — list view + 7-stage kanban (vertical mobile, horizontal desktop), `FilterChipRow`, `SavedViewDropdown`, `SwipeRow`, `ContextFAB` Add Lead drawer.
- [ ] `/leads/:leadId` — role-aware detail page; 7 tabs (Details, Tasks, Notes, Appointments, Opportunities, Properties, Offers); sticky action bar; Convert to Client.

### Milestone 5 — Contacts & Clients

- [ ] `/contacts` — master directory with role filter chips, alphabetical list, `AZScrubber`; desktop master-detail.
- [ ] `/contacts/:contactId` — role-aware detail page with 7 tabs.
- [ ] `/clients` — list + 5-stage kanban with Buyer/Seller pipeline toggle.
- [ ] `/clients/:clientId` — role-split detail (Buyer / Seller / Both panels).

### Milestone 6 — Properties & Offers

- [ ] `/properties` — list / kanban / **map** three-view toggle; 4-stage kanban; Add Property modal.
- [ ] `/properties/:propertyId` — hero carousel, 7 tabs, offer comparison table.
- [ ] `/offers` — group-by toggle (Property / Client / Status), accordion + desktop table, `CountdownBadge`, side-by-side comparison.
- [ ] `/offers/:recordId` — 2x2 key-value grid, negotiation timeline, 6 tabs.

### Milestone 7 — Calendar, Tasks, Notes & Settings

- [ ] `/calendar` — Agenda (mobile default) / Day / Week / Month; `DriveTimePill`; conflict detection; Add Appointment drawer.
- [ ] `/tasks` — Today+Overdue default filter, grouping, `SwipeRow`, quick-add FAB; desktop three-pane.
- [ ] `/notes` and `/notes/:noteId` — note grid/list, rich text editor, full-text search via `search-notes`.
- [ ] `/settings` — Profile, Business Details, Team (invite/revoke assistants), Integration, About, Integration Test Log.

---

## 7. Definition of done

A milestone is complete when:

- Every route in it renders on mobile and desktop, in light and dark mode.
- Every data-fetched section has a skeleton loader and a designed empty state.
- Every mutation is optimistic where specified and shows a success/failure toast.
- Permission-gated UI is hidden (not disabled) for users who lack the permission.
- No raw color classes, no direct GHL calls, no secrets in the bundle.
- `npm run build` produces a clean `dist/` with no type errors.

The project is complete when all seven milestones are done and the highest-value flow works end to end: open Dashboard -> tap next appointment -> open Property Detail -> add an Offer -> compare with a second offer.

---

*Companion docs: `ARCHITECTURE.md`, `UI_MAP.md`, `COMPONENTS.md`, `API.md`, `DESIGN.md`, `Supabase.md`.*