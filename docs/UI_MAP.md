# UI_MAP.md — RC CRM

**Every route, the navigation architecture, and a page-by-page specification of views, tabs, and mobile vs desktop layout.**

Companion to `COMPONENTS.md` (what each page is built from) and `DESIGN.md` (how it looks).

---

## 1. Route table

Two route groups. Auth routes have no shell and no guard. App routes are wrapped in `AuthGuard` + `AppShell`.

| Route | Page component | Group | Notes |
|---|---|---|---|
| `/sign-in` | `SignIn` | Auth | Email/password |
| `/sign-up` | `SignUp` | Auth | Agent self-registration |
| `/forgot-password` | `ForgotPassword` | Auth | Password reset request |
| `/connect-ghl` | `ConnectGhl` | Auth | GHL OAuth; reads `?status` |
| `/accept-invite` | `AcceptInvite` | Auth | Assistant onboarding; reads `?token` |
| `/` or `/dashboard` | `Dashboard` | App | Default landing after login |
| `/leads` | `Leads` | App | List + 7-stage kanban |
| `/leads/:leadId` | `LeadDetail` | App | Role-aware, 7 tabs |
| `/contacts` | `Contacts` | App | Master directory |
| `/contacts/:contactId` | `ContactDetail` | App | Role-aware, 7 tabs |
| `/clients` | `Clients` | App | List + 5-stage kanban |
| `/clients/:clientId` | `ClientDetail` | App | Role-split (buyer/seller) |
| `/properties` | `Properties` | App | List / kanban / map |
| `/properties/:propertyId` | `PropertyDetail` | App | Hero carousel, 7 tabs |
| `/offers` | `Offers` | App | Grouped accordion / table |
| `/offers/:recordId` | `OfferDetail` | App | 2×2 grid, negotiation timeline, 6 tabs |
| `/calendar` | `Calendar` | App | Agenda / Day / Week / Month |
| `/tasks` | `Tasks` | App | Aggregated task list |
| `/notes` | `Notes` | App | Note grid/list |
| `/notes/new` · `/notes/:noteId` | `NoteEditor` | App | Rich text editor |
| `/settings` | `Settings` | App | Nested sections |
| `/settings/integration/log` | `IntegrationLog` | App | Agent only |
| `*` | `NotFound` | — | Mandatory catch-all, always last |

All app route components are lazy-loaded. Detail routes are parameterized.

---

## 2. Navigation architecture

### 2.1 Mobile (< 768px)

- **Bottom tab bar** — 6 tabs: Dashboard, Leads, Clients, Contacts, Calendar, Tasks. Active tab = filled icon + accent color.
- **Top bar** — hamburger, page title, notification bell, avatar. List pages add a second line: a search field that hides on scroll-down.
- **Slide-out menu** (hamburger) — Dashboard, Leads, Contacts, Clients, Properties, Offers, Calendar, Tasks, Notes, Settings.
- **FAB** — on list/kanban pages only; primary quick-add, long-press reveals related actions.
- **Sticky action bar** — on detail pages only; 3–4 stacked icon+label actions.

### 2.2 Desktop (≥ 768px)

- **Left sidebar** (232–240px, collapsible to 64px rail) — grouped: Pipeline (Leads, Clients, Properties, Offers), People (Contacts), Daily (Calendar, Tasks, Notes), System (Settings). A Pinned section lists saved views.
- **Top bar** — page title, center `⌘K` search / command palette, "+ New" dropdown, compact next-appointment widget.
- No bottom tab bar, no FAB.

---

## 3. Auth pages

### `/sign-in`
Email + password form. Success -> `/dashboard`. Failure -> error toast. "Forgot password?" link. Link to `/sign-up`.

### `/sign-up`
Agent self-registration. Creates a Supabase auth user + `app_users` row (`role = 'agent'`). On success routes to `/connect-ghl`.

### `/forgot-password`
Email field -> `resetPasswordForEmail`. Confirmation state after submit.

### `/connect-ghl`
Post-sign-up GHL OAuth. "Connect GoHighLevel" button redirects to the GHL consent screen (`state = supabase user id`). On return, reads `?status=success|error`: success -> `/dashboard`; error -> retry affordance.

### `/accept-invite`
Assistant onboarding. Reads `?token`. User sets a password (the link establishes a session), then the page calls the `accept-invite` edge function. Handles `404` (invalid), `410` (expired/used), `403` (email mismatch) as inline errors.

---

## 4. Dashboard — `/dashboard`

High-level overview of the agent's day and pipeline.

**Mobile, top to bottom:** greeting + date (small) · `NextAppointmentCard` hero (countdown, contact avatar, property address, drive-time pill) · horizontal scroll of `StatCard`s (Active Leads, Active Deals, Pipeline Value, Closed MTD) · "What needs your attention" widget (Overdue tasks / New leads / Pending offers, each tap-navigable) · New Leads list (limit 5) · Pending Offers list (limit 5) · filterable `ActivityTimeline`.

