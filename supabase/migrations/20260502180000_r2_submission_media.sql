-- R2-backed submission media metadata.
--
-- Supabase remains the source of truth for ownership, authorization, review,
-- credits, and AI feedback. R2 stores only image blobs.
--
-- Existing `captured_media.file_url` is kept for backward compatibility with
-- Supabase Storage paths. New code should prefer processed_storage_key and
-- storage_provider = 'r2'.

alter table if exists public.captured_media
  add column if not exists storage_provider text not null default 'supabase',
  add column if not exists original_storage_key text null,
  add column if not exists processed_storage_key text null,
  add column if not exists preview_storage_key text null,
  add column if not exists thumbnail_storage_key text null,
  add column if not exists original_mime_type text null,
  add column if not exists mime_type text null,
  add column if not exists original_size_bytes bigint null,
  add column if not exists file_size_bytes bigint null,
  add column if not exists width integer null,
  add column if not exists height integer null,
  add column if not exists checksum_sha256 text null,
  add column if not exists processing_status text not null default 'legacy',
  add column if not exists processing_error text null,
  add column if not exists processed_at timestamptz null,
  add column if not exists uploaded_at timestamptz null;

create index if not exists captured_media_storage_provider_idx
  on public.captured_media(storage_provider);

create index if not exists captured_media_processing_status_idx
  on public.captured_media(processing_status);

create index if not exists captured_media_original_storage_key_idx
  on public.captured_media(original_storage_key)
  where original_storage_key is not null;

create index if not exists captured_media_processed_storage_key_idx
  on public.captured_media(processed_storage_key)
  where processed_storage_key is not null;

comment on column public.captured_media.storage_provider is 'Media storage backend. Legacy rows use supabase; new submission media should use r2.';
comment on column public.captured_media.original_storage_key is 'Temporary/original object key in R2, typically under temp/.';
comment on column public.captured_media.processed_storage_key is 'Final full-size processed WebP object key in R2.';
comment on column public.captured_media.preview_storage_key is 'Preview-size processed WebP object key in R2.';
comment on column public.captured_media.thumbnail_storage_key is 'Thumbnail processed WebP object key in R2.';
comment on column public.captured_media.processing_status is 'Media pipeline status: legacy, pending_upload, uploaded_original, ai_processing, converting, ready, failed.';
