-- =============================================================================
-- Security hardening: SECURITY DEFINER function privileges + search_path
-- =============================================================================
-- Addresses Supabase security advisor findings:
--   * anon_security_definer_function_executable (0028)
--   * authenticated_security_definer_function_executable (0029)
--   * function_search_path_mutable (0011)
--   * extension_in_public (0014) — pgtap
--   * rls_enabled_no_policy (0008) — documented as intentional (deny-all)
--
-- MANUAL STEP (cannot be migrated via SQL):
--   Leaked-password protection (HaveIBeenPwned check) must be enabled in
--   Supabase Dashboard -> Authentication -> Passwords. Advisor:
--   auth_leaked_password_protection.
--
-- Companion change (outside this migration): the accept-invite Edge Function
-- previously consumed lookup_invite()'s full invites row; it now queries
-- public.invites directly with its service-role client because lookup_invite
-- is narrowed below.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Service-role-only functions: revoke from PUBLIC/anon/authenticated.
--    These are internal (token crypto, auth trigger, DDL event trigger) and
--    must never be reachable via PostgREST RPC with the anon key.
--    Trigger/event-trigger execution does not re-check EXECUTE at fire time,
--    so encrypt_ghl_tokens / handle_new_auth_user / rls_auto_enable keep working.
-- -----------------------------------------------------------------------------
revoke execute on function public.get_decrypted_ghl_token(text) from public, anon, authenticated;
grant execute on function public.get_decrypted_ghl_token(text) to service_role;

revoke execute on function public.encrypt_ghl_tokens() from public, anon, authenticated;
grant execute on function public.encrypt_ghl_tokens() to service_role;

revoke execute on function public.handle_new_auth_user() from public, anon, authenticated;
grant execute on function public.handle_new_auth_user() to service_role;

revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
grant execute on function public.rls_auto_enable() to service_role;

-- -----------------------------------------------------------------------------
-- 2. RLS-helper functions: keep for authenticated (used by RLS policies and
--    the frontend), drop anon/PUBLIC access.
-- -----------------------------------------------------------------------------
revoke execute on function public.current_app_user() from public, anon;
grant execute on function public.current_app_user() to authenticated, service_role;

revoke execute on function public.current_primary_location() from public, anon;
grant execute on function public.current_primary_location() to authenticated, service_role;

-- -----------------------------------------------------------------------------
-- 3. lookup_invite: must stay callable by anon (invite-accept flow runs before
--    login), but the previous definition returned the whole invites row
--    (SELECT *), which echoed the raw invite token back and exposed
--    invited_by_user_id (an internal auth.users UUID) to anonymous callers.
--    Rewritten to return only non-sensitive fields: invite id, email, role,
--    and a derived status. The invites table holds no location columns, so
--    there is no location display info to return.
--    Return type changes, so DROP + CREATE (CREATE OR REPLACE cannot change it).
-- -----------------------------------------------------------------------------
drop function if exists public.lookup_invite(uuid);

create function public.lookup_invite(p_token uuid)
returns table (id uuid, email text, role text, status text)
language sql
stable
security definer
set search_path = ''
as $$
  select
    i.id,
    i.invited_email,
    i.role,
    case
      when i.accepted_at is not null then 'accepted'
      when i.expires_at < now() then 'expired'
      else 'pending'
    end as status
  from public.invites i
  where i.token = p_token
  limit 1;
$$;

-- New functions default to EXECUTE for PUBLIC; tighten then re-grant.
revoke execute on function public.lookup_invite(uuid) from public;
grant execute on function public.lookup_invite(uuid) to anon, authenticated, service_role;

-- -----------------------------------------------------------------------------
-- 4. Pin search_path = '' on every flagged function. All function bodies
--    already schema-qualify their references (public.*, vault.*, extensions.*,
--    auth.uid()); built-ins resolve via the implicit pg_catalog lookup, so no
--    body rewrites are needed beyond lookup_invite above.
-- -----------------------------------------------------------------------------
alter function public.get_decrypted_ghl_token(text) set search_path = '';
alter function public.encrypt_ghl_tokens() set search_path = '';
alter function public.handle_new_auth_user() set search_path = '';   -- already '', kept for idempotency
alter function public.rls_auto_enable() set search_path = '';        -- was 'pg_catalog'
alter function public.current_app_user() set search_path = '';       -- was 'public'; body fully qualified
alter function public.current_primary_location() set search_path = '';
alter function public.search_notes_index(text, integer) set search_path = '';
alter function public.note_index_update_tsv() set search_path = '';
alter function public.update_updated_at_column() set search_path = '';

-- -----------------------------------------------------------------------------
-- 5. Move pgtap out of the public schema (relocatable; extensions schema exists).
-- -----------------------------------------------------------------------------
alter extension pgtap set schema extensions;

-- -----------------------------------------------------------------------------
-- 6. Document intentional deny-all RLS (enabled, zero policies) so the
--    rls_enabled_no_policy advisor finding is understood as deliberate.
-- -----------------------------------------------------------------------------
comment on table public.ghl_tokens is
  'Deny-all RLS is intentional: RLS enabled with zero policies. Contains encrypted GoHighLevel OAuth tokens; accessed exclusively by Edge Functions via service_role (which bypasses RLS). No anon/authenticated access by design.';

comment on table public.drive_time_cache is
  'Deny-all RLS is intentional: RLS enabled with zero policies. Server-side cache accessed exclusively by Edge Functions via service_role (which bypasses RLS). No anon/authenticated access by design.';

-- Refresh the PostgREST schema cache so RPC exposure/grants take effect immediately.
notify pgrst, 'reload schema';
