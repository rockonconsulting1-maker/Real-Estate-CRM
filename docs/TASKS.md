# TASKS.md — RC CRM Build Tasks

**The complete, granular task breakdown for building RC CRM with Vibe AI Build.** Every page, detail page, modal, drawer, tab, view, filter, sort, and component is listed here.

Organized into eight milestones. Work top to bottom. Each task is a checkbox. This file pairs with `PROMPTS.md` — each prompt names the TASKS.md section it covers.

**Reference docs:** `PRD.md`, `PROJECT.md`, `ARCHITECTURE.md`, `Supabase.md`, `API.md`, `DESIGN.md`, `UI_MAP.md`, `COMPONENTS.md`. Read the docs named in each section before building it.

**Global rules (apply to every task):** frontend only · no direct GHL calls (use `ghlProxy`) · `VITE_`-prefixed public env vars only · semantic color tokens only · mobile-first · permission-gated controls hidden not disabled · skeleton loaders not spinners · every list/tab/widget has a designed empty state · catch-all `*` route present · no `localStorage`/`sessionStorage` for CRM data.

---

## Milestone 1 — Foundation & app shell

*Docs: `PROJECT.md`, `ARCHITECTURE.md`, `DESIGN.md`, `Supabase.md`, `API.md`, `COMPONENTS.md`.*

### 1.1 Project setup
- [x] Initialize a Vite + React 18 + TypeScript (strict) project.
- [x] Install and configure Tailwind CSS + `tailwindcss-animate`.
- [x] Create the folder structure from `PROJECT.md` §4 (`lib/`, `providers/`, `hooks/`, `components/`, `pages/`, `types/`).
- [x] Create `lib/utils.ts` with `cn()`.
- [x] Create `.env` keys `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`; type them in `vite-env.d.ts`.
- [x] Set `index.html` metadata: title, description, theme-color, favicon, semantic lang.
- [x] Create the `docs/` folder and blank reference files (see `PROMPTS.md` Prompt 1).

### 1.2 Design token system
- [x] Implement all CSS variables in `src/index.css` for light mode (surfaces, ink, brand, semantic, radius, elevation) per `DESIGN.md` §2.
- [x] Implement the `.dark` overrides for every token; dark elevation uses borders not shadows.
- [x] Load Inter + JetBrains Mono (Google Fonts).
- [x] Map every token in `tailwind.config.ts`: colors (+ `-foreground` pairs + soft variants), `borderRadius`, `fontFamily`, `boxShadow`, `darkMode: 'class'`.
- [x] Add the `.tnum` tabular-numeral helper and stage-dot / image-placeholder utilities.

### 1.3 shadcn/ui primitives
- [x] Install all primitives listed in `COMPONENTS.md` §1 (`button`, `input`, `textarea`, `label`, `select`, `checkbox`, `radio-group`, `switch`, `dialog`, `drawer`/`sheet`, `alert-dialog`, `dropdown-menu`, `popover`, `tabs`, `accordion`, `tooltip`, `badge`, `avatar`, `skeleton`, `toast`/`sonner`, `command`, `calendar`, `progress`, `scroll-area`, `separator`, `collapsible`).
- [x] Confirm each primitive uses token utilities only — no raw colors.

### 1.4 Lib & providers
- [x] `lib/supabase.ts` — Supabase client singleton (persist session, autorefresh, detect session in URL).
- [x] `lib/queryClient.ts` — TanStack Query client (staleTime 60s, retry 1, no retry on 401/403).
- [x] `lib/queryKeys.ts` — the query-key factory per `API.md` §5.1.
- [x] `lib/ghlProxy.ts` — authenticated GHL proxy wrapper with typed `ProxyError` mapping per `API.md` §2.
- [x] `lib/edgeFunctions.ts` — typed clients for the non-proxy edge functions per `API.md` §3.
- [x] `lib/format.ts` — `money()`, `shortMoney()`, `relativeDate()`, `countdown()`.
- [x] `lib/ghl/` mappers — `contacts.ts` (incl. `deriveContactRole`), `opportunities.ts`, `properties.ts`, `offers.ts`, `associations.ts`, `tasks.ts`, `notes.ts`.
- [x] `types/` — shared GHL DTO + app view-model types.
- [x] `providers/AuthProvider.tsx` — session + `app_users` profile + `useAuth()`; handles revoked assistants.
- [x] `providers/ThemeProvider.tsx` — light/dark/system + comfortable/compact; toggles `.dark` on `<html>`.
- [x] `providers/PermissionProvider.tsx` — `useCan(action)` derived from role + permission template.
- [x] Mount all providers + `QueryClientProvider` in `main.tsx`.

