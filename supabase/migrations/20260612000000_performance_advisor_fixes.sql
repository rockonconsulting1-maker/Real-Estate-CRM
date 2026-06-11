-- Migration: Performance advisor fixes
-- Date: 2026-06-12
-- Note: 'unused index' findings are left alone for zero-row tables as usage stats are meaningless pre-launch.

BEGIN;

-- 1. Rewrite RLS policies to wrap auth.uid() in (select auth.uid())

-- app_users
DROP POLICY IF EXISTS app_users_select ON public.app_users;
CREATE POLICY app_users_select ON public.app_users
FOR SELECT
TO authenticated
USING (
  (id = (select auth.uid())) OR
  (
    ((SELECT role FROM public.current_app_user()) = 'agent'::app_user_role) AND
    (EXISTS (SELECT 1 FROM public.user_location_links WHERE app_user_id = app_users.id AND ghl_location_id = public.current_primary_location()))
  )
);

DROP POLICY IF EXISTS app_users_update ON public.app_users;
CREATE POLICY app_users_update ON public.app_users
FOR UPDATE
TO authenticated
USING (id = (select auth.uid()))
WITH CHECK (id = (select auth.uid()));

-- user_location_links
DROP POLICY IF EXISTS user_location_links_select ON public.user_location_links;
CREATE POLICY user_location_links_select ON public.user_location_links
FOR SELECT
TO authenticated
USING (
  (app_user_id = (select auth.uid())) OR
  (
    ((SELECT role FROM public.current_app_user()) = 'agent'::app_user_role) AND
    (ghl_location_id = public.current_primary_location())
  )
);

-- audit_log
DROP POLICY IF EXISTS audit_log_select ON public.audit_log;
CREATE POLICY audit_log_select ON public.audit_log
FOR SELECT
TO authenticated
USING (
  (
    ((SELECT role FROM public.current_app_user()) = 'agent'::app_user_role) AND
    (ghl_location_id = public.current_primary_location())
  ) OR
  (app_user_id = (select auth.uid()))
);

-- invites
DROP POLICY IF EXISTS agents_read_own_invites ON public.invites;
CREATE POLICY agents_read_own_invites ON public.invites
FOR SELECT
TO public
USING (
  (invited_by_user_id = (select auth.uid())) AND
  (EXISTS (SELECT 1 FROM public.app_users WHERE id = (select auth.uid()) AND role = 'agent'::app_user_role))
);

-- saved_views
DROP POLICY IF EXISTS "Users can select their own saved views" ON public.saved_views;
CREATE POLICY "Users can select their own saved views" ON public.saved_views
FOR SELECT
TO public
USING (app_user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert their own saved views" ON public.saved_views;
CREATE POLICY "Users can insert their own saved views" ON public.saved_views
FOR INSERT
TO public
WITH CHECK (app_user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update their own saved views" ON public.saved_views;
CREATE POLICY "Users can update their own saved views" ON public.saved_views
FOR UPDATE
TO public
USING (app_user_id = (select auth.uid()))
WITH CHECK (app_user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete their own saved views" ON public.saved_views;
CREATE POLICY "Users can delete their own saved views" ON public.saved_views
FOR DELETE
TO public
USING (app_user_id = (select auth.uid()));

-- documents
DROP POLICY IF EXISTS documents_location_access ON public.documents;
CREATE POLICY documents_location_access ON public.documents
FOR ALL
TO authenticated
USING (
  (ghl_location_id IN (SELECT ghl_location_id FROM public.user_location_links WHERE app_user_id = (select auth.uid()) AND revoked_at IS NULL)) AND
  (deleted_at IS NULL)
)
WITH CHECK (
  (ghl_location_id IN (SELECT ghl_location_id FROM public.user_location_links WHERE app_user_id = (select auth.uid()) AND revoked_at IS NULL))
);

-- note_index
DROP POLICY IF EXISTS note_index_select ON public.note_index;
CREATE POLICY note_index_select ON public.note_index
FOR SELECT
TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.user_location_links l WHERE l.app_user_id = (select auth.uid()) AND l.ghl_location_id = note_index.ghl_location_id AND l.revoked_at IS NULL)
);

-- 2. Drop duplicate index
DROP INDEX IF EXISTS public.idx_app_users_email;

-- 3. Create missing foreign key indexes
CREATE INDEX IF NOT EXISTS idx_documents_app_user_id ON public.documents (app_user_id);
CREATE INDEX IF NOT EXISTS idx_invites_invited_by_user_id ON public.invites (invited_by_user_id);

COMMIT;
