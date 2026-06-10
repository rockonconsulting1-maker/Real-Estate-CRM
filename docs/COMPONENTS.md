# COMPONENTS.md — RC CRM

**The component library: shadcn/ui primitives, layout components, shared components, and page-specific components — what each is, what it does, and where it lives.**

Companion to `UI_MAP.md` (which page uses what) and `DESIGN.md` (how each looks). Build rules: small, single-responsibility components; logic separated from presentation; `class-variance-authority` for variants; semantic tokens only.

---

## 1. shadcn/ui primitives — `components/ui/`

Install these shadcn/ui components in Milestone 1. They are styled by the design tokens in `DESIGN.md` (no raw colors).

| Primitive | Used for |
|---|---|
| `button` | All buttons; variants brand / primary / ghost / destructive / sm |
| `input`, `textarea`, `label` | Form fields |
| `select` | Dropdowns (pipeline, financing type, etc.) |
| `checkbox`, `radio-group`, `switch` | Toggles, VIP flag, theme/density |
| `dialog` | Modals — Add Property, Add Contact, Convert to Client, Invite Assistant |
| `drawer` / `sheet` | Add Lead, Add Offer, Add Appointment, Edit Contact; mobile slide-out menu |
| `alert-dialog` | Destructive confirmations (delete note, revoke assistant) |
| `dropdown-menu` | "+ New" menu, kebab row menus |
| `popover` | Inline edit on tags/fields, FAB long-press actions |
| `tabs` | Detail-page tab bars (desktop) |
| `accordion` | Offers grouping, Property Detail desktop sections |
| `tooltip` | Icon-button labels, drive-time detail |
| `badge` | Status badges, role badges, count badges |
| `avatar` | Contact/agent avatars |
| `skeleton` | Base for all skeleton loaders |
| `toast` / `sonner` | Success/failure/permission toasts |
| `command` | Desktop `⌘K` command palette |
| `calendar` | Date pickers; basis for the Calendar page grids |
| `progress` | Lead score, listing readiness |
| `scroll-area` | Scrollable tab bars, long lists |
| `separator` | Dividers |
| `collapsible` | Kanban lane collapse |

---

## 2. Layout components — `components/layout/`

| Component | Responsibility |
|---|---|
| `AppShell` | Wraps every app route. Renders the responsive frame: sidebar+topbar on desktop, topbar+bottom tabs on mobile. Hosts the toast viewport and the slide-out menu. |
| `AuthGuard` | Route wrapper. Redirects unauthenticated users to `/sign-in`; redirects revoked assistants to sign-out. |
| `Sidebar` | Desktop left nav (232–240px, collapsible to 64px). Grouped sections + Pinned saved views. |
| `BottomTabBar` | Mobile 6-tab bar with blur backdrop. Active tab = filled icon + accent. |
| `TopBar` | Page title, search / `⌘K`, "+ New" dropdown, notification bell, avatar. Adapts mobile vs desktop. |
| `SlideOutMenu` | Mobile hamburger menu — full 10-item nav. |
| `ContextFAB` | Mobile floating action button on list/kanban pages. Tap = primary action; long-press = related-actions popover. |
| `StickyActionBar` | Mobile detail-page bottom bar. 3–4 stacked icon+label actions, iOS safe-area aware. |
| `PageHeader` | Standard page title block + optional action slot. |
| `RouteErrorBoundary` | Per-route error boundary -> page-level error state. |

---

## 3. Shared components — `components/shared/`

The repeated primitives used across many pages. Design each once, reuse everywhere.

