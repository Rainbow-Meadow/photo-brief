-- DB-side credit accounting for successful AI work.
--
-- This complements the credit ledger by logging usage when the app persists
-- successful AI results. It is intentionally conservative and idempotent:
-- one photo-check credit per captured_media per billing period, and one summary
-- credit per submission per billing period.

create or replace function public.log_ai_photo_check_credit_from_result()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_workspace_id uuid;
  v_request_id uuid;
  v_exists boolean;
begin
  select s.workspace_id, s.request_id
    into v_workspace_id, v_request_id
  from public.captured_media cm
  join public.submissions s on s.id = cm.submission_id
  where cm.id = new.captured_media_id;

  if v_workspace_id is null then
    return new;
  end if;

  select exists(
    select 1
    from public.usage_events ue
    where ue.workspace_id = v_workspace_id
      and ue.event_type = 'ai_photo_check'
      and ue.related_id = new.captured_media_id
      and ue.created_at >= public.current_period_start_for_workspace(v_workspace_id)
  ) into v_exists;

  if not v_exists then
    perform public.log_credit_usage(
      v_workspace_id,
      'ai_photo_check',
      'captured_media',
      new.captured_media_id,
      jsonb_build_object('request_id', v_request_id, 'source', 'ai_check_results_trigger'),
      1
    );
  end if;

  return new;
end;
$$;

drop trigger if exists ai_check_results_credit_usage_trigger on public.ai_check_results;
create trigger ai_check_results_credit_usage_trigger
  after insert on public.ai_check_results
  for each row execute function public.log_ai_photo_check_credit_from_result();

create or replace function public.log_submission_summary_credit_from_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_exists boolean;
begin
  if new.workspace_id is null or new.ai_summary is null or new.ai_summary = '' then
    return new;
  end if;

  if old.ai_summary is not distinct from new.ai_summary then
    return new;
  end if;

  select exists(
    select 1
    from public.usage_events ue
    where ue.workspace_id = new.workspace_id
      and ue.event_type = 'ai_submission_summary'
      and ue.related_id = new.id
      and ue.created_at >= public.current_period_start_for_workspace(new.workspace_id)
  ) into v_exists;

  if not v_exists then
    perform public.log_credit_usage(
      new.workspace_id,
      'ai_submission_summary',
      'submission',
      new.id,
      jsonb_build_object('request_id', new.request_id, 'source', 'submissions_ai_summary_trigger'),
      1
    );
  end if;

  return new;
end;
$$;

drop trigger if exists submissions_summary_credit_usage_trigger on public.submissions;
create trigger submissions_summary_credit_usage_trigger
  after update of ai_summary on public.submissions
  for each row execute function public.log_submission_summary_credit_from_update();
