# R2 submission media architecture

PhotoBrief keeps Supabase as the source of truth and moves customer-submitted media blobs to Cloudflare R2.

## Ownership split

Supabase remains authoritative for:

- workspaces
- requests
- submissions
- captured media rows
- AI feedback
- review status
- credit usage
- customer answers
- extracted details

Cloudflare R2 stores only image blobs.

## Bucket

Bucket name:

```text
photobrief-media
```

Object layout:

```text
temp/{workspaceId}/{requestId}/{submissionId}/{mediaId}/original.{ext}
submissions/{workspaceId}/{requestId}/{submissionId}/{mediaId}/full.webp
submissions/{workspaceId}/{requestId}/{submissionId}/{mediaId}/preview.webp
submissions/{workspaceId}/{requestId}/{submissionId}/{mediaId}/thumb.webp
failed-processing/...
```

## Runtime secrets

Cloudflare account/API secrets can provision the bucket, CORS, and lifecycle rules. Runtime object signing requires R2 S3-compatible credentials in Supabase Edge Function secrets:

```text
R2_ACCOUNT_ID=<cloudflare account id>
R2_ACCESS_KEY_ID=<R2 S3 access key id>
R2_SECRET_ACCESS_KEY=<R2 S3 secret access key>
R2_BUCKET_NAME=photobrief-media
```

The Cloudflare zone API token is not a substitute for the R2 S3 access key pair. It can manage Cloudflare resources, but the app needs S3 credentials to sign object PUT/GET URLs.

## Upload flow

1. Recipient captures a photo in the browser.
2. Browser calls `create-media-upload` with request/workspace/step/submission context.
3. Edge Function verifies request token or workspace membership.
4. Edge Function creates/uses a `submissions` row.
5. Edge Function creates a `captured_media` row with:
   - `storage_provider = 'r2'`
   - `processing_status = 'pending_upload'`
   - `original_storage_key = temp/.../original.ext`
6. Edge Function returns a short-lived signed R2 PUT URL.
7. Browser uploads the original image to temporary R2.
8. Browser calls `finalize-media-upload`.
9. Edge Function validates that the original object exists and returns a short-lived signed GET URL for AI.
10. AI analyzes the original.
11. If the photo passes, AI is unavailable, or the user chooses “use anyway,” the browser converts the accepted image to WebP variants.
12. Browser requests signed variant PUT URLs from `get-media-upload-url` for the verified media row.
13. Browser uploads `full.webp`, `preview.webp`, and `thumb.webp` to permanent R2 keys.
14. Browser calls `finalize-media-upload` with processed metadata.
15. Supabase row is updated to:
   - `processing_status = 'ready'`
   - `processed_storage_key = submissions/.../full.webp`
   - `preview_storage_key = submissions/.../preview.webp`
   - `thumbnail_storage_key = submissions/.../thumb.webp`
   - `mime_type = image/webp`

## Why conversion happens after AI

AI gets the uploaded original or high-quality temporary object. This preserves detail for model plates, serial numbers, damage, labels, and low-contrast information.

Permanent business-facing storage is WebP. This reduces storage, bandwidth, and review-page load time.

Rejected/retaken originals are not promoted. They remain under `temp/` and expire by lifecycle rule.

## Functions added

- `_shared/r2Storage.ts` — R2 signing/key helpers.
- `create-media-upload` — creates media row and signed original PUT URL.
- `finalize-media-upload` — validates original, updates final metadata, returns AI read URL.
- `get-media-upload-url` — returns signed PUT URL for verified processed WebP variant.
- `get-media-url` — returns signed GET URL for review/display.

## Database migration

`20260502180000_r2_submission_media.sql` adds R2 metadata columns to `captured_media`, while keeping legacy `file_url` support.

Important columns:

- `storage_provider`
- `original_storage_key`
- `processed_storage_key`
- `preview_storage_key`
- `thumbnail_storage_key`
- `original_mime_type`
- `mime_type`
- `original_size_bytes`
- `file_size_bytes`
- `width`
- `height`
- `checksum_sha256`
- `processing_status`
- `processing_error`
- `processed_at`
- `uploaded_at`

## Lifecycle

Provisioning script applies lifecycle rules:

- `temp/` expires after 3 days.
- abandoned multipart uploads expire after 1 day.
- `failed-processing/` expires after 14 days.

## CORS

Provisioning script applies R2 CORS allowing browser `PUT`, `GET`, and `HEAD` from:

- `https://photobrief.ai`
- `https://www.photobrief.ai`
- local dev origins

## Backfill plan

Legacy Supabase Storage media can be backfilled later:

1. Read `captured_media` rows where `storage_provider = 'supabase'` and `file_url is not null`.
2. Download original from Supabase Storage.
3. Convert to WebP variants.
4. Upload to R2 permanent keys.
5. Update the same row with R2 metadata and `storage_provider = 'r2'`.
6. Keep `file_url` fallback until verification.
7. Delete Supabase originals only after spot-checking.

Do not do destructive deletion in the same step as backfill.

## Post-deploy smoke test

1. Confirm R2 bucket exists in Cloudflare.
2. Confirm Supabase Edge Function secrets include R2 S3 credentials.
3. Open a recipient link.
4. Submit one accepted photo.
5. Confirm `captured_media.storage_provider = 'r2'`.
6. Confirm `original_storage_key` starts with `temp/`.
7. Confirm accepted media has `processed_storage_key`, `preview_storage_key`, and `thumbnail_storage_key`.
8. Confirm final keys exist in R2.
9. Confirm review page loads the signed R2 media URL.
10. Submit a failed/retaken photo and confirm it is not promoted to permanent `submissions/` storage.