### 1.5 App shell & navigation
- [x] `components/layout/AppShell.tsx` — responsive frame; toast viewport; slide-out menu host.
- [x] `components/layout/Sidebar.tsx` — desktop nav (232–240px, collapsible to 64px rail), grouped sections (Pipeline / People / Daily / System) + Pinned saved views.
- [x] `components/layout/BottomTabBar.tsx` — mobile 6-tab bar with blur backdrop, filled active icon.
- [x] `components/layout/TopBar.tsx` — title, search/`⌘K`, "+ New" dropdown, bell, avatar; mobile vs desktop variants.
- [x] `components/layout/SlideOutMenu.tsx` — mobile hamburger full 10-item nav.
- [x] `components/layout/ContextFAB.tsx` — mobile FAB; tap = primary action, long-press = related-actions popover.
- [x] `components/layout/StickyActionBar.tsx` — mobile detail-page bottom bar, iOS safe-area aware.
- [x] `components/layout/PageHeader.tsx` — title block + action slot.
- [x] `components/layout/RouteErrorBoundary.tsx` — per-route error boundary.

### 1.6 Routing
- [x] `App.tsx` — `createBrowserRouter` route tree per `UI_MAP.md` §1.
- [x] Lazy-load every app route component.
- [x] `components/layout/AuthGuard.tsx` — redirects unauthenticated users to `/sign-in`; signs out revoked assistants.
- [x] Auth route group (no shell) + app route group (`AuthGuard` + `AppShell`).
- [x] `pages/NotFound.tsx` + the mandatory catch-all `*` route, always last.

### 1.7 Shared components
*Build each with skeleton + empty variants where applicable. Docs: `COMPONENTS.md` §3, `DESIGN.md` §5.*
- [x] `StatCard`, `Money`, `StageDot`, `RoleBadge`, `CountdownBadge`.
- [x] `FilterChipRow`, `ScrollableTabBar`, `SavedViewDropdown`.
- [x] `EmptyState`, `SkeletonLoader` (card / list-row / kanban-column / stat variants).
- [x] `SwipeRow`, `AZScrubber`.
- [x] `Kanban` (generic board — vertical mobile, horizontal desktop, collapsible lanes, drag-to-move) + `KanbanCard`.
- [x] `RecordList` (generic record-card list with skeleton + empty).
- [x] `DetailTabs` (tabs desktop / `ScrollableTabBar` mobile, role-driven visibility).
- [x] `MasterDetailLayout` (desktop two/three-pane).
- [x] `ActivityTimeline`, `NextAppointmentCard`, `DriveTimePill`.
- [x] `NotificationSheet`, `CommandPalette`.
- [x] `MapView`, `ImagePlaceholder`.
- [x] `ThemeToggle`, `DensityToggle`.
- [x] `PermissionGate`, `ConfirmDialog`.
- [x] `components/shared/forms/FormField` — shared RHF field wrapper.

---

## Milestone 2 — Authentication & onboarding

*Docs: `UI_MAP.md` §3, `Supabase.md` §3, `PRD.md`. Component: `components/auth/AuthLayout`.*

### 2.1 Sign In — `/sign-in`
- [x] `SignInForm` — email + password (RHF + Zod), `signInWithPassword`.
- [x] Success -> `/dashboard`; failure -> error toast.
- [x] "Forgot password?" link, link to `/sign-up`.

### 2.2 Sign Up — `/sign-up`
- [x] `SignUpForm` — agent self-registration; `signUp` + create `app_users` row (`role = 'agent'`).
- [x] On success -> `/connect-ghl`.

### 2.3 Forgot Password — `/forgot-password`
- [x] `ForgotPasswordForm` — email -> `resetPasswordForEmail`.
- [x] Post-submit confirmation state.

