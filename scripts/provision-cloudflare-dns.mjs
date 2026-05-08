#!/usr/bin/env node

/**
 * Idempotently provision a Cloudflare DNS record using CLOUDFLARE_API_TOKEN.
 *
 * Defaults provision:
 *   beta-agent.photobrief.ai CNAME photobrief.ai proxied=true
 *
 * Env overrides:
 *   ZONE_NAME=photobrief.ai
 *   RECORD_NAME=beta-agent
 *   RECORD_TYPE=CNAME
 *   RECORD_CONTENT=photobrief.ai
 *   RECORD_PROXIED=true
 */

const token = process.env.CLOUDFLARE_API_TOKEN;
const zoneName = process.env.ZONE_NAME ?? "photobrief.ai";
const shortName = process.env.RECORD_NAME ?? "beta-agent";
const type = process.env.RECORD_TYPE ?? "CNAME";
const content = process.env.RECORD_CONTENT ?? zoneName;
const proxied = (process.env.RECORD_PROXIED ?? "true") === "true";

if (!token) {
  console.error("CLOUDFLARE_API_TOKEN is required.");
  process.exit(1);
}

const fqdn = shortName.endsWith(`.${zoneName}`) ? shortName : `${shortName}.${zoneName}`;

async function cf(path, init = {}) {
  const res = await fetch(`https://api.cloudflare.com/client/v4${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  const body = await res.json().catch(() => null);
  if (!res.ok || !body?.success) {
    throw new Error(`${init.method ?? "GET"} ${path} failed (${res.status}): ${JSON.stringify(body)}`);
  }
  return body.result;
}

const zones = await cf(`/zones?name=${encodeURIComponent(zoneName)}&status=active`);
if (!Array.isArray(zones) || zones.length === 0) {
  throw new Error(`No active Cloudflare zone found for ${zoneName}.`);
}

const zoneId = zones[0].id;
console.log(`Zone: ${zoneName} (${zoneId})`);
console.log(`Desired record: ${type} ${fqdn} -> ${content} proxied=${proxied}`);

const existing = await cf(`/zones/${zoneId}/dns_records?name=${encodeURIComponent(fqdn)}&per_page=100`);
const matching = Array.isArray(existing) ? existing.find((record) => record.type === type) : null;
const payload = {
  type,
  name: fqdn,
  content,
  proxied,
  ttl: 1,
  comment: "Managed by PhotoBrief GitHub Actions DNS provisioning",
};

if (matching) {
  const alreadyCorrect =
    matching.content === content &&
    matching.proxied === proxied &&
    matching.type === type;
  if (alreadyCorrect) {
    console.log(`Record already correct: ${matching.id}`);
    process.exit(0);
  }
  const updated = await cf(`/zones/${zoneId}/dns_records/${matching.id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  console.log(`Updated record: ${updated.id}`);
  process.exit(0);
}

if (Array.isArray(existing) && existing.length > 0) {
  console.warn(`Found ${existing.length} existing DNS record(s) for ${fqdn}, but none are ${type}.`);
  console.warn("Leaving existing records untouched and creating the requested record may fail if Cloudflare detects a conflict.");
}

const created = await cf(`/zones/${zoneId}/dns_records`, {
  method: "POST",
  body: JSON.stringify(payload),
});
console.log(`Created record: ${created.id}`);
