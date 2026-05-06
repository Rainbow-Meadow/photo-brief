
-- Single-row config table for live beta seat tracking
CREATE TABLE public.beta_program_config (
  id boolean NOT NULL DEFAULT true PRIMARY KEY,
  seats_filled integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT single_row CHECK (id = true),
  CONSTRAINT seats_filled_range CHECK (seats_filled >= 0 AND seats_filled <= 50)
);

-- Seed the single row
INSERT INTO public.beta_program_config (id, seats_filled) VALUES (true, 0);

-- Enable RLS
ALTER TABLE public.beta_program_config ENABLE ROW LEVEL SECURITY;

-- Public read — this is marketing data shown on the landing page
CREATE POLICY "Anyone can read beta config"
  ON public.beta_program_config FOR SELECT
  USING (true);

-- Only platform admins can update
CREATE POLICY "Platform admins can update beta config"
  ON public.beta_program_config FOR UPDATE
  TO authenticated
  USING (public.is_platform_admin())
  WITH CHECK (public.is_platform_admin());

-- Auto-update timestamp
CREATE TRIGGER update_beta_program_config_updated_at
  BEFORE UPDATE ON public.beta_program_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