### 2.4 Connect GHL — `/connect-ghl`
- [x] `ConnectGhlPanel` — "Connect GoHighLevel" button -> GHL OAuth redirect (`state = supabase user id`).
- [x] Read `?status=success|error` on return; success -> `/dashboard`, error -> retry affordance.

### 2.5 Accept Invite — `/accept-invite`
- [x] `AcceptInviteForm` — reads `?token`; set-password field; calls `accept-invite` edge function.
- [x] Handle `404` / `410` / `403` as inline form errors.

---

## Milestone 3 — Dashboard

*Docs: `UI_MAP.md` §4, `API.md` §5, `COMPONENTS.md` (`components/dashboard/`).*

### 3.1 Data
- [x] `useDashboard()` hook — aggregates contacts, opportunities, calendar events, per-contact tasks.

### 3.2 Components
- [x] `GreetingHeader` (greeting + date).
- [x] `NextAppointmentCard` hero (countdown, avatar, address, drive-time pill).
- [x] `StatCard` row — Active Leads, Active Deals, Pipeline Value, Closed MTD (horizontal scroll on mobile).
- [x] `AttentionWidget` — Overdue tasks / New leads / Pending offers, each tap-navigable.
- [x] `NewLeadsList` (limit 5), `PendingOffersList` (limit 5).
- [x] `PipelineChart` (recharts), `GciProgress`.
- [x] `ActivityTimeline` with filter chips.

### 3.3 Layout & states
- [x] Mobile single-column layout per `UI_MAP.md` §4.
- [x] Desktop three-column grid.
- [x] `FocusModeToggle` — hides metrics column + activity feed, enlarges the rest.
- [x] Skeletons + empty states for every widget.

---

## Milestone 4 — Leads

*Docs: `UI_MAP.md` §5, `API.md` §6.1–6.2, `COMPONENTS.md` (`components/leads/`).*

### 4.1 Data
- [x] `useLeads(filters)`, `useLead(id)`.
- [x] `useCreateLead()`, `useUpdateLead()`, `useConvertToClient()`, `useUpdateOpportunityStage()` (optimistic).

### 4.2 Leads list/kanban — `/leads`
- [x] View toggle: **List** / **Kanban** (segmented control).
- [x] `LeadCard` — role-aware body, 4-field cap.
- [x] List view with `RecordList`.
- [x] `LeadKanban` — 7-stage Lead Nurture pipeline; vertical lanes mobile, horizontal columns desktop; lane header = dot + name + count + money sum; collapsible lanes.
- [x] **Filters:** `FilterChipRow` — Hot / Warm / Cold / Buyer / Seller / Both / Investor / Renter.
- [x] **Sort:** by date added, last contact, name, lead score.
- [x] `SavedViewDropdown` above the filter row.
- [x] `SwipeRow` actions on list rows.
- [x] `ContextFAB` (mobile) — Add Lead; long-press: Log Call / Add Note.
- [x] **Modal:** `AddLeadDrawer` — creates a GHL Contact tagged as a lead + Leads-pipeline opportunity.
- [x] Skeletons + empty states for list and each kanban lane.

### 4.3 Lead detail — `/leads/:leadId`
- [x] `LeadDetailHeader` — avatar + role badge + tags + "last contact" age + `LogContactButton`.
- [x] **7 tabs** (`DetailTabs`, role-aware): Details, Tasks, Notes, Appointments, Opportunities, Properties, Offers.
- [x] Role-specific primary tab content (Buyer Info / Seller Info).
- [x] Tasks tab — `useTasksFor(lead)`, `AddTaskDrawer`, complete/edit/delete.
- [x] Notes tab — `useNotesFor(lead)`, add/edit.
- [x] Appointments tab — linked calendar events, `AddAppointmentDrawer`.
- [x] Opportunities / Properties / Offers tabs — associated records.
- [x] **Mobile:** `StickyActionBar` — Call · Text · Add Note · Convert to Client.
- [x] **Desktop:** three-panel master-detail (sticky header / section scroll + mini-nav / quick-add column); inline edit on tags + key fields via popover.
- [x] **Modal:** `ConvertToClientModal`.
- [x] Skeleton + not-found + empty-tab states.

---

