# DESIGN.md — RC CRM Master Design System

**The single source of truth for tokens, typography, spacing, elevation, components, motion, and accessibility. Implement these exactly in `src/index.css` and `tailwind.config.ts`.**

Companion to `COMPONENTS.md` (component inventory) and `UI_MAP.md` (page layouts). This document consolidates the RC CRM design brief and design system into one implementation reference.

---

## 1. Design philosophy

RC CRM is a working tool for a busy independent real-estate agent — calm, dense, fast. Closer to a premium productivity app (Linear, Things, Notion) than a glossy real-estate portal.

Seven principles. Reach for these when two options both look fine:

1. **The two-second rule.** The most important thing on a screen is the most visually dominant thing. If the agent must read the whole screen before acting, the screen failed.
2. **One primary action per screen.** One CTA, one accent color for it, one answer to "what do I do here?"
3. **Thumb-reachable on mobile.** Primary actions live in the bottom 40% (sticky action bar or FAB). Any top-of-screen action has a thumb-zone duplicate.
4. **Money looks like money.** Monetary values use tabular lining numerals, slightly heavier weight than their label, sized to be found in a scan.
5. **Urgency is colored, not loud.** Overdue is red, soon is amber, today is info-blue. The app never shouts; it never hides a deadline either.
6. **Content over chrome.** Headers and nav shrink/collapse on scroll. Pixels go to the data.
7. **Both themes are first-class.** Agents use the app in the car at night. Light and dark are designed together — dark mode is not a 3%-regression afterthought.

The voice is professional, human, slightly understated. No gradients, no glass, no decorative iconography, no stock photography of handshakes or keys — ever. The only photography in the app is property photos.

---

## 2. Color tokens

All colors are CSS variables in `src/index.css`, mapped to Tailwind utilities in `tailwind.config.ts`. **Never hardcode a color.** Two layers — semantic (functional) and decorative (stage/role) — and they never mix.

### 2.1 The token set

Tokens are defined for both light and dark. The reference values below use the warm-neutral oklch palette from the project's design system; an equivalent HSL set is acceptable as long as contrast targets in §9 are met. Every surface/semantic token has a paired `-foreground`.

**Surfaces & ink (light mode):**

| Token | Value | Use |
|---|---|---|
| `--background` | `oklch(0.985 0.004 85)` | App background, sidebar, top bar |
| `--background-sunk` | `oklch(0.965 0.005 85)` | Area behind cards, table headers |
| `--background-deep` | `oklch(0.945 0.006 85)` | Empty progress track, board column rest |
| `--card` / `--surface` | `#ffffff` | Cards, rows, popovers |
| `--foreground` | `oklch(0.20 0.015 260)` | Primary text, headings |
| `--foreground-2` | `oklch(0.40 0.012 260)` | Body, table cells |
| `--muted-foreground` | `oklch(0.58 0.010 260)` | Meta, captions, placeholders |
| `--foreground-4` | `oklch(0.72 0.008 260)` | Disabled, icon rest |
| `--border` | `oklch(0.90 0.006 260)` | Card edges, inputs, dividers |
| `--border-2` | `oklch(0.94 0.005 260)` | Internal separators |

**Brand & semantic:**

| Token | Value (light) | Use |
|---|---|---|
| `--primary` | `oklch(0.20 0.015 260)` | Neutral primary (text-like CTAs) |
| `--accent-brand` | `oklch(0.54 0.165 254)` | The one accent — selection, focus, active nav, primary CTA |
| `--accent-brand-ink` | `oklch(0.42 0.16 254)` | Text on `--accent-brand-soft` |
| `--accent-brand-soft` | `oklch(0.955 0.028 254)` | Selected row, brand badge bg |
| `--success` | `oklch(0.60 0.15 150)` | Wins, closed, confirmed |
| `--warning` | `oklch(0.72 0.155 70)` | Due today, expiring within 24h |
| `--destructive` | `oklch(0.60 0.21 25)` | Overdue, expired, errors |
| `--info` | `oklch(0.65 0.13 230)` | Informational, reschedule |
| `--ring` | = `--accent-brand` | Focus rings |

Each semantic color has a `-soft` companion at L≈0.955 used for badge/chip backgrounds.

**Dark mode:** `.dark` class overrides every token. Background drops to a deep blue-black (`~oklch(0.18 0.01 260)`), card to a slightly lighter surface, foreground to near-white. Semantic hues lift slightly in lightness to hold contrast on dark surfaces. **Dark-mode elevation uses borders, not shadows** — shadows don't read on dark.

### 2.2 Radius & elevation

One radius scale, three elevation levels.

