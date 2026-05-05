
-- ============================================================
-- 1. intake_sources
-- ============================================================
CREATE TABLE public.intake_sources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL,
  name TEXT NOT NULL DEFAULT 'Website intake',
  public_token TEXT NOT NULL DEFAULT encode(extensions.gen_random_bytes(12), 'hex'),
  enabled BOOLEAN NOT NULL DEFAULT true,
  default_guide_id UUID,
  intro_message TEXT,
  auto_send BOOLEAN NOT NULL DEFAULT false,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (workspace_id, public_token)
);

ALTER TABLE public.intake_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "intake_sources read by members" ON public.intake_sources
  FOR SELECT TO authenticated USING (is_workspace_member(workspace_id));

CREATE POLICY "intake_sources write by members" ON public.intake_sources
  FOR ALL TO authenticated
  USING (is_workspace_member(workspace_id))
  WITH CHECK (is_workspace_member(workspace_id));

CREATE TRIGGER update_intake_sources_updated_at
  BEFORE UPDATE ON public.intake_sources
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- 2. intake_field_mappings
-- ============================================================
CREATE TABLE public.intake_field_mappings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  intake_source_id UUID NOT NULL REFERENCES public.intake_sources(id) ON DELETE CASCADE,
  photobrief_field TEXT NOT NULL,
  external_field TEXT NOT NULL
);

ALTER TABLE public.intake_field_mappings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "intake_field_mappings read by members" ON public.intake_field_mappings
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.intake_sources s
    WHERE s.id = intake_field_mappings.intake_source_id
      AND is_workspace_member(s.workspace_id)
  ));

CREATE POLICY "intake_field_mappings write by members" ON public.intake_field_mappings
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.intake_sources s
    WHERE s.id = intake_field_mappings.intake_source_id
      AND is_workspace_member(s.workspace_id)
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.intake_sources s
    WHERE s.id = intake_field_mappings.intake_source_id
      AND is_workspace_member(s.workspace_id)
  ));

-- ============================================================
-- 3. intake_template_rules
-- ============================================================
CREATE TABLE public.intake_template_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  intake_source_id UUID NOT NULL REFERENCES public.intake_sources(id) ON DELETE CASCADE,
  match_type TEXT NOT NULL DEFAULT 'exact',
  match_value TEXT NOT NULL,
  guide_id UUID NOT NULL,
  priority INTEGER NOT NULL DEFAULT 0,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.intake_template_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "intake_template_rules read by members" ON public.intake_template_rules
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.intake_sources s
    WHERE s.id = intake_template_rules.intake_source_id
      AND is_workspace_member(s.workspace_id)
  ));

CREATE POLICY "intake_template_rules write by members" ON public.intake_template_rules
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.intake_sources s
    WHERE s.id = intake_template_rules.intake_source_id
      AND is_workspace_member(s.workspace_id)
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.intake_sources s
    WHERE s.id = intake_template_rules.intake_source_id
      AND is_workspace_member(s.workspace_id)
  ));

-- ============================================================
-- 4. intake_events
-- ============================================================
CREATE TABLE public.intake_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL,
  intake_source_id UUID REFERENCES public.intake_sources(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'received',
  request_type TEXT,
  message TEXT,
  error TEXT,
  normalized_customer JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_request_id UUID,
  matched_guide_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.intake_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "intake_events read by members" ON public.intake_events
  FOR SELECT TO authenticated USING (is_workspace_member(workspace_id));

CREATE POLICY "intake_events write by members" ON public.intake_events
  FOR ALL TO authenticated
  USING (is_workspace_member(workspace_id))
  WITH CHECK (is_workspace_member(workspace_id));

-- ============================================================
-- 5. integration_connections
-- ============================================================
CREATE TABLE public.integration_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL,
  provider_key TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'not_connected',
  connection_key TEXT NOT NULL DEFAULT encode(extensions.gen_random_bytes(12), 'hex'),
  display_name TEXT,
  connected_account TEXT,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  last_success_at TIMESTAMPTZ,
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (workspace_id, provider_key)
);

ALTER TABLE public.integration_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "integration_connections read by members" ON public.integration_connections
  FOR SELECT TO authenticated USING (is_workspace_member(workspace_id));

CREATE POLICY "integration_connections write by members" ON public.integration_connections
  FOR ALL TO authenticated
  USING (is_workspace_member(workspace_id))
  WITH CHECK (is_workspace_member(workspace_id));

CREATE TRIGGER update_integration_connections_updated_at
  BEFORE UPDATE ON public.integration_connections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- 6. submission_answers
-- ============================================================
CREATE TABLE public.submission_answers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id UUID NOT NULL,
  request_id UUID NOT NULL,
  workspace_id UUID NOT NULL,
  question_id UUID,
  prompt TEXT NOT NULL,
  answer TEXT NOT NULL DEFAULT '',
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.submission_answers ENABLE ROW LEVEL SECURITY;

-- Workspace members can read answers
CREATE POLICY "submission_answers read by members" ON public.submission_answers
  FOR SELECT TO authenticated USING (is_workspace_member(workspace_id));

-- Token-based access for recipients (insert, update, delete their own answers)
CREATE POLICY "submission_answers insert by token" ON public.submission_answers
  FOR INSERT TO anon, authenticated
  WITH CHECK (request_id = request_id_for_token());

CREATE POLICY "submission_answers read by token" ON public.submission_answers
  FOR SELECT TO anon, authenticated
  USING (request_id = request_id_for_token());

CREATE POLICY "submission_answers update by token" ON public.submission_answers
  FOR UPDATE TO anon, authenticated
  USING (request_id = request_id_for_token())
  WITH CHECK (request_id = request_id_for_token());

CREATE POLICY "submission_answers delete by token" ON public.submission_answers
  FOR DELETE TO anon, authenticated
  USING (request_id = request_id_for_token());

-- Workspace members can also manage answers
CREATE POLICY "submission_answers write by members" ON public.submission_answers
  FOR ALL TO authenticated
  USING (is_workspace_member(workspace_id))
  WITH CHECK (is_workspace_member(workspace_id));
