alter table public.marketing_live_leads
  add column if not exists followup_sent_at timestamptz,
  add column if not exists followup_channel text,
  add column if not exists followup_error text;

create index if not exists marketing_live_leads_followup_sent_idx
  on public.marketing_live_leads (followup_sent_at);