## Milestone 5 — Contacts & Clients

*Docs: `UI_MAP.md` §6–7, `API.md` §6.1–6.2, `COMPONENTS.md` (`components/contacts/`, `components/clients/`).*

### 5.1 Contacts directory — `/contacts`
- [x] `useContacts(filters)`.
- [x] `ContactCard` — role-aware.
- [x] **Mobile:** `FilterChipRow` role filter (All / Leads / Clients / Past Clients / Vendors / SOI / Other), alphabetical `ContactDirectoryList`, right-edge `AZScrubber`.
- [x] **Desktop:** `MasterDetailLayout` — chips + alphabetical list (left), lazy-loaded `ContactPreviewPane` (right).
- [x] **Sort:** alphabetical (default), recently added, last interaction.
- [x] **Modal:** `AddContactModal` — bare GHL Contact, no pipeline.
- [x] Skeleton + empty state.

### 5.2 Contact detail — `/contacts/:contactId`
- [x] `useContact(id)`, `useUpdateContact()`.
- [x] `ContactDetailHeader` — Call / Text / Email / Add Task actions.
- [x] **7 tabs** (role-aware): Details, Tasks, Notes, Appointments, Opportunities, Properties, Offers.
- [x] `ContactDetailSections` — Lead Info / Engagement / SOI / Vendor Info, shown per role.
- [x] **Modal:** `EditContactDrawer` — updates GHL contact fields in place.
- [x] Role-driven tab/section hiding (a vendor never sees Opportunities/Properties).

### 5.3 Clients list/kanban — `/clients`
- [x] `useClients(filters)`, `useClient(id)`.
- [x] `ClientCard`.
- [x] `ClientKanban` + `PipelineToggle` — Buyer Transaction ↔ Seller Transaction.
- [x] **Mobile kanban:** vertical with the pipeline toggle.
- [x] **Desktop:** horizontal kanban OR table view (Stage / Client / DOM / Active Offers / Value).
- [x] `SavedViewDropdown` + filters + sort.
- [x] **Modal:** `ConvertToClientModal` (shared with Leads).
- [x] Skeletons + empty states.

### 5.4 Client detail — `/clients/:clientId`
- [x] `ClientProgressBar` — transaction lifecycle steps, always visible.
- [x] **Buyer panel** — Search Requirements, Associated Properties, Offers Made, pre-approval status.
- [x] **Seller panel** — Days on Market, Showings, Listed Property, Incoming Offers.
- [x] **Both** — buyer + seller panels stacked (mobile) / side-by-side (desktop ≥1440px).
- [x] **Shared tabs:** Opportunities, Tasks, Notes, Appointments, Documents.
- [x] Documents tab — read `documents` metadata; graceful empty state if no storage bucket.
- [x] **Mobile:** `StickyActionBar` — Call · Text · Add Note · Add Appointment.
- [x] **Desktop:** two-pane master-detail.

---

## Milestone 6 — Properties & Offers

*Docs: `UI_MAP.md` §8–9, `API.md` §6.3–6.4 & §6.8, `COMPONENTS.md` (`components/properties/`, `components/offers/`).*

### 6.1 Properties list/kanban/map — `/properties`
- [x] `useProperties(filters)`, `useProperty(id)`, `useCreateProperty()`, `useUpdateProperty()`.
- [x] **Three-view toggle:** List / Kanban / Map.
- [x] `PropertyCard`.
- [x] `PropertyKanban` — 4-stage property pipeline (Coming Soon → Active Listing → Under Contract → Sold/Off Market); vertical mobile, horizontal desktop.
- [x] `PropertyMapView` (`MapView`) — stage-colored pins, clustering, pin mini-card -> detail.
- [x] **Filters:** stage, price range, beds/baths, property type.
- [x] **Sort:** price, date added, DOM.
- [x] **Modal:** `AddPropertyModal` — creates `custom_objects.properties` record + owner-contact association.
- [x] Skeletons + empty states for all three views.

