
-- Create contact method enum
CREATE TYPE public.contact_method AS ENUM ('email', 'sms', 'both', 'unknown');

-- Create customers table
CREATE TABLE public.customers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id uuid NOT NULL,
  display_name text NOT NULL,
  company_name text,
  email text,
  phone text,
  preferred_contact_method contact_method NOT NULL DEFAULT 'unknown',
  notes text,
  tags text[] NOT NULL DEFAULT '{}',
  metadata jsonb NOT NULL DEFAULT '{}',
  last_request_at timestamptz,
  archived_at timestamptz,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for fast workspace-scoped queries
CREATE INDEX idx_customers_workspace_name ON public.customers (workspace_id, display_name);
CREATE INDEX idx_customers_workspace_email ON public.customers (workspace_id, email) WHERE email IS NOT NULL;
CREATE INDEX idx_customers_workspace_phone ON public.customers (workspace_id, phone) WHERE phone IS NOT NULL;
CREATE INDEX idx_customers_workspace_recent ON public.customers (workspace_id, last_request_at DESC NULLS LAST);
CREATE INDEX idx_customers_tags ON public.customers USING GIN (tags);

-- Partial unique constraints within workspace
CREATE UNIQUE INDEX idx_customers_ws_email_unique ON public.customers (workspace_id, lower(email)) WHERE email IS NOT NULL AND archived_at IS NULL;
CREATE UNIQUE INDEX idx_customers_ws_phone_unique ON public.customers (workspace_id, phone) WHERE phone IS NOT NULL AND archived_at IS NULL;

-- Enable RLS
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "customers read by members"
  ON public.customers FOR SELECT
  TO authenticated
  USING (public.is_workspace_member(workspace_id));

CREATE POLICY "customers insert by members"
  ON public.customers FOR INSERT
  TO authenticated
  WITH CHECK (public.is_workspace_member(workspace_id));

CREATE POLICY "customers update by members"
  ON public.customers FOR UPDATE
  TO authenticated
  USING (public.is_workspace_member(workspace_id))
  WITH CHECK (public.is_workspace_member(workspace_id));

-- No hard delete policy — archive instead
-- But allow admins to delete if needed
CREATE POLICY "customers delete by admin"
  ON public.customers FOR DELETE
  TO authenticated
  USING (public.has_workspace_role(workspace_id, 'admin'));

-- Auto-update updated_at
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add customer_id to photo_brief_requests
ALTER TABLE public.photo_brief_requests
  ADD COLUMN customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL;

CREATE INDEX idx_requests_customer ON public.photo_brief_requests (customer_id) WHERE customer_id IS NOT NULL;