| Token | Value | Use |
|---|---|---|
| `--radius-sm` | `6px` | Inputs, chips inside dense rows |
| `--radius` | `10px` | Cards, buttons, table cells, badges, dialogs |
| `--radius-lg` | `14px` | Kanban lanes, action bar, modals |
| (circular) | `9999px` | Avatars, circular icon buttons |

| Elevation | Shadow | Use |
|---|---|---|
| 0 — flat | none | Page background, card-on-card |
| 1 — rest | `0 1px 2px rgba(25,30,45,.05), 0 1px 1px rgba(25,30,45,.03)` | Default card, button, top bar |
| 2 — floating | `0 10px 28px rgba(25,30,45,.10), 0 2px 8px rgba(25,30,45,.04)` | FAB, sticky action bar, popovers, modals |

Cards get a single hairline border + elevation 1. Modal-class affordances get elevation 2. Nothing else floats. Never stack shadows — a card inside a card flattens to border-only.

### 2.3 Stage colors (decorative)

Pipeline stage colors come from GHL and are **decorative dots only** — an 8px circle next to the stage name. They **never** fill a card background. A stage color is its identity across the Leads kanban, Clients kanban, and Client Detail progress bars.

Lead Nurture: New `#ADB5BD` · Contacted `#74C0FC` · Engaged `#339AF0` · Nurturing `#9775FA` · Appointment Set `#FAB005` · Appointment Completed `#FD7E14` · Proposal `#E64980` · Agreement Signed `#40C057`.

Buyer / Seller transaction stages carry their own GHL colors (see the GHL pipeline data). Render whatever the API returns.

**Never** dress an overdue task in a stage color, and never dress a stage in a semantic color. The two systems are orthogonal.

### 2.4 Role hues (decorative)

Five tints used **only** for the contact avatar background and the role chip. They share chroma so no role outweighs another.

| Role family | Hue | Avatar bg / chip |
|---|---|---|
| Buyer | 254 (blue) | `oklch(0.62 0.14 254)` / soft blue |
| Seller | 310 (purple) | `oklch(0.58 0.17 310)` / soft purple |
| Past client | 150 (green) | `oklch(0.58 0.14 150)` / soft green |
| Vendor | 260 (zinc) | `oklch(0.55 0.08 260)` / soft zinc |
| SOI / referral | 30 (rose/amber) | `oklch(0.62 0.14 30)` / soft rose |

---

## 3. Typography

One primary family: **Inter** (system-ui fallback). **JetBrains Mono** for any digit or identifier whose alignment matters. Both via Google Fonts.

```
--font-sans: 'Inter', system-ui, -apple-system, sans-serif;
--font-mono: 'JetBrains Mono', 'SF Mono', ui-monospace, Menlo, monospace;
```

### 3.1 Scale

| Token | Size / line | Weight | Use |
|---|---|---|---|
| `display` | 32 / 40 | 600 | Hero numbers — next-appointment countdown, pipeline value |
| `h1` | 24 / 32 | 600/700 | Page titles (28 on mobile top bar) |
| `h2` | 20 / 28 | 600 | Section headers |
| `h3` | 18 / 24 | 600 | Card headers |
| `body` | 16 / 24 | 400 | Default body on mobile |
| `body-desktop` | 14 / 20 | 400 | Default body on desktop |
| `label` | 14 / 20 | 500 | Form labels, filter chips |
| `caption` | 12 / 16 | 400 | Metadata, helper text |
| `eyebrow` | 10.5–13 | 600 | All-caps card/lane/section labels, +0.04–0.06em tracking |
| `mono` | 11–14 | 500 | IDs, times, countdowns |

**Mobile body is 16px minimum** to prevent iOS Safari auto-zoom on input focus. Letter-spacing is slightly tightened (`-0.005em` body, `-0.02em` display) to offset Inter's default tracking.

### 3.2 Numbers

Every digit shown to a user — money, beds, sqft, counts, DOM, countdowns, times — uses `font-variant-numeric: tabular-nums lining-nums` (the `.tnum` helper). Money uses the `.money` pattern: a muted `$` symbol + bold tabular digits. Key numbers (countdowns, pipeline value, offer price, GCI, days-on-market) render at least one weight heavier than their label and at least `h3`-sized.

Money is abbreviated above $10k with no trailing zeros: `$1.05M`, `$879k`. Cents only when the user entered them.

---

## 4. Spacing & layout

### 4.1 Spacing scale

Tailwind 4px increments. Common stops: `4 · 8 · 12 · 16 · 18 · 22 · 24 · 28 · 32 · 40`.

