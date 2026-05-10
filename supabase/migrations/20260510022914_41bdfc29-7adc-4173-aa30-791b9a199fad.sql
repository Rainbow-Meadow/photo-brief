
-- 1. is_demo flag for requests (so the cleanup job and notify-event can branch)
ALTER TABLE public.photo_brief_requests
  ADD COLUMN IF NOT EXISTS is_demo BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS photo_brief_requests_is_demo_created_idx
  ON public.photo_brief_requests (is_demo, created_at)
  WHERE is_demo = true;

-- 2. Demo workspace (hidden marketing sandbox).
-- Owner is the existing platform admin.
INSERT INTO public.business_workspaces (id, name, slug, owner_id, plan_tier, status, industry)
VALUES (
  'd0d0d0d0-d0d0-4d0d-d0d0-d0d0d0d0d0d0',
  'PhotoBrief Demo',
  'photobrief-demo',
  'd81470d6-1041-4a2d-ac37-00f046ddadec',
  'pro',
  'active',
  'demo'
)
ON CONFLICT (slug) DO NOTHING;

-- 3. Make the platform admin an active owner of the demo workspace.
INSERT INTO public.workspace_members (workspace_id, user_id, role, status)
SELECT
  (SELECT id FROM public.business_workspaces WHERE slug = 'photobrief-demo'),
  'd81470d6-1041-4a2d-ac37-00f046ddadec',
  'owner',
  'active'
ON CONFLICT (workspace_id, user_id) DO NOTHING;
