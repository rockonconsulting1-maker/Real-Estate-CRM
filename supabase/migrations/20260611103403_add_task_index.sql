-- New migration: public.task_index
CREATE TABLE public.task_index (
    id text PRIMARY KEY, -- GHL task id
    ghl_location_id text NOT NULL,
    contact_id text,
    title text,
    body text,
    due_date timestamptz,
    completed boolean DEFAULT false,
    assigned_to text,
    updated_at timestamptz DEFAULT now(),
    tsv tsvector GENERATED ALWAYS AS (
        to_tsvector('english', coalesce(title, '') || ' ' || coalesce(body, ''))
    ) STORED
);

-- Enable RLS
ALTER TABLE public.task_index ENABLE ROW LEVEL SECURITY;

-- SELECT policy mirroring note_index_select
CREATE POLICY task_index_select ON public.task_index
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_location_links l
            WHERE l.app_user_id = (SELECT auth.uid())
            AND l.ghl_location_id = task_index.ghl_location_id
            AND l.revoked_at IS NULL
        )
    );

-- Indexes
CREATE INDEX idx_task_index_location_due_date ON public.task_index (ghl_location_id, due_date);
CREATE INDEX idx_task_index_tsv ON public.task_index USING GIN (tsv);

-- Trigger for updated_at
CREATE TRIGGER update_task_index_updated_at
    BEFORE UPDATE ON public.task_index
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

COMMENT ON TABLE public.task_index IS 'Full-text search index for GHL tasks. Strictly a cache/index, not a source of truth.';

-- Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';