| Component | Responsibility |
|---|---|
| `StatCard` | Label + tabular value + optional trend arrow + optional sparkline + optional colored dot. Tap navigates to a pre-filtered list. |
| `FilterChipRow` | Horizontally scrollable single/multi-select chip row. Active = accent. Shows a "Clear all" chip when any chip is active. |
| `ScrollableTabBar` | Mobile horizontal tab bar with edge-fade gradients; active tab underlined with accent. |
| `EmptyState` | Icon + title + description + optional primary action. Sentence names the agent. |
| `SkeletonLoader` | Variants: card, list-row, kanban-column, stat. Matches final layout; ≤1s shimmer. |
| `CountdownBadge` | Live "time until" pill — success >24h, warning ≤24h, destructive ≤6h, "Expired" past zero. Tabular numerals. |
| `SwipeRow` | Swipe-right to complete, swipe-left for reschedule/delete. Every gesture has a kebab-menu button equivalent. |
| `AZScrubber` | Right-edge A–Z scrubber for long alphabetical lists (Contacts). |
| `CommandPalette` | Desktop-only `⌘K` overlay. Actions group + grouped search results. |
| `ActivityTimeline` | Vertical day-grouped timeline with filter chips (All / Notes / Tasks / Stage / Appointments). |
| `NextAppointmentCard` | Dashboard hero — big countdown, contact avatar, property address, drive-time pill, tap-to-navigate. |
| `DriveTimePill` | Inline "≈ 18 min drive" chip; amber "Tight" when travel + buffer exceeds the gap. |
| `NotificationSheet` | Mobile bottom sheet from the bell; notifications grouped by type, "mark all read". |
| `SavedViewDropdown` | Above the filter row on list pages. Lists saved + built-in views; "Save current as…" with a "Pin to sidebar" flag. |
| `RoleBadge` | Small pill + leading dot for a contact's derived role. Color from the role palette. |
| `StageDot` | 8px decorative pipeline-stage dot. |
| `Money` | Formats a monetary value — muted `$`, bold tabular digits, abbreviated above $10k. |
| `Kanban` | Generic board: vertical lanes (mobile) / horizontal columns (desktop), collapsible lanes, lane header (dot + name + count + money sum), drag-to-move, dashed add affordance. |
| `KanbanCard` | A single board card — name + sub + foot row (role chip + countdown). |
| `RecordList` | Generic virtualized list of record cards with skeleton + empty states. |
| `DetailTabs` | Detail-page tab controller — `Tabs` on desktop, `ScrollableTabBar` on mobile; role-driven tab visibility. |
| `MasterDetailLayout` | Desktop two/three-pane master-detail shell with a sticky left/right column. |
| `MapView` | Stage-colored pins, clustering, pin mini-card. Map-placeholder treatment until real tiles exist. |
| `ImagePlaceholder` | Diagonal warm-stripe swatch with a mono label — for any not-yet-available image. |
| `ThemeToggle` / `DensityToggle` | Light/dark and comfortable/compact controls. |
| `PermissionGate` | Renders children only if `useCan(action)` is true. The standard way to hide controls. |
| `ConfirmDialog` | Wrapper over `alert-dialog` for destructive confirmations. |

---

## 4. Form components — `components/shared/forms/`

All forms use React Hook Form + Zod. Each "Add/Edit" entry point is a drawer (mobile-friendly) or dialog per `UI_MAP.md`.

| Component | Creates / edits |
|---|---|
| `AddLeadDrawer` | GHL Contact (tagged lead) + Leads-pipeline opportunity |
| `AddContactModal` | Bare GHL Contact, no pipeline |
| `EditContactDrawer` | Updates GHL contact fields in place |
| `ConvertToClientModal` | Moves a Lead opportunity into a transaction pipeline |
| `AddPropertyModal` | `custom_objects.properties` record + owner-contact association |
| `AddOfferDrawer` | `custom_objects.real_estate_offer` record + property/contact associations |
| `AddAppointmentDrawer` | GHL calendar event linked to a contact |
| `AddTaskDrawer` | GHL task sub-resource on a contact |
| `InviteAssistantDialog` | Calls `invite-assistant` (email + permission template) |
| `FormField` | Shared field wrapper — label, control, error message, helper text |

Form error copy describes the situation, not the violation ("Pre-approval needs a lender", not "Field required").

---

## 5. Page-specific components

Grouped by page folder. These compose the shared components above.

### `components/dashboard/`
`GreetingHeader`, `AttentionWidget` (overdue tasks / new leads / pending offers), `NewLeadsList`, `PendingOffersList`, `PipelineChart` (recharts), `GciProgress`, `FocusModeToggle`.

### `components/leads/`
`LeadCard` (role-aware body, 4-field cap), `LeadKanban` (wraps `Kanban` with the Lead Nurture pipeline), `LeadDetailHeader`, `LeadTabs`, `LogContactButton`.