### 6.2 Property detail — `/properties/:propertyId`
- [x] `PropertyHeroCarousel` — swipeable photo carousel (~40% mobile viewport) with price, MLS, beds/baths/sqft, address.
- [x] **7 tabs:** Overview (Description, Specs, Features, Financial, Listing Info, Gallery), Contacts (Seller, Interested Buyers), Tasks, Notes, Appointments, Opportunities, Offers.
- [x] `PropertySpecsGrid`, `PropertyOverviewTabs`.
- [x] Offers tab — `OfferComparisonTable` (sticky row headers Price/Deposit/Conditions/Closing/Deadline; horizontally scrollable on mobile; full table on desktop).
- [x] Tasks/Notes tabs resolve the linked contact via Associations first.
- [x] **Mobile:** `StickyActionBar` — Share · Add Showing · Add Offer · Add Note.
- [x] **Desktop:** two-pane — sticky gallery + key info (left), accordion sections (right).

### 6.3 Offers list — `/offers`
- [x] `useOffers(filters)`, `useOffer(id)`, `useCreateOffer()`, `useUpdateOffer()`, `useUpdateOfferStatus()` (optimistic).
- [x] `OfferCard` — price, `CountdownBadge`, status badge, buyer/seller avatar.
- [x] **Group-by toggle:** Property / Client / Status (`OfferGroupByToggle`).
- [x] `OfferAccordionGroup` — collapsible, per-group offer count + active-negotiation count.
- [x] Pinned "Active negotiations" section at the top.
- [x] `SwipeRow` — Update Status.
- [x] **Desktop:** `OfferTable` (Property / Client / Price / Deposit / Expiry / Status / Last Activity) with bulk-select for bulk PDF/email; accordion-view toggle.
- [x] **Comparison:** select 2+ offers on the same property -> `OfferComparisonColumns` side-by-side.
- [x] **Modal:** `AddOfferDrawer` — creates `real_estate_offer` record + property/contact associations.
- [x] Skeletons + empty states.

### 6.4 Offer detail — `/offers/:recordId`
- [x] `OfferKeyGrid` — 2×2 large-type values (Purchase Price, Deposit, Expiry countdown, Closing) on mobile.
- [x] **6 tabs:** Details (key-info grid), Tasks, Notes, Appointments, Documents, Opportunity.
- [x] `NegotiationTimeline` — vertical timeline of counters/revisions/acceptances + amount sparkline (desktop standout).
- [x] **Mobile:** `StickyActionBar` — Share PDF · Log Event · Add Task · Update Status.
- [x] **Desktop:** two-pane master-detail.

---

## Milestone 7 — Calendar, Tasks, Notes & Settings

*Docs: `UI_MAP.md` §10–13, `API.md` §6.5–6.7, `Supabase.md` §5, `COMPONENTS.md`.*

### 7.1 Calendar — `/calendar`
- [x] `useCalendarEvents(range)`, `useCreateAppointment()`, `useUpdateAppointment()`, `useDriveTime()`.
- [x] **View toggle:** Agenda / Day / Week / Month.
- [x] `AgendaView` — mobile default; infinite scroll list; `DriveTimePill` between events.
- [x] `DayView` — swipe left/right to change day.
- [x] `WeekView` — desktop default.
- [x] `MonthView`.
- [x] `CalendarEventBlock`, unified timeline combining appointments + tasks.
- [x] `ConflictBanner` (desktop) — overlap detection + one-click Reschedule.
- [x] `TaskDropTarget` (desktop) — drag a task onto a calendar slot.
- [x] **Drawer:** `AddAppointmentDrawer` — GHL calendar event linked to a contact.
- [x] **Sheet:** `EventDetailSheet` — details, linked contact, meeting notes, reschedule/cancel.
- [x] Constraint: `GET /calendars/events` needs `calendarId`/`userId`/`groupId` + `startTime` + `endTime`; never send `contactId`.

### 7.2 Tasks — `/tasks`
- [x] `useTasksFor()` aggregation, `useCreateTask()`, `useUpdateTask()`, `useCompleteTask()` (optimistic).
- [x] `TaskRow` with `SwipeRow` (right = Complete, left = Reschedule/Delete).
- [x] **Filters:** `TaskFilterTabs` — All / Today / Overdue / Upcoming / Completed (mobile default = Today+Overdue merged).
- [x] **Grouping:** by contact / by due date / by status (`TaskGroupHeader`).
- [x] **Mobile:** quick-add FAB (title only; pre-links contact on a contact-detail page).
- [x] **Desktop:** three-pane — filters + saved views / task list / `TaskInlineEditor`.
- [x] `TaskSchedulerMiniCalendar` (desktop) — drag unscheduled tasks onto today's slots.
- [x] Bulk-editable table-view toggle.
- [x] **Drawer:** `AddTaskDrawer`.

