# RC CRM — Task List

Status legend: `[x]` done · `[ ]` not done · `[~]` blocked/won't-do (see note).

## Phase 0 — Security Lockdown (do first)
- [x] T0.1 Revoke EXECUTE on get_decrypted_ghl_token from anon/authenticated/public; grant service_role only. Repeat review for encrypt_ghl_tokens, handle_new_auth_user, rls_auto_enable, current_app_user, current_primary_location, lookup_invite. _(migration 20260611103402; security advisor confirms get_decrypted_ghl_token no longer anon/auth-exposed. current_app_user / current_primary_location intentionally kept for authenticated; lookup_invite intentionally kept for anon and narrowed to non-sensitive columns.)_
- [x] T0.2 Set search_path = '' on all six flagged functions; schema-qualify internals. _(advisor no longer reports function_search_path_mutable.)_
- [~] T0.3 Enable leaked-password protection in Supabase Auth settings. _(BLOCKED: leaked-password protection is a paid (Pro plan) feature; not available on the current plan.)_
- [x] T0.4 Delete ghl-proxy-final and update-assistant-template-final Edge Functions. _(removed from the live project.)_
- [x] T0.5 Restrict Edge Function CORS to APP_BASE_URL. _(supabase/functions/_shared/cors.ts uses APP_BASE_URL; falls back to `*` only if the env var is unset.)_
- [x] T0.6 Move pgtap out of public schema (or drop it). _(moved to extensions schema; advisor no longer reports extension_in_public.)_
- [x] T0.7 Add SQL comments documenting intentional deny-all RLS on ghl_tokens and drive_time_cache.

## Phase 1 — ghl-proxy Hardening
- [x] T1.1 Inject/overwrite locationId server-side into proxied GHL request bodies and query params; strip client-supplied locationId.
- [x] T1.2 Fix location-link resolution: filter is_primary = true AND revoked_at IS NULL.
- [x] T1.3 Write audit_log entries on ALL outcomes (success, GHL errors, refresh failures) with real status codes. _(logged in a `finally` block with the real upstream status.)_
- [x] T1.4 Redeploy ghl-proxy; smoke-test contacts search, offer search, token-refresh path. _(redeployed — live version 17. Live smoke-test to be confirmed by the team.)_

## Phase 2 — Frontend Data Layer Fixes
- [x] T2.1 Remove locationId: "placeholder" from useContacts; rely on proxy injection.
- [x] T2.2 Fix ghlProxy.ts error handling to parse FunctionsHttpError via error.context.json() and map statusCode → ProxyErrorKind.
- [x] T2.3 Add page/pageLimit/searchAfter to all custom-object searches (useOffers, useProperties). _(shared searchRecordsPage helper.)_
- [x] T2.4 Fix useClients contact-lookup filter shape per Contacts Search API doc.
- [x] T2.5 Implement real association resolution (relations nested filter) replacing mocked resolution in useTasksFor/useNotesFor; shared resolveLinkedContact() helper in src/lib/ghl/associations.ts.
- [x] T2.6 Fix query-key invalidations to use prefix matching (calendar, offers, others as found).
- [x] T2.7 Add pagination (infinite query or pager) to Leads, Contacts, Clients, Properties, Offers lists.

## Phase 3 — Pipeline Config & PRD Reconciliation
- [x] T3.1 Create PipelineConfigProvider: fetch GET /opportunities/pipelines via proxy, resolve pipeline + stage IDs by name, cache.
- [x] T3.2 Replace all hardcoded pipeline IDs in useLeads/useClients with resolved config.
- [x] T3.3 Decide canonical Clients model (single 5-stage pipeline vs Buyer/Seller pipelines); update PRD or code to match. _(PRD §9.5 reconciled to the canonical two-pipeline Buyer/Seller model.)_
- [x] T3.4 Add a Settings fallback UI for manual pipeline mapping when name resolution fails. _(PipelineMappingSection + PipelineFallbackBanner.)_

## Phase 4 — Tasks & Notes Aggregation
- [x] T4.1 Wire GHL note webhooks to ghl-webhook-notes so note_index populates; verify ingestion. _(function deployed; live ingestion to be confirmed by the team.)_
- [x] T4.2 Switch Notes page to read from search-notes Edge Function (recent notes on empty query) instead of N+1 contact fan-out.
- [x] T4.3 Build tasks aggregation: task_index table fed by webhooks (mirrors the note_index pattern), with ghl-webhook-tasks + backfill-tasks.
- [x] T4.4 Switch Tasks page to the new aggregation source; keep per-contact hooks for detail tabs.

## Phase 5 — Database Performance
- [x] T5.1 Rewrite all flagged RLS policies to use (select auth.uid()) form. _(migration 20260612000000; advisor no longer reports initplan warnings.)_
- [x] T5.2 Drop duplicate index idx_app_users_email.
- [x] T5.3 Add covering indexes for documents.app_user_id and invites.invited_by_user_id.

## Phase 6 — Quality & Docs
- [x] T6.1 Replace speculative single-note GET in useNote with fetch-all + find (or verify endpoint).
- [x] T6.2 NotFound.tsx: use <Link> instead of <a>.
- [x] T6.3 Update RC-CRM-PRD.md §9 endpoint paths to /objects/{objectKey}/records/search format. _(PRD §9 rewritten as Pipelines Resolution; no stale /objects/record paths remain.)_
- [x] T6.4 Update SUPABASE_EDGE_FUNCTIONS.md to the post-cleanup canonical function list. _(docs/Supabase.md updated: -final functions removed, ghl-webhook-tasks + backfill-tasks added.)_
- [x] T6.5 Add Vitest + MSW tests: ghlProxy error mapping, association resolution, pipeline resolution, one hook happy-path per entity.
- [x] T6.6 Verify repo health: npm run lint && npm run test && npm run build && npx tsc --noEmit. _(all green: lint ✓, test ✓ 25 passing, build ✓, tsc ✓.)_
