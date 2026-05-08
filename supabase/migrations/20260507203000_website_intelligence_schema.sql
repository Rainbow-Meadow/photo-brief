-- Website Intelligence: scans, service extraction, intake blueprints, routing rules, and change proposals.
-- This is the spine for turning a business website into a smart PhotoBrief intake.

CREATE TABLE IF NOT EXISTS public.business_intake_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid REFERENCES public.business_workspaces(id) ON DELETE CASCADE,
  beta_application_id uuid REFERENCES public.beta_applications(id) ON DELETE SET NULL,
  website_url text NOT NULL,
  current_intake_method text,
  lead_destination_type text DEFAULT 'email',
  lead_destination_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  primary_goal text NOT NULL DEFAULT 'replace_or_augment_website_form',
  install_mode text NOT NULL DEFAULT 'hosted_link',
  routing_question text,
  status text NOT NULL DEFAULT 'draft',
  latest_scan_job_id uuid,
  approved_blueprint_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT business_intake_profiles_status_check CHECK (status IN ('draft', 'reviewing', 'approved', 'active', 'paused', 'archived')),
  CONSTRAINT business_intake_profiles_install_mode_check CHECK (install_mode IN ('hosted_link', 'embed', 'replace_form', 'unknown'))
);

CREATE TABLE IF NOT EXISTS public.website_scan_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid REFERENCES public.business_workspaces(id) ON DELETE CASCADE,
  beta_application_id uuid REFERENCES public.beta_applications(id) ON DELETE SET NULL,
  profile_id uuid REFERENCES public.business_intake_profiles(id) ON DELETE SET NULL,
  root_url text NOT NULL,
  status text NOT NULL DEFAULT 'queued',
  scan_type text NOT NULL DEFAULT 'manual',
  started_at timestamptz,
  completed_at timestamptz,
  error text,
  pages_scanned_count integer NOT NULL DEFAULT 0,
  forms_detected_count integer NOT NULL DEFAULT 0,
  services_detected_count integer NOT NULL DEFAULT 0,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT website_scan_jobs_status_check CHECK (status IN ('queued', 'running', 'completed', 'failed')),
  CONSTRAINT website_scan_jobs_scan_type_check CHECK (scan_type IN ('initial', 'manual', 'scheduled', 'rescan'))
);

CREATE TABLE IF NOT EXISTS public.website_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid REFERENCES public.business_workspaces(id) ON DELETE CASCADE,
  beta_application_id uuid REFERENCES public.beta_applications(id) ON DELETE SET NULL,
  scan_job_id uuid NOT NULL REFERENCES public.website_scan_jobs(id) ON DELETE CASCADE,
  url text NOT NULL,
  title text,
  meta_description text,
  h1 text,
  page_type text NOT NULL DEFAULT 'unknown',
  text_excerpt text,
  content_hash text NOT NULL,
  headings jsonb NOT NULL DEFAULT '[]'::jsonb,
  ctas jsonb NOT NULL DEFAULT '[]'::jsonb,
  first_seen_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT website_pages_page_type_check CHECK (page_type IN ('home', 'service', 'product', 'contact', 'form', 'pricing', 'faq', 'about', 'unknown'))
);

CREATE TABLE IF NOT EXISTS public.website_forms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid REFERENCES public.business_workspaces(id) ON DELETE CASCADE,
  beta_application_id uuid REFERENCES public.beta_applications(id) ON DELETE SET NULL,
  scan_job_id uuid NOT NULL REFERENCES public.website_scan_jobs(id) ON DELETE CASCADE,
  page_url text NOT NULL,
  form_action text,
  method text,
  field_names text[] NOT NULL DEFAULT '{}'::text[],
  field_labels text[] NOT NULL DEFAULT '{}'::text[],
  required_fields text[] NOT NULL DEFAULT '{}'::text[],
  button_text text,
  nearby_heading text,
  nearby_copy text,
  inferred_purpose text NOT NULL DEFAULT 'unknown',
  quality_score integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT website_forms_quality_score_check CHECK (quality_score BETWEEN 0 AND 100)
);

CREATE TABLE IF NOT EXISTS public.service_catalog_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid REFERENCES public.business_workspaces(id) ON DELETE CASCADE,
  beta_application_id uuid REFERENCES public.beta_applications(id) ON DELETE SET NULL,
  profile_id uuid REFERENCES public.business_intake_profiles(id) ON DELETE SET NULL,
  scan_job_id uuid REFERENCES public.website_scan_jobs(id) ON DELETE SET NULL,
  source_url text,
  name text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'general',
  keywords text[] NOT NULL DEFAULT '{}'::text[],
  customer_intent text NOT NULL DEFAULT 'general_inquiry',
  recommended_template_type text NOT NULL DEFAULT 'general_intake',
  confidence_score numeric(4,3) NOT NULL DEFAULT 0.5,
  status text NOT NULL DEFAULT 'proposed',
  first_seen_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT service_catalog_items_status_check CHECK (status IN ('proposed', 'approved', 'ignored', 'archived'))
);

CREATE TABLE IF NOT EXISTS public.intake_blueprints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid REFERENCES public.business_workspaces(id) ON DELETE CASCADE,
  beta_application_id uuid REFERENCES public.beta_applications(id) ON DELETE SET NULL,
  profile_id uuid REFERENCES public.business_intake_profiles(id) ON DELETE SET NULL,
  source_scan_job_id uuid REFERENCES public.website_scan_jobs(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'draft',
  routing_question text NOT NULL DEFAULT 'What do you need help with?',
  summary text,
  install_recommendation text,
  customer_experience jsonb NOT NULL DEFAULT '{}'::jsonb,
  lead_packet_plan jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  approved_at timestamptz,
  CONSTRAINT intake_blueprints_status_check CHECK (status IN ('draft', 'reviewing', 'approved', 'active', 'superseded', 'archived'))
);