- Tight inline (icon + label): `8px`
- Form field vertical spacing: `16px`
- Card padding: `18–24px`
- Section vertical spacing: `32px`
- Page container max width: `1280px`; page padding `16px` mobile / `24–32px` desktop

### 4.2 Mobile shell (< 768px)

```
┌────────────────────────────────┐
│ status spacer (safe area)       │
│ Top bar:  ☰  Title  🔔  👤      │
│ Search (list pages, hides on    │
│         scroll-down)            │
├────────────────────────────────┤
│         Scrollable content      │
├────────────────────────────────┤
│ Sticky action bar (detail) OR   │
│ FAB bottom-right (list/kanban)   │
├────────────────────────────────┤
│ Bottom tab bar (6 cols, blur)    │
└────────────────────────────────┘
```

Bottom tabs: **Dashboard · Leads · Clients · Contacts · Calendar · Tasks** — six is the hard ceiling. Active tab gets a filled icon + accent color. Notes lives in the slide-out menu and is reachable from every contact detail. The tab bar uses a translucent `color-mix` over `--background` with `backdrop-filter: blur(14px)`. The FAB sits at `right: 18px; bottom: 92px` clear of the tab bar.

### 4.3 Desktop shell (≥ 768px)

```
┌──────────┬──────────────────────────────────────────┐
│ Sidebar  │ Top bar: title · ⌘K search · + New · next │
│ 232–240  ├──────────────────────────────────────────┤
│ px       │ Page content (scrolls within main column) │
└──────────┴──────────────────────────────────────────┘
```

Sidebar 232–240px, collapsible to a 64px icon rail. Nav items group visually: **Pipeline** (Leads, Clients, Properties, Offers), **People** (Contacts), **Daily** (Calendar, Tasks, Notes), **System** (Settings). Below the nav, a **Pinned** section shows the agent's saved views. Top bar: page title (left), center search with a `⌘K` hint that opens the command palette, a "+ New" dropdown, and a compact next-appointment widget (right). No bottom tab bar, no FAB on desktop.

**Detail pages on desktop use master-detail, not tabs.** A sticky left column (record header + key info), a scrolling center column with every section, and an optional right quick-add column (visible ≥1440px, collapses to a button on narrow desktop).

**Kanban rule:** always vertical stacked lanes on mobile, horizontal columns on desktop.

---

## 5. Component styling

Full component inventory and props live in `COMPONENTS.md`. This section is the styling spec.

- **Buttons** — ~34px tall, 13px label, `--radius`. `.primary` inverts to `--foreground`; `.brand` uses `--accent-brand`; `.ghost` transparent until hover; `.sm` is 28px for inline table actions. Icon buttons are 34×34. Never use bullet lists or color as the only signal.
- **Cards** — `--radius`, hairline border, elevation 1, 18–24px padding. Optional all-caps eyebrow header divided by `--border-2`.
- **StatCard** — eyebrow label, big tabular value, optional delta line (success/destructive arrow), optional sparkline. 4-up grid desktop, scroll-snap row of 2 mobile.
- **Tables** — sticky `thead` on sunk bg with eyebrow headers; `td` hairline dividers; `.num` right-aligned tabular; rows hover to `--background-sunk`; selected row gets `--accent-brand-soft` fill + a 3px inset brand bar.
- **Kanban** — lane column ~290px, `--radius-lg`, header shows color dot + name + count + money sum. Cards: white surface, `--radius`, 12px padding, name + sub + foot row (role chip + countdown). Dashed "+ Add" affordance at lane bottom.
- **Badges / chips** — pill, 11px, soft-tinted bg. Variants: `brand`, `warn`, `danger`, `success`, `info`, `solid`. Filter chips are interactive; active chips use `--accent-brand`.
- **Role badge** — all-caps 10.5px pill with a 6px leading dot; strictly for contact role.
- **CountdownBadge** — mono-numeric pill: success >24h, warning within 24h, destructive ≤6h, inverted "Expired" past zero. Tabular numerals.
- **Progress** — bar (6px track, brand fill) for a single percent; steps (N equal pips, `done`/`current` states) for transaction lifecycle.
- **Skeletons** — card / list-row / kanban-column / stat variants. Shimmer ≤1s cycle. Match the final layout exactly so there is no shift on swap.
- **Empty states** — a short sentence naming the agent ("You haven't added any sellers yet") + one primary action. No illustration, no "No records found", no exclamation marks.
- **Map placeholder** — soft radial bg + dashed grid masked to a vignette; pins are white rounded pills with an ink stroke, selected pin inverts. Real map tiles replace this if available.
- **Image placeholder** — diagonal warm-stripe swatch with a mono `data-label`. Mandatory for any image not yet available (headshots, MLS photos, hero shots). Never hand-draw a substitute.

