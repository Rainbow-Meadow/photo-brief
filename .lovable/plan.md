
# OAuth Wiring Plan for PhotoBrief.ai Connectors

## What I will build (code & infrastructure)

### 1. Add dedicated encryption secret
- Create `INTEGRATION_TOKEN_SECRET` via the secrets tool (you'll enter a random value)

### 2. Create shared token crypto utilities
- `supabase/functions/_shared/integration-crypto.ts` — shared `encryptJson` / `decryptJson` / `importKey` functions (extracted from the existing callback code to avoid duplication)

### 3. Create `integration-token-refresh` edge function
- Decrypts refresh token from `integration_connections`
- Calls the correct provider token endpoint (Google / Microsoft / HubSpot)
- Re-encrypts and stores the new access token + updated expiry
- Logs result to `integration_logs`

### 4. Create `integration-send-email` edge function
- Accepts `{ connectionId, to, subject, htmlBody, textBody }` from authenticated workspace members
- Decrypts access token from the connection row
- Auto-refreshes if expired
- **Gmail path**: builds RFC 2822 message, calls `gmail.users.messages.send`
- **Microsoft path**: calls Graph `me/sendMail` with JSON body
- Logs action to `integration_action_runs`
- Returns message ID for activity logging

### 5. Create `integration-disconnect` edge function
- Revokes tokens with each provider's revocation endpoint where supported
- Clears `access_token_ciphertext`, `refresh_token_ciphertext`
- Sets status to `disabled`
- Logs to `integration_logs`

### 6. Create `integration-health-check` edge function
- Decrypts access token, calls a lightweight provider endpoint (Google userinfo / Graph /me / HubSpot access-tokens)
- Updates `last_health_check_at` and `last_error`

### 7. Wire Gmail/Microsoft into `send-recipient-message`
- Add a `channel: "gmail" | "outlook"` option
- When selected, call `integration-send-email` instead of the Lovable transactional email path
- Fall back to Lovable email if no connection exists

### 8. Deploy all new edge functions

---

## What you must do manually (provider app registrations)

I'll provide exact step-by-step instructions after building the code, but in summary:

### Google Cloud Console (for Gmail + Google Sheets)
1. Go to console.cloud.google.com, create or select a project
2. Enable Gmail API and Google Sheets API
3. Configure OAuth consent screen (external, add `photobrief.ai` as authorized domain)
4. Create OAuth 2.0 Client ID (Web application)
5. Set redirect URI to: `https://mvlcefiygkzzewcdzsmj.supabase.co/functions/v1/integration-oauth-callback/google`
6. Copy the Client ID and Client Secret — I'll prompt you to enter them as secrets

### Microsoft Entra (for Outlook)
1. Go to entra.microsoft.com, register a new application
2. Add redirect URI (Web): `https://mvlcefiygkzzewcdzsmj.supabase.co/functions/v1/integration-oauth-callback/microsoft`
3. Add API permissions: `Mail.Send`, `User.Read`, `offline_access`, `openid`, `email`, `profile`
4. Create a client secret
5. Copy Application (client) ID and secret value — I'll prompt you to enter them

### HubSpot Developer Portal (for CRM)
1. Go to developers.hubspot.com, create an app
2. Set redirect URI: `https://mvlcefiygkzzewcdzsmj.supabase.co/functions/v1/integration-oauth-callback/hubspot`
3. Add scopes: `crm.objects.contacts.read`, `crm.objects.contacts.write`, `crm.objects.deals.read`, `crm.objects.deals.write`
4. Copy Client ID and Client Secret — I'll prompt you

---

## Secrets to be added (6 total)
- `INTEGRATION_TOKEN_SECRET` — random 32+ char string for AES-GCM encryption
- `GOOGLE_CLIENT_ID` — from Google Cloud Console
- `GOOGLE_CLIENT_SECRET` — from Google Cloud Console
- `MICROSOFT_CLIENT_ID` — from Microsoft Entra
- `MICROSOFT_CLIENT_SECRET` — from Microsoft Entra
- `HUBSPOT_CLIENT_ID` — from HubSpot Developer Portal
- `HUBSPOT_CLIENT_SECRET` — from HubSpot Developer Portal

---

## Files created/modified

| File | Action |
|---|---|
| `supabase/functions/_shared/integration-crypto.ts` | Create (shared encrypt/decrypt) |
| `supabase/functions/integration-token-refresh/index.ts` | Create |
| `supabase/functions/integration-send-email/index.ts` | Create |
| `supabase/functions/integration-disconnect/index.ts` | Create |
| `supabase/functions/integration-health-check/index.ts` | Create |
| `supabase/functions/integration-oauth-callback/index.ts` | Edit (import shared crypto) |
| `supabase/functions/send-recipient-message/index.ts` | Edit (add Gmail/Outlook channel) |

No database migrations needed — the existing schema covers everything.

---

## Order of operations

1. I build all the edge functions and deploy them
2. I prompt you for `INTEGRATION_TOKEN_SECRET` (you generate a random string)
3. I give you the exact Google/Microsoft/HubSpot registration steps with your specific redirect URIs
4. You register the apps and come back with the credentials
5. I prompt you for each pair of client ID + secret
6. You test by clicking "Connect" on Gmail in `/settings/integrations`
