alter table public.marketing_live_leads
  add column if not exists customer_id uuid references public.customers(id) on delete set null,
  add column if not exists request_id uuid references public.photo_brief_requests(id) on delete set null,
  add column if not exists request_token text,
  add column if not exists request_url text,
  add column if not exists converted_at timestamptz,
  add column if not exists conversion_error text;

create index if not exists marketing_live_leads_request_idx on public.marketing_live_leads (request_id);
create index if not exists marketing_live_leads_customer_idx on public.marketing_live_leads (customer_id);
