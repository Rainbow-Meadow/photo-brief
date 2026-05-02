-- DB-side credit accounting for successful AI work.
--
-- Customer-facing model:
-- - 1 submitted/analyzed photo = 1 PhotoBrief Credit.
-- - Basic AI quality checks and submission summaries are included.
-- - First-pass guarantee: follow-up/resubmission photos requested after a
--   rejected first pass do not consume credits.
--
-- This is intentionally conservative and idempotent: one photo credit per
-- captured_media per billing period unless it is identified as a free follow-up.

create or replace function public.log_ai_photo_check_credit_from_result()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_workspace_id uuid;
  v_request_id uuid;
  v_submission_id uuid;
  v_step_id uuid;
  v_exists boolean;
  v_is_followup boolean := false;
  v_event_type text := 'ai_photo_check';
  v_credit_cost numeric := 1;
begin
  select s.workspace_id, s.request_id, s.id, cm.step_id
    into v_workspace_id, v_request_id, v_submission_id, v_step_id
  from public.captured_media cm
  join public.submissions s on s.id = cm.submission_id
  where cm.id = new.captured_media_id;

  if v_workspace_id is null then
    return new;
  end if;

  -- First-pass guarantee: when a customer resubmits a photo for a step that was
  -- previously rejected on the same submission/request, do not charge a second
  -- credit for the follow-up photo. This keeps the customer promise simple:
  -- if PhotoBrief asks for rework, the follow-up does not consume credits.
  if v_step_id is not null then
    select exists(
      select 1
      from public.captured_media prior
      where prior.submission_id = v_submission_id
        and prior.step_id = v_step_id
        and prior.id <> new.captured_media_id
        and prior.status in ('rejected', 'resubmitted')
    ) into v_is_followup;
  end if;

  if v_is_followup then
    v_event_type := 'first_pass_followup_photo';
    v_credit_cost := 0;
  end if;

  select exists(
    select 1
    from public.usage_events ue
    where ue.workspace_id = v_workspace_id
      and ue.related_id = new.captured_media_id
      and ue.event_type in ('ai_photo_check', 'first_pass_followup_photo')
      and ue.created_at >= public.current_period_start_for_workspace(v_workspace_id)
  ) into v_exists;

  if not v_exists then
    perform public.log_credit_usage(
      v_workspace_id,
      v_event_type,
      'captured_media',
      new.captured_media_id,
      jsonb_build_object(
        'request_id', v_request_id,
        'submission_id', v_submission_id,
        'step_id', v_step_id,
        'source', 'ai_check_results_trigger',
        'first_pass_guarantee', v_is_followup
      ),
      v_credit_cost,
      case when v_is_followup then 'guarantee' else 'usage' end
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
      jsonb_build_object('request_id', new.request_id, 'source', 'submissions_ai_summary_trigger', 'included_with_photo_credits', true),
      0,
      'usage'
    );
  end if;

  return new;
end;
$$;

drop trigger if exists submissions_summary_credit_usage_trigger on public.submissions;
create trigger submissions_summary_credit_usage_trigger
  after update of ai_summary on public.submissions
  for each row execute function public.log_submission_summary_credit_from_update();