### 7.3 Notes — `/notes` and `/notes/:noteId`
- [x] `useNotesFor()`, `useNote(id)`, `useCreateNote()`, `useUpdateNote()`, `useDeleteNote()`.
- [x] `/notes` — `NoteGrid` / `NoteListItem` (view toggle).
- [x] **Search** — via `search-notes` edge function (FTS index).
- [x] **Filters:** `NoteColorFilter`; **sort:** by date / by contact.
- [x] `/notes/new` & `/notes/:noteId` — `RichTextEditor` + `NoteEditorToolbar`.
- [x] Delete confirmation via `ConfirmDialog`.

### 7.4 Settings — `/settings`
- [x] `ProfileSection` (all users) — `AvatarUpload`, name, email, phone, password change.
- [x] `BusinessDetailsSection` (agent only) — `LogoUpload`, business address, contact info, social links.
- [x] `TeamSection` (agent only) — `useTeam()`; `AssistantRow` with Edit Permissions / Revoke; `InviteAssistantDialog`.
- [x] `useInviteAssistant()`, `useRevokeAssistant()`, `useUpdateTemplate()`.
- [x] `IntegrationSection` (agent only) — connection status, sub-account ID, connected GHL user, token health, Reconnect.
- [x] `AboutSection` (all users) — app version, release channel.
- [x] `IntegrationTestLogTable` — `/settings/integration/log` (agent only), reads `audit_log` via `useAuditLog()`.
- [x] Permission-gate sections — assistants see only Profile + About.

---

## Milestone 8 — Cross-cutting QA & polish

*Docs: all. Run this as a final pass over the whole app.*

### 8.1 States
- [x] Every data-fetched section has a skeleton matching its final layout.
- [x] Every list / tab / widget has a designed empty state (names the agent, one action).
- [x] Every page has an error state with Retry.
- [x] `404` / not-found states on all detail routes.

### 8.2 Permissions
- [x] Every assistant-restricted control wrapped in `PermissionGate` (hidden, not disabled).
- [x] `403` responses roll back optimistic updates + show a friendly toast.
- [x] Revoked-assistant flow signs the user out.

### 8.3 Theme & responsive
- [x] Every route verified in light and dark mode.
- [x] Every route verified at mobile (393px) and desktop (1440px) widths.
- [x] Kanban vertical on mobile, horizontal on desktop everywhere.
- [x] Comfortable/compact density toggle works.

### 8.4 Motion & accessibility
- [x] Motion values match `DESIGN.md` §7; `prefers-reduced-motion` respected.
- [x] Touch targets ≥ 44×44; list rows ≥ 64pt.
- [x] Icon-only buttons have accessible labels; status color paired with text/icon.
- [x] Focus rings visible on keyboard focus; tab order follows visual order.

### 8.5 Data & build
- [x] No raw color classes anywhere (no `bg-blue-600`, `#fff`, `text-white`).
- [x] No direct GHL calls — every CRM request goes through `ghlProxy`.
- [x] No secrets in the bundle; only `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`.
- [x] No `localStorage`/`sessionStorage` for CRM data.
- [x] Lazy-loaded routes confirmed; initial bundle is small.
- [x] `npm run build` produces a clean `dist/` with zero type errors.

### 8.6 End-to-end flow
- [x] Verify the headline flow: Dashboard -> tap next appointment -> Property Detail -> Add Offer -> compare with a second offer.
- [x] Verify auth flow: sign up -> connect GHL -> dashboard.
- [x] Verify invite flow: invite assistant -> accept invite -> scoped access.

---

*Pairs with `PROMPTS.md`. Companion docs: `PRD.md`, `PROJECT.md`, `ARCHITECTURE.md`, `Supabase.md`, `API.md`, `DESIGN.md`, `UI_MAP.md`, `COMPONENTS.md`.*