**Desktop:** three-column grid. Left = day-at-a-glance (`NextAppointmentCard` + today's timeline + drive-time warnings). Middle = work queue (Overdue tasks, New leads, Pending offers). Right = metrics (pipeline chart, StatCards, monthly GCI progress). Full-width Recent Activity at the bottom. A **Focus mode** toggle hides the metrics column + activity feed, enlarging the day-at-a-glance and work queue.

Data: `useDashboard()` — aggregates `/contacts/`, `/opportunities/search`, `/calendars/events`, and per-contact tasks.

---

## 5. Leads — `/leads` and `/leads/:leadId`

### List + kanban (`/leads`)
Two views toggled by a segmented control. **List** = large role-aware cards with a `FilterChipRow` (Hot / Warm / Cold / Buyer / Seller / Both / Investor / Renter) and `SwipeRow` actions. **Kanban** = the 7-stage Lead Nurture pipeline — vertical stacked lanes on mobile (color dot + count + total value per lane header, collapsible), horizontal columns on desktop. `SavedViewDropdown` above the filter row. `ContextFAB` opens the Add Lead drawer (creates a GHL Contact tagged as a lead, then a Leads-pipeline opportunity).

### Lead detail (`/leads/:leadId`)
Role-aware. **7 tabs:** Details, Tasks, Notes, Appointments, Opportunities, Properties, Offers.

- **Mobile:** header with avatar + role badge + tags + large "last contact" age with a one-tap "Log contact" button. Role-specific primary tab (Buyer Info / Seller Info). `ScrollableTabBar` for the rest. Sticky action bar: **Call · Text · Add Note · Convert to Client**.
- **Desktop:** three-panel master-detail — sticky contact header (left), section-scroll with a left-edge mini-nav (center), contextual quick-add column (right). Inline edit on tags and key fields via popover.

---

## 6. Contacts — `/contacts` and `/contacts/:contactId`

### Directory (`/contacts`)
Master list of all contacts regardless of type.

- **Mobile:** `FilterChipRow` role filter (All / Leads / Clients / Past Clients / Vendors / SOI / Other), alphabetical list, right-edge `AZScrubber`, role-aware cards.
- **Desktop:** master-detail — role filter chips + alphabetical list (left), lazy-loaded preview pane for the selected contact (right).

Add Contact modal creates a bare GHL Contact with no pipeline assignment.

### Contact detail (`/contacts/:contactId`)
Role-aware, **7 tabs:** Details (Lead Info / Engagement / SOI / Vendor Info sections, shown per role), Tasks, Notes, Appointments, Opportunities, Properties, Offers. Header actions: Call, Text, Email, Add Task. Edit Contact drawer updates GHL fields in place.

---

## 7. Clients — `/clients` and `/clients/:clientId`

### List + kanban (`/clients`)
Contacts with an active opportunity in a transaction pipeline.

- **Mobile kanban:** vertical, with a pipeline toggle at the top to switch Buyer Transaction ↔ Seller Transaction.
- **Desktop kanban:** horizontal board with the pipeline toggle, or a table view (Stage / Client / DOM / Active Offers / Value).
- **Convert to Client** modal moves a Lead opportunity into a transaction pipeline and updates the contact.

### Client detail (`/clients/:clientId`)
Tabs split by role:
- **Buyer:** Search Requirements, Associated Properties, Offers Made, pre-approval status.
- **Seller:** Days on Market, Showings, Listed Property, Incoming Offers.
- **Both:** Buyer and Seller panels stacked (mobile) / side-by-side (desktop ≥1440px).
- **Shared tabs:** Opportunities, Tasks, Notes, Appointments, Documents.

Header has the pipeline progress bar(s), always visible. Sticky action bar (mobile): **Call · Text · Add Note · Add Appointment**.

---

## 8. Properties — `/properties` and `/properties/:propertyId`

### List / kanban / map (`/properties`)
Three-view toggle.

- **List** — property cards.
- **Kanban** — 4-stage property pipeline (Coming Soon → Active Listing → Under Contract → Sold/Off Market); vertical mobile, horizontal desktop.
- **Map** — the differentiator: pins colored by stage, clustering at zoom-out, tap a pin for a mini-card (address, price, stage badge), tap the mini-card to open detail. Uses the map-placeholder treatment until real tiles are available.

Add Property modal creates a `custom_objects.properties` record and links it to the owner contact via the Associations API.

### Property detail (`/properties/:propertyId`)
Hero image carousel (~40% of mobile viewport) with price, MLS number, beds/baths/sqft, address. **7 tabs:** Overview (Description, Specs, Features, Financial, Listing Info, Gallery), Contacts (Seller, Interested Buyers), Tasks, Notes, Appointments, Opportunities, Offers.

- **Mobile:** the Offers tab renders as a horizontally scrollable **offer comparison table** with sticky row headers (Price / Deposit / Conditions / Closing / Deadline). Sticky action bar: **Share · Add Showing · Add Offer · Add Note**.
- **Desktop:** two-pane — photo gallery + key info (sticky left), scrolling accordion sections (right). Full-width offer comparison table with every column visible.

---

## 9. Offers — `/offers` and `/offers/:recordId`

### Offers list (`/offers`)
GHL custom object `custom_objects.real_estate_offer`.

- **Mobile:** group-by toggle (Property / Client / Status). A pinned "Active negotiations" section at the top. Collapsible accordion groups with per-group offer count + active-negotiation count. Each offer card: price, `CountdownBadge` for expiry, status badge, buyer/seller avatar. `SwipeRow` action: Update Status.
- **Desktop:** default is a table (Property, Client, Price, Deposit, Expiry countdown, Status, Last Activity) with bulk-select for bulk PDF/email; alternate accordion view toggle. Selecting 2+ offers on the same property opens a side-by-side comparison column layout.

Add Offer drawer creates a `real_estate_offer` record and associates it with a property and contact.

### Offer detail (`/offers/:recordId`)
**6 tabs:** Details, Tasks, Notes, Appointments, Documents, Opportunity. Details tab is a key-info grid (Purchase Price, Deposit, Expiry, Property, Buyer, Seller, Closing Date, Possession Date, Financing).

- **Mobile:** a 2×2 grid of large-type key values (Purchase Price, Deposit, Expiry countdown, Closing). Sticky action bar: **Share PDF · Log Event · Add Task · Update Status**.
- **Desktop:** two-pane master-detail. The standout is a **negotiation timeline** — a vertical timeline of every counter, revision, acceptance, and conditional change, with the offer amount charted over time in a small sparkline.

---

## 10. Calendar — `/calendar`

Appointment and schedule management. Unified timeline combining appointments and tasks.

- **Mobile:** **Agenda view is the default** — an infinite scrollable list of upcoming items, with a `DriveTimePill` between consecutive events. Day / Week / Month also available; swipe left/right in Day view to change day.
- **Desktop:** Week view default. A conflict-detection banner appears when two appointments overlap, with a one-click Reschedule. A Task can be dragged from the Tasks page onto a calendar slot.

Add Appointment drawer creates a GHL calendar event linked to a contact. Event detail shows details, linked contact, meeting notes, reschedule/cancel.

**Constraint:** `GET /calendars/events` requires `calendarId`/`userId`/`groupId` + `startTime` + `endTime`. Never send `contactId` as a filter.

---

## 11. Tasks — `/tasks`

Centralized task list aggregated across all contacts. Filters: All, Today, Overdue, Upcoming, Completed. Grouping: by contact, by due date, or by status.

- **Mobile:** default filter is **Today + Overdue merged**. `SwipeRow` — right = Complete, left = Reschedule / Delete. Quick-add FAB captures a title (and pre-links the contact when on a contact-detail page).
- **Desktop:** three-pane — filters + saved views (left), task list (center), selected task inline editor (right). Toggle to a bulk-editable table. Above the list, a "today's task scheduler" mini-calendar allows dragging unscheduled tasks onto today's slots.

**Constraint:** tasks are sub-resources of a contact (`/contacts/{id}/tasks`). The page aggregates client-side; non-contact records resolve the linked contact via Associations first.

---

## 12. Notes — `/notes` and `/notes/:noteId`

Central repository for CRM notes.

- **List (`/notes`):** note grid or list, search (via the `search-notes` edge function / FTS index), color filters, sort by date or contact.
- **Editor (`/notes/new`, `/notes/:noteId`):** rich text editor. Delete confirmation via an `AlertDialog`.

Notes are almost always created in a contact context; the master page is secondary. Notes are sub-resources of a contact — same contact-resolution rule as Tasks.

---

## 13. Settings — `/settings`

Nested sections:

- **Profile** (all users) — avatar upload (Supabase Storage), name, email, phone, password change.
- **Business Details** (agent only) — logo upload, business address, contact info, social links.
- **Team** (agent only) — list of assistants (name, email, permission template, last active, status); row actions Edit Permissions / Revoke Access; "Invite Assistant" button opens `InviteAssistantDialog`.
- **Integration** (agent only) — GHL connection status, sub-account ID, connected GHL user, token health indicator, Reconnect button.
- **About** (all users) — app version, release channel.
- **Integration Test Log** (`/settings/integration/log`, agent only) — chronological log of edge-function → GHL test results, response times, status codes, trace IDs. Reads `audit_log`.

Settings sections are permission-gated: assistants see only Profile and About.

---

## 14. Cross-cutting states

Every page renders all of:

- **Loading** — skeleton matching the final layout (no spinner on primary content).
- **Error** — message + Retry, scoped to the page (a wrapping `ErrorBoundary` per route).
- **Empty** — designed empty state naming the agent + one primary action.
- **Permission** — controls the current user cannot use are hidden, not disabled.

---

*Companion docs: `PROJECT.md`, `ARCHITECTURE.md`, `COMPONENTS.md`, `API.md`, `DESIGN.md`, `Supabase.md`.*