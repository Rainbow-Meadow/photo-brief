/**
 * Shared KV bundle helpers for the public recipient page.
 *
 * The recipient page (/r/:token) is fully public, so we cache the assembled
 * bundle (request + brand profile + guide + steps) in Workers KV. Cache TTL
 * is 1 hour; explicit invalidation is triggered when the underlying records
 * change (see assistant-agent /invalidate-recipient route).
 *
 * Add to wrangler.toml:
 *   [[kv_namespaces]]
 *   binding = "RECIPIENT_BUNDLES"
 *   id      = "<namespace-id>"
 */

export interface KvNamespace {
  get(key: string, type?: "text" | "json"): Promise<unknown>;
  put(key: string, value: string, opts?: { expirationTtl?: number }): Promise<void>;
  delete(key: string): Promise<void>;
}

export const RECIPIENT_BUNDLE_TTL_SECONDS = 3600;

export function recipientCacheKey(token: string): string {
  return `recipient:${token}`;
}

export async function readRecipientBundle<T>(
  kv: KvNamespace | undefined,
  token: string,
): Promise<T | null> {
  if (!kv) return null;
  try {
    const cached = (await kv.get(recipientCacheKey(token), "json")) as T | null;
    return cached ?? null;
  } catch (err) {
    console.warn("KV recipient read failed", err);
    return null;
  }
}

export async function writeRecipientBundle<T>(
  kv: KvNamespace | undefined,
  token: string,
  bundle: T,
): Promise<void> {
  if (!kv) return;
  try {
    await kv.put(recipientCacheKey(token), JSON.stringify(bundle), {
      expirationTtl: RECIPIENT_BUNDLE_TTL_SECONDS,
    });
  } catch (err) {
    console.warn("KV recipient write failed", err);
  }
}

export async function invalidateRecipientBundle(
  kv: KvNamespace | undefined,
  token: string,
): Promise<void> {
  if (!kv) return;
  try {
    await kv.delete(recipientCacheKey(token));
  } catch (err) {
    console.warn("KV recipient delete failed", err);
  }
}