### `components/contacts/`
`ContactCard` (role-aware), `ContactDirectoryList`, `ContactDetailHeader`, `ContactDetailSections` (Lead Info / Engagement / SOI / Vendor Info, shown per role), `ContactPreviewPane` (desktop master-detail).

### `components/clients/`
`ClientCard`, `ClientKanban` (Buyer/Seller pipeline toggle), `PipelineToggle`, `BuyerPanel` (search requirements, properties, offers, pre-approval), `SellerPanel` (DOM, showings, listed property, incoming offers), `ClientProgressBar` (transaction steps).

### `components/properties/`
`PropertyCard`, `PropertyKanban`, `PropertyHeroCarousel`, `PropertySpecsGrid`, `PropertyOverviewTabs`, `OfferComparisonTable` (sticky row headers, horizontally scrollable on mobile), `PropertyMapView` (wraps `MapView`).

### `components/offers/`
`OfferCard` (price, countdown, status, avatar), `OfferAccordionGroup`, `OfferGroupByToggle` (Property / Client / Status), `OfferTable` (desktop, bulk-select), `OfferKeyGrid` (2×2 mobile), `NegotiationTimeline` (counter/revision/acceptance events + amount sparkline), `OfferComparisonColumns` (side-by-side).

### `components/calendar/`
`AgendaView` (mobile default), `DayView`, `WeekView`, `MonthView`, `CalendarEventBlock`, `ConflictBanner`, `EventDetailSheet`, `TaskDropTarget` (desktop drag-to-schedule).

### `components/tasks/`
`TaskRow` (with `SwipeRow`), `TaskFilterTabs` (All / Today / Overdue / Upcoming / Completed), `TaskGroupHeader`, `TaskInlineEditor` (desktop right pane), `TaskSchedulerMiniCalendar` (desktop), `QuickAddTask`.

### `components/notes/`
`NoteCard`, `NoteGrid`, `NoteListItem`, `NoteEditorToolbar`, `RichTextEditor`, `NoteColorFilter`.

### `components/settings/`
`ProfileSection`, `BusinessDetailsSection`, `TeamSection`, `AssistantRow` (Edit Permissions / Revoke), `IntegrationSection` (connection status, token health, Reconnect), `AboutSection`, `IntegrationTestLogTable`, `AvatarUpload`, `LogoUpload`.

### `components/auth/`
`AuthLayout` (centered card, no shell), `SignInForm`, `SignUpForm`, `ForgotPasswordForm`, `AcceptInviteForm`, `ConnectGhlPanel`.

---

## 6. Component conventions

- **One file, one component.** Co-locate a small sub-component only if it is never reused.
- **Presentation vs logic.** A card component receives a typed view model and renders it; it does not fetch. Hooks (`src/hooks/`) own data; components own rendering.
- **Variants via `cva`.** Button, badge, card, chip — all variants through `class-variance-authority`, never ad-hoc conditional class strings.
- **No raw colors.** Every color is a token utility (`bg-card`, `text-muted-foreground`, `bg-accent-brand`, `text-destructive`). No `bg-white`, no `#fff`, no `bg-blue-600`.
- **No browser storage.** Components keep state in React (`useState`/`useReducer`) — never `localStorage`/`sessionStorage`.
- **Every list/grid/tab/widget** ships a skeleton variant and an `EmptyState`.
- **Permission-gated controls** are wrapped in `PermissionGate` (hidden, never disabled).
- **Accessible by default.** Icon-only buttons have labels; status color is paired with text/icon; touch targets ≥ 44×44; focus rings visible on keyboard focus. See `DESIGN.md` §9.
- **Mobile-first classes.** Base styles target mobile; `md:` and up adapt to desktop.

---

## 7. Build order within a milestone

For each page milestone, build in this order so a page is never half-wired:

1. The data hook(s) from `API.md` for that page.
2. The page-specific card / row component (with skeleton + empty variants).
3. The list/kanban/board composition.
4. The detail page and its tabs.
5. The add/edit forms (drawer/dialog).
6. Permission gating, optimistic mutations, and toasts.

---

*Companion docs: `PROJECT.md`, `ARCHITECTURE.md`, `UI_MAP.md`, `API.md`, `DESIGN.md`, `Supabase.md`.*