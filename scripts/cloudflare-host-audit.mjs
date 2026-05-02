#!/usr/bin/env node

const DOMAIN = process.env.CF_AUDIT_DOMAIN || "photobrief.ai";
const TOKEN =
  process.env.CLOUDFLARE_API_TOKEN ||
  process.env.CLOUDFLARE_API_KEY ||
  process.env.CF_API_TOKEN ||
  process.env.CF_API_KEY;
const EMAIL = process.env.CLOUDFLARE_EMAIL || process.env.CF_EMAIL;

if (!TOKEN) {
  console.error("Missing Cloudflare token. Set CLOUDFLARE_API_TOKEN, CLOUDFLARE_API_KEY, CF_API_TOKEN, or CF_API_KEY as a repository secret.");
  process.exit(2);
}

const baseHeaders = TOKEN.startsWith("Bearer ") || TOKEN.startsWith("ey")
  ? { Authorization: TOKEN.startsWith("Bearer ") ? TOKEN : `Bearer ${TOKEN}` }
  : EMAIL
    ? { "X-Auth-Email": EMAIL, "X-Auth-Key": TOKEN }
    : { Authorization: `Bearer ${TOKEN}` };

const headers = { ...baseHeaders, "Content-Type": "application/json" };

async function cf(path, init = {}) {
  const res = await fetch(`https://api.cloudflare.com/client/v4${path}`, {
    ...init,
    headers: { ...headers, ...(init.headers || {}) },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.success === false) {
    const errors = Array.isArray(json.errors) ? json.errors.map((e) => e.message).join("; ") : res.statusText;
    throw new Error(`Cloudflare API ${path} failed: ${res.status} ${errors}`);
  }
  return json.result;
}

async function fetchHeaders(url) {
  const started = Date.now();
  const res = await fetch(url, { redirect: "manual" });
  return {
    url,
    status: res.status,
    ms: Date.now() - started,
    headers: Object.fromEntries(res.headers.entries()),
  };
}

function settingValue(settings, id) {
  return settings.find((s) => s.id === id)?.value;
}

function dnsSummary(records) {
  return records.map((r) => ({
    type: r.type,
    name: r.name,
    content: r.type === "TXT" ? "[redacted TXT]" : r.content,
    proxied: r.proxied ?? null,
    ttl: r.ttl,
  }));
}

function scoreSettings(settings, publicChecks) {
  const recs = [];
  const get = (id) => settingValue(settings, id);

  const checks = [
    ["brotli", "on", "Enable Brotli compression for smaller text assets."],
    ["http3", "on", "Enable HTTP/3 for faster mobile and lossy-network performance."],
    ["early_hints", "on", "Enable Early Hints where supported to improve navigation startup."],
    ["minify", null, "Enable HTML/CSS/JS minification unless your build already handles it."],
    ["rocket_loader", "off", "Keep Rocket Loader off for modern React apps unless manually tested."],
    ["always_use_https", "on", "Force HTTPS at the edge."],
    ["automatic_https_rewrites", "on", "Rewrite mixed-content HTTP assets to HTTPS."],
    ["ssl", "full", "Use Full or Full (strict) SSL, never Flexible."],
  ];

  for (const [id, expected, note] of checks) {
    const value = get(id);
    if (expected && value !== expected) recs.push({ id, value, recommendation: note });
    if (!expected) recs.push({ id, value, recommendation: note });
  }

  const root = publicChecks.find((c) => c.url === `https://${DOMAIN}/`);
  if (root) {
    const h = root.headers;
    if (!h["content-encoding"]) recs.push({ id: "content-encoding", value: "missing", recommendation: "Confirm text assets are compressed by Cloudflare or origin." });
    if (!h["cf-cache-status"]) recs.push({ id: "cf-cache-status", value: "missing", recommendation: "Confirm the hostname is proxied through Cloudflare, not DNS-only." });
    if (!h["strict-transport-security"]) recs.push({ id: "hsts", value: "missing", recommendation: "Add HSTS after confirming HTTPS works across all subdomains." });
    if (!h["x-content-type-options"]) recs.push({ id: "x-content-type-options", value: "missing", recommendation: "Add X-Content-Type-Options: nosniff via Cloudflare Transform Rules or origin headers." });
    if (!h["referrer-policy"]) recs.push({ id: "referrer-policy", value: "missing", recommendation: "Add Referrer-Policy: strict-origin-when-cross-origin." });
  }

  return recs;
}

async function main() {
  const zones = await cf(`/zones?name=${encodeURIComponent(DOMAIN)}`);
  const zone = zones?.[0];
  if (!zone) throw new Error(`No Cloudflare zone found for ${DOMAIN}`);

  const [settings, dnsRecords, root, robots, sitemap, llms] = await Promise.all([
    cf(`/zones/${zone.id}/settings`),
    cf(`/zones/${zone.id}/dns_records?per_page=100`),
    fetchHeaders(`https://${DOMAIN}/`),
    fetchHeaders(`https://${DOMAIN}/robots.txt`),
    fetchHeaders(`https://${DOMAIN}/sitemap.xml`),
    fetchHeaders(`https://${DOMAIN}/llms.txt`),
  ]);

  const publicChecks = [root, robots, sitemap, llms];
  const report = {
    domain: DOMAIN,
    zone: {
      id: zone.id,
      name: zone.name,
      status: zone.status,
      paused: zone.paused,
      type: zone.type,
      development_mode: zone.development_mode,
      name_servers: zone.name_servers,
    },
    settings: {
      ssl: settingValue(settings, "ssl"),
      always_use_https: settingValue(settings, "always_use_https"),
      automatic_https_rewrites: settingValue(settings, "automatic_https_rewrites"),
      brotli: settingValue(settings, "brotli"),
      http2: settingValue(settings, "http2"),
      http3: settingValue(settings, "http3"),
      early_hints: settingValue(settings, "early_hints"),
      minify: settingValue(settings, "minify"),
      rocket_loader: settingValue(settings, "rocket_loader"),
      browser_cache_ttl: settingValue(settings, "browser_cache_ttl"),
      cache_level: settingValue(settings, "cache_level"),
      security_level: settingValue(settings, "security_level"),
      waf: settingValue(settings, "waf"),
    },
    dns: dnsSummary(dnsRecords),
    public_checks: publicChecks.map((c) => ({
      url: c.url,
      status: c.status,
      response_ms: c.ms,
      cf_cache_status: c.headers["cf-cache-status"] || null,
      content_type: c.headers["content-type"] || null,
      content_encoding: c.headers["content-encoding"] || null,
      cache_control: c.headers["cache-control"] || null,
      strict_transport_security: c.headers["strict-transport-security"] || null,
      x_content_type_options: c.headers["x-content-type-options"] || null,
      referrer_policy: c.headers["referrer-policy"] || null,
      server: c.headers.server || null,
    })),
    recommendations: scoreSettings(settings, publicChecks),
  };

  console.log(JSON.stringify(report, null, 2));

  const md = [
    `# Cloudflare host audit for ${DOMAIN}`,
    "",
    `Zone status: **${report.zone.status}**${report.zone.paused ? " (paused)" : ""}`,
    "",
    "## Key settings",
    "",
    ...Object.entries(report.settings).map(([k, v]) => `- ${k}: \`${JSON.stringify(v)}\``),
    "",
    "## Public endpoint checks",
    "",
    "| URL | Status | ms | CF cache | Type | Encoding | Cache-Control |",
    "| --- | ---: | ---: | --- | --- | --- | --- |",
    ...report.public_checks.map((c) => `| ${c.url} | ${c.status} | ${c.response_ms} | ${c.cf_cache_status ?? "—"} | ${c.content_type ?? "—"} | ${c.content_encoding ?? "—"} | ${c.cache_control ?? "—"} |`),
    "",
    "## Recommendations",
    "",
    ...(report.recommendations.length
      ? report.recommendations.map((r) => `- **${r.id}** currently \`${JSON.stringify(r.value)}\`: ${r.recommendation}`)
      : ["- No high-level recommendations from this audit." ]),
    "",
    "## DNS summary",
    "",
    "| Type | Name | Content | Proxied | TTL |",
    "| --- | --- | --- | --- | ---: |",
    ...report.dns.map((r) => `| ${r.type} | ${r.name} | ${String(r.content).replace(/\|/g, "\\|")} | ${r.proxied ?? "—"} | ${r.ttl} |`),
    "",
  ].join("\n");

  await import("node:fs/promises").then((fs) => fs.writeFile("cloudflare-host-audit.md", md));
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