CREATE TABLE IF NOT EXISTS public.intake_routing_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid REFERENCES public.business_workspaces(id) ON DELETE CASCADE,
  beta_application_id uuid REFERENCES public.beta_applications(id) ON DELETE SET NULL,
  blueprint_id uuid NOT NULL REFERENCES public.intake_blueprints(id) ON DELETE CASCADE,
  label text NOT NULL,
  customer_description text,
  match_keywords text[] NOT NULL DEFAULT '{}'::text[],
  service_catalog_item_ids uuid[] NOT NULL DEFAULT '{}'::uuid[],
  template_type text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  is_fallback boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.website_change_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid REFERENCES public.business_workspaces(id) ON DELETE CASCADE,
  beta_application_id uuid REFERENCES public.beta_applications(id) ON DELETE SET NULL,
  scan_job_id uuid REFERENCES public.website_scan_jobs(id) ON DELETE CASCADE,
  change_type text NOT NULL,
  subject_url text,
  before jsonb,
  after jsonb,
  recommendation text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT website_change_events_change_type_check CHECK (change_type IN ('new_page', 'removed_page', 'changed_page', 'new_form', 'changed_form', 'new_service', 'removed_service')),
  CONSTRAINT website_change_events_status_check CHECK (status IN ('pending', 'accepted', 'ignored', 'review_later'))
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'business_intake_profiles_latest_scan_fk'
  ) THEN
    ALTER TABLE public.business_intake_profiles
      ADD CONSTRAINT business_intake_profiles_latest_scan_fk
      FOREIGN KEY (latest_scan_job_id) REFERENCES public.website_scan_jobs(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'business_intake_profiles_approved_blueprint_fk'
  ) THEN
    ALTER TABLE public.business_intake_profiles
      ADD CONSTRAINT business_intake_profiles_approved_blueprint_fk
      FOREIGN KEY (approved_blueprint_id) REFERENCES public.intake_blueprints(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_business_intake_profiles_workspace ON public.business_intake_profiles(workspace_id);
CREATE INDEX IF NOT EXISTS idx_business_intake_profiles_beta_app ON public.business_intake_profiles(beta_application_id);
CREATE INDEX IF NOT EXISTS idx_website_scan_jobs_workspace ON public.website_scan_jobs(workspace_id);
CREATE INDEX IF NOT EXISTS idx_website_scan_jobs_beta_app ON public.website_scan_jobs(beta_application_id);
CREATE INDEX IF NOT EXISTS idx_website_scan_jobs_status ON public.website_scan_jobs(status);
CREATE INDEX IF NOT EXISTS idx_website_pages_scan ON public.website_pages(scan_job_id);
CREATE INDEX IF NOT EXISTS idx_website_pages_url ON public.website_pages(url);
CREATE INDEX IF NOT EXISTS idx_website_pages_hash ON public.website_pages(content_hash);
CREATE INDEX IF NOT EXISTS idx_website_forms_scan ON public.website_forms(scan_job_id);
CREATE INDEX IF NOT EXISTS idx_service_catalog_items_profile ON public.service_catalog_items(profile_id);
CREATE INDEX IF NOT EXISTS idx_service_catalog_items_scan ON public.service_catalog_items(scan_job_id);
CREATE INDEX IF NOT EXISTS idx_service_catalog_items_status ON public.service_catalog_items(status);
CREATE INDEX IF NOT EXISTS idx_intake_blueprints_profile ON public.intake_blueprints(profile_id);
CREATE INDEX IF NOT EXISTS idx_intake_routing_rules_blueprint ON public.intake_routing_rules(blueprint_id);
CREATE INDEX IF NOT EXISTS idx_website_change_events_scan ON public.website_change_events(scan_job_id);
CREATE INDEX IF NOT EXISTS idx_website_change_events_status ON public.website_change_events(status);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_business_intake_profiles_updated_at') THEN
      CREATE TRIGGER update_business_intake_profiles_updated_at
        BEFORE UPDATE ON public.business_intake_profiles
        FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_service_catalog_items_updated_at') THEN
      CREATE TRIGGER update_service_catalog_items_updated_at
        BEFORE UPDATE ON public.service_catalog_items
        FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
  END IF;
END $$;

ALTER TABLE public.business_intake_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_scan_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_catalog_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intake_blueprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intake_routing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_change_events ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  tbl text;
  policy_name text;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'business_intake_profiles',
    'website_scan_jobs',
    'website_pages',
    'website_forms',
    'service_catalog_items',
    'intake_blueprints',
    'intake_routing_rules',
    'website_change_events'
  ] LOOP
    policy_name := tbl || '_platform_admin_all';
    IF NOT EXISTS (
      SELECT 1
      FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename = tbl
        AND policyname = policy_name
    ) THEN
      EXECUTE format(
        'CREATE POLICY %I ON public.%I FOR ALL USING (EXISTS (SELECT 1 FROM public.platform_admins pa WHERE pa.user_id = auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM public.platform_admins pa WHERE pa.user_id = auth.uid()))',
        policy_name,
        tbl
      );
    END IF;
  END LOOP;
END $$;
