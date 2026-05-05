/**
 * Shared AES-GCM encryption/decryption for integration OAuth tokens.
 * Tokens are stored as `v1.{base64-iv}.{base64-ciphertext}` in the
 * `integration_connections` table. The encryption key is derived from
 * a SHA-256 hash of the secret string.
 *
 * NEVER import this module from browser code — it must stay server-side.
 */

export function getTokenSecret(): string {
  return Deno.env.get('INTEGRATION_TOKEN_SECRET') ?? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
}

async function importKey(secret: string): Promise<CryptoKey> {
  const material = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(secret))
  return crypto.subtle.importKey('raw', material, 'AES-GCM', false, ['encrypt', 'decrypt'])
}

export async function encryptJson(value: unknown, secret?: string): Promise<string> {
  const key = await importKey(secret ?? getTokenSecret())
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encoded = new TextEncoder().encode(JSON.stringify(value))
  const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded)
  return `v1.${btoa(String.fromCharCode(...iv))}.${btoa(String.fromCharCode(...new Uint8Array(cipher)))}`
}

export async function decryptJson<T = unknown>(ciphertext: string, secret?: string): Promise<T> {
  if (!ciphertext || !ciphertext.startsWith('v1.')) {
    throw new Error('Invalid ciphertext format — expected v1.{iv}.{data}')
  }
  const [, ivB64, dataB64] = ciphertext.split('.')
  if (!ivB64 || !dataB64) throw new Error('Malformed ciphertext')

  const key = await importKey(secret ?? getTokenSecret())
  const iv = Uint8Array.from(atob(ivB64), (c) => c.charCodeAt(0))
  const data = Uint8Array.from(atob(dataB64), (c) => c.charCodeAt(0))
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data)
  return JSON.parse(new TextDecoder().decode(plain)) as T
}
