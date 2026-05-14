
ALTER TABLE public.business_workspaces
  ADD COLUMN IF NOT EXISTS trial_nudge_t3_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS trial_nudge_t1_sent_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_workspaces_trial_ends_at
  ON public.business_workspaces(trial_ends_at)
  WHERE trial_ends_at IS NOT NULL;
