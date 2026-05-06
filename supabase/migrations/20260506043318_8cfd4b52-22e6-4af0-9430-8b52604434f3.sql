ALTER TABLE public.waitlist_entries
  ADD COLUMN IF NOT EXISTS interest text,
  ADD COLUMN IF NOT EXISTS workflow_type text;