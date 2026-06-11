# RC CRM — Task List

## Phase 0 — Security Lockdown (do first)
- [ ] T0.1 Revoke EXECUTE on get_decrypted_ghl_token from anon/authenticated/public; grant service_role only. Repeat review for encrypt_ghl_tokens, handle_new_auth_user, rls_auto_enable, current_app_user, current_primary_location, lookup_invite.
- [ ] T0.2 Set search_path = '' on all six flagged functions; schema-qualify internals.
- [ ] T0.3 Enable leaked-password protection in Supabase Auth settings.
- [ ] T0.4 Delete ghl-proxy-final and update-assistant-template-final Edge Functions.
- [ ] T0.5 Restrict Edge Function CORS to APP_BASE_URL.
- [ ] T0.6 Move pgtap out of public schema (or drop it).
- [ ] T0.7 Add SQL comments documenting intentional deny-all RLS on ghl_tokens and drive_time_cache.

## Phase 1 — ghl-proxy Hardening
- [ ] T1.1 Inject/overwrite locationId server-side into proxied GHL request bodies and query params; strip client-supplied locationId.
- [ ] T1.2 Fix location-link resolution: filter is_primary = true AND revoked_at IS NULL.
- [ ] T1.3 Write audit_log entries on ALL outcomes (success, GHL errors, refresh failures) with real status codes.
- [ ] T1.4 Redeploy ghl-proxy; smoke-test contacts search, offer search, token-refresh path.

## Phase 2 — Frontend Data Layer Fixes
- [ ] T2.1 Remove locationId: "placeholder" from useContacts; rely on proxy injection.
- [ ] T2.2 Fix ghlProxy.ts error handling to parse FunctionsHttpError via error.context.json() and map statusCode → ProxyErrorKind.
- [ ] T2.3 Add page/pageLimit/searchAfter to all custom-object searches (useOffers, useProperties).
- [ ] T2.4 Fix useClients contact-lookup filter shape per Contacts Search API doc.
- [ ] T2.5 Implement real association resolution (relations nested filter) replacing mocked resolution in useTasksFor/useNotesFor; shared resolveLinkedContact() helper in src/lib/ghl/associations.ts.
- [ ] T2.6 Fix query-key invalidations to use prefix matching (calendar, offers, others as found).
- [ ] T2.7 Add pagination (infinite query or pager) to Leads, Contacts, Clients, Properties, Offers lists.

## Phase 3 — Pipeline Config & PRD Reconciliation
- [ ] T3.1 Create PipelineConfigProvider: fetch GET /opportunities/pipelines via proxy, resolve pipeline + stage IDs by name, cache.
- [ ] T3.2 Replace all hardcoded pipeline IDs in useLeads/useClients with resolved config.
- [ ] T3.3 Decide canonical Clients model (single 5-stage pipeline vs Buyer/Seller pipelines); update PRD or code to match.
- [ ] T3.4 Add a Settings fallback UI for manual pipeline mapping when name resolution fails.

## Phase 4 — Tasks & Notes Aggregation
- [ ] T4.1 Wire GHL note webhooks to ghl-webhook-notes so note_index populates; verify ingestion.
- [ ] T4.2 Switch Notes page to read from search-notes Edge Function (recent notes on empty query) instead of N+1 contact fan-out.
- [ ] T4.3 Build tasks aggregation: either a tasks-aggregate Edge Function with server-side contact paging + caching, or a task_index table fed by webhooks (mirror note_index pattern).
- [ ] T4.4 Switch Tasks page to the new aggregation source; keep per-contact hooks for detail tabs.

## Phase 5 — Database Performance
- [ ] T5.1 Rewrite all flagged RLS policies to use (select auth.uid()) form.
- [ ] T5.2 Drop duplicate index idx_app_users_email.
- [ ] T5.3 Add covering indexes for documents.app_user_id and invites.invited_by_user_id.

## Phase 6 — Quality & Docs
- [ ] T6.1 Replace speculative single-note GET in useNote with fetch-all + find (or verify endpoint).
- [ ] T6.2 NotFound.tsx: use <Link> instead of <a>.
- [ ] T6.3 Update RC-CRM-PRD.md §9 endpoint paths to /objects/{objectKey}/records/search format.
- [ ] T6.4 Update SUPABASE_EDGE_FUNCTIONS.md to the post-cleanup canonical function list.
- [ ] T6.5 Add Vitest + MSW tests: ghlProxy error mapping, association resolution, pipeline resolution, one hook happy-path per entity.
- [ ] T6.6 Verify repo health: npm run lint && npm run test && npm run build && npx tsc --noEmit.
