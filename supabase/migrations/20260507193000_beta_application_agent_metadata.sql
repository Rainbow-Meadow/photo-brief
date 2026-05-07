-- Store structured output from the beta onboarding agent for faster admin review.

ALTER TABLE public.beta_applications
  ADD COLUMN IF NOT EXISTS agent_segment text,
  ADD COLUMN IF NOT EXISTS suggested_template text,
  ADD COLUMN IF NOT EXISTS agent_summary text,
  ADD COLUMN IF NOT EXISTS agent_concerns text[],
  ADD COLUMN IF NOT EXISTS first_request_steps text[];

CREATE INDEX IF NOT EXISTS idx_beta_applications_agent_segment
  ON public.beta_applications (agent_segment);

CREATE INDEX IF NOT EXISTS idx_beta_applications_suggested_template
  ON public.beta_applications (suggested_template);
