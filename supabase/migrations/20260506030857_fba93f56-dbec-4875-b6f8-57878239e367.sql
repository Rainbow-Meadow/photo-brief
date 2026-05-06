-- Add R2 media storage columns to captured_media
ALTER TABLE public.captured_media
  ADD COLUMN IF NOT EXISTS storage_provider text NOT NULL DEFAULT 'supabase',
  ADD COLUMN IF NOT EXISTS original_storage_key text NULL,
  ADD COLUMN IF NOT EXISTS processed_storage_key text NULL,
  ADD COLUMN IF NOT EXISTS preview_storage_key text NULL,
  ADD COLUMN IF NOT EXISTS thumbnail_storage_key text NULL,
  ADD COLUMN IF NOT EXISTS original_mime_type text NULL,
  ADD COLUMN IF NOT EXISTS mime_type text NULL,
  ADD COLUMN IF NOT EXISTS original_size_bytes bigint NULL,
  ADD COLUMN IF NOT EXISTS file_size_bytes bigint NULL,
  ADD COLUMN IF NOT EXISTS width integer NULL,
  ADD COLUMN IF NOT EXISTS height integer NULL,
  ADD COLUMN IF NOT EXISTS checksum_sha256 text NULL,
  ADD COLUMN IF NOT EXISTS processing_status text NOT NULL DEFAULT 'legacy',
  ADD COLUMN IF NOT EXISTS processing_error text NULL,
  ADD COLUMN IF NOT EXISTS processed_at timestamptz NULL,
  ADD COLUMN IF NOT EXISTS uploaded_at timestamptz NULL;

CREATE INDEX IF NOT EXISTS captured_media_storage_provider_idx
  ON public.captured_media(storage_provider);

CREATE INDEX IF NOT EXISTS captured_media_processing_status_idx
  ON public.captured_media(processing_status);

CREATE INDEX IF NOT EXISTS captured_media_original_storage_key_idx
  ON public.captured_media(original_storage_key)
  WHERE original_storage_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS captured_media_processed_storage_key_idx
  ON public.captured_media(processed_storage_key)
  WHERE processed_storage_key IS NOT NULL;