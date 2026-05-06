
-- Beta application status enum
CREATE TYPE public.beta_application_status AS ENUM (
  'new','reviewing','accepted','invited','activated','active','stalled','graduated','not_fit'
);

-- Beta workspace status enum
CREATE TYPE public.beta_workspace_status AS ENUM (
  'onboarding','active','stalled','graduated','churned'
);

-- ============================================================
-- beta_applications
-- ============================================================
CREATE TABLE public.beta_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  first_name text,
  last_name text,
  business_name text,
  website text,
  use_case text,
  workflow_type text,
  monthly_photo_volume text,
  source text DEFAULT 'betalist',
  status beta_application_status NOT NULL DEFAULT 'new',
  fit_score integer,
  notes text,
  last_contacted_at timestamptz,
  accepted_at timestamptz,
  rejected_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_beta_applications_email ON public.beta_applications (email);
CREATE INDEX idx_beta_applications_status ON public.beta_applications (status);

ALTER TABLE public.beta_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "beta_applications admin read" ON public.beta_applications
  FOR SELECT TO authenticated USING (public.is_platform_admin());

CREATE POLICY "beta_applications admin write" ON public.beta_applications
  FOR ALL TO authenticated
  USING (public.is_platform_admin())
  WITH CHECK (public.is_platform_admin());

CREATE POLICY "beta_applications service role" ON public.beta_applications
  FOR ALL TO public
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE TRIGGER update_beta_applications_updated_at
  BEFORE UPDATE ON public.beta_applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- beta_workspace_profiles
-- ============================================================
CREATE TABLE public.beta_workspace_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL UNIQUE,
  application_id uuid REFERENCES public.beta_applications(id) ON DELETE SET NULL,
  is_beta_partner boolean NOT NULL DEFAULT true,
  beta_started_at timestamptz DEFAULT now(),
  beta_ends_at timestamptz,
  beta_segment text,
  beta_status beta_workspace_status NOT NULL DEFAULT 'onboarding',
  founding_partner_discount integer DEFAULT 0,
  feedback_consent boolean NOT NULL DEFAULT false,
  case_study_interest boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_beta_workspace_profiles_status ON public.beta_workspace_profiles (beta_status);

ALTER TABLE public.beta_workspace_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "beta_wp members read" ON public.beta_workspace_profiles
  FOR SELECT TO authenticated
  USING (public.is_workspace_member(workspace_id));

CREATE POLICY "beta_wp admin all" ON public.beta_workspace_profiles
  FOR ALL TO authenticated
  USING (public.is_platform_admin())
  WITH CHECK (public.is_platform_admin());

CREATE POLICY "beta_wp service role" ON public.beta_workspace_profiles
  FOR ALL TO public
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE TRIGGER update_beta_workspace_profiles_updated_at
  BEFORE UPDATE ON public.beta_workspace_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- beta_feedback
-- ============================================================
CREATE TABLE public.beta_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL,
  request_id uuid,
  submission_id uuid,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  was_useful boolean,
  feedback_text text,
  source text DEFAULT 'in_app',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_beta_feedback_workspace ON public.beta_feedback (workspace_id);

ALTER TABLE public.beta_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "beta_feedback members insert" ON public.beta_feedback
  FOR INSERT TO authenticated
  WITH CHECK (public.is_workspace_member(workspace_id));

CREATE POLICY "beta_feedback members read" ON public.beta_feedback
  FOR SELECT TO authenticated
  USING (public.is_workspace_member(workspace_id));

CREATE POLICY "beta_feedback admin read" ON public.beta_feedback
  FOR SELECT TO authenticated
  USING (public.is_platform_admin());

CREATE POLICY "beta_feedback service role" ON public.beta_feedback
  FOR ALL TO public
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