---

## 6. Iconography

**lucide-react**, stroke weight 1.5–1.6, sizes 16 / 20 / 24. Never mix icon weights on a screen. Icons pair with text labels on nav, buttons, and list rows; icon-only is reserved for the top bar (bell, avatar, hamburger) and the FAB. Icons rest at `--muted-foreground` and shift to `--accent-brand` only when their parent is selected/active. If an icon would be redundant with its label, drop it. **Never use emoji.**

---

## 7. Motion

Restrained — motion is feedback, not decoration. No parallax, no springs, no entrance animations on load. Respect `prefers-reduced-motion`: swap every slide/translate for an opacity fade at half duration.

| Interaction | Motion |
|---|---|
| Tab change | Opacity fade, 150ms ease-out |
| Modal / drawer open | Slide-up + fade, 200ms ease-out; close reverses at 150ms ease-in |
| Popover / dropdown | Fade + 4px Y translate, 120ms ease-out |
| Swipe row | Linear finger-tracking, snap at 64px threshold, release returns 180ms ease-out |
| Skeleton shimmer | 1000ms linear infinite, low-opacity sweep |
| Toast | Slide from top (mobile) / bottom-right (desktop), 250ms ease-out; auto-dismiss 4s (6s if there's an Undo) |
| Optimistic update | UI changes instantly; success/failure arrives as a toast — no per-row spinners |
| Tap (iOS controls) | `transform: scale(0.96)` on `:active` |

Use `tailwindcss-animate` for these micro-interactions.

---

## 8. Role-aware UI

Contacts are not rendered by a generic template. Every contact has a derived **role** (17 roles; derivation in `lib/ghl/contacts.ts`), and the card body + detail tabs adapt per role.

**Card body cap: 4 fields max.** Examples:

| Role | Card fields |
|---|---|
| `buyer_lead` | Budget range · Timeline · Pre-approval · Temperature |
| `seller_lead` | Current address · Timeline · Temperature · Lead source |
| `buyer_client` | Pipeline stage · Budget · Pre-approval · Active offer count |
| `seller_client` | Pipeline stage · Listed property · DOM · Incoming offer count |
| `past_buyer_client` | Closing date · Anniversary · Referral count · VIP flag |
| `vendor` | Service type · Priority · Last used · Preferred communication |
| `soi` / `referral_partner` | Relationship · Referral count · Last contact · Touchpoint goal |

Detail-page tab visibility is role-driven. A `vendor` does not see Opportunities or Properties tabs — those tabs are **hidden, not shown empty**. An empty tab is a design failure.

---

## 9. Accessibility

Bake these in from the start — not a polish pass.

- **Contrast:** body text ≥ 4.5:1 against its surface; large text and icons ≥ 3:1. Test every semantic token and every role color against both light and dark surfaces.
- **Touch targets:** minimum 44×44pt on mobile (icon buttons 36 visible + 8 padding). List rows ≥ 64pt tall.
- **Focus ring:** always visible on keyboard focus (desktop); never on touch. `ring-2 ring-[--ring] ring-offset-2` equivalent.
- **Keyboard navigation:** every interactive element reachable and operable; tab order follows visual order.
- **Screen-reader labels:** every icon-only button has an accessible label. Status color is never the only signal — always paired with a text or icon cue.
- **Selection state** is never color-only — it always pairs with an inset bar, border change, or weight shift.
- **Motion** respects `prefers-reduced-motion` everywhere.

---

## 10. Tailwind integration

`tailwind.config.ts` maps every CSS variable to a Tailwind utility so components write `bg-background`, `text-foreground`, `text-muted-foreground`, `bg-card`, `border-border`, `bg-accent-brand`, `text-destructive`, etc. — and never `bg-blue-600` or `#fff`. Configure:

- `theme.extend.colors` -> all semantic tokens (with `-foreground` pairs) and the soft variants.
- `theme.extend.borderRadius` -> `sm`, `DEFAULT`, `lg` from the radius tokens.
- `theme.extend.fontFamily` -> `sans` (Inter), `mono` (JetBrains Mono).
- `theme.extend.boxShadow` -> `1` and `2` from the elevation tokens.
- `darkMode: 'class'`, toggled by `ThemeProvider` via a `.dark` class on `<html>`.
- Plugins: `tailwindcss-animate`.

Token values live in **one place** — `src/index.css`. When the brand shifts, only that file changes.

---

*Companion docs: `PROJECT.md`, `ARCHITECTURE.md`, `UI_MAP.md`, `COMPONENTS.md`, `API.md`, `Supabase.md`.*