-- Standardize AI photo assessment issue categories.
--
-- The product is pre-launch, but this migration is additive so it is safe for
-- managed Supabase/Lovable environments. Runtime code now normalizes AI output
-- into these six issue types.

alter type public.ai_check_type add value if not exists 'wrong_subject';
alter type public.ai_check_type add value if not exists 'too_dark';
alter type public.ai_check_type add value if not exists 'blurry';
alter type public.ai_check_type add value if not exists 'label_unreadable';
alter type public.ai_check_type add value if not exists 'glare';
alter type public.ai_check_type add value if not exists 'too_close_or_cropped';
