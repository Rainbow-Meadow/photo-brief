#!/usr/bin/env node

/**
 * Public production smoke checks.
 *
 * These run after Cloudflare Pages + Workers deploy. They intentionally check
 * real public URLs instead of local artifacts because the failure mode we care
 * about is routing/origin/deploy drift.
 */

const checks = [
  { label: "Landing", url: "https://photobrief.ai/", expect: [200] },
  { label: "Pricing", url: "https://photobrief.ai/pricing", expect: [200] },
  { label: "For AI agents", url: "https://photobrief.ai/for-ai-agents", expect: [200] },
  { label: "Help", url: "https://photobrief.ai/help", expect: [200] },
  { label: "Sitemap", url: "https://photobrief.ai/sitemap.xml", expect: [200] },
  { label: "Robots", url: "https://photobrief.ai/robots.txt", expect: [200] },
  { label: "Beta agent health", url: "https://beta-agent.photobrief.ai/health", expect: [200], jsonOk: true },
  { label: "Legacy beta redirect", url: "https://photobrief.ai/beta-onboarding", expect: [301, 302, 307, 308], redirectLocationIncludes: "/#apply", redirect: "manual" },
];

const failures = [];

async function checkEndpoint(check) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(check.url, {
      redirect: check.redirect ?? "follow",
      signal: controller.signal,
      headers: { "User-Agent": "PhotoBriefDeploySmoke/1.0" },
    });

    if (!check.expect.includes(response.status)) {
      failures.push(`${check.label}: expected ${check.expect.join("/")}, got ${response.status}`);
      return;
    }

    if (check.redirectLocationIncludes) {
      const location = response.headers.get("location") || "";
      if (!location.includes(check.redirectLocationIncludes)) {
        failures.push(`${check.label}: redirect location did not include ${check.redirectLocationIncludes}; got ${location || "<empty>"}`);
        return;
      }
    }

    if (check.jsonOk) {
      const body = await response.json().catch(() => null);
      if (!body?.ok) {
        failures.push(`${check.label}: expected JSON body with ok=true`);
        return;
      }
    }

    console.log(`✅ ${check.label}: ${response.status}`);
  } catch (error) {
    failures.push(`${check.label}: ${error instanceof Error ? error.message : String(error)}`);
  } finally {
    clearTimeout(timeout);
  }
}

for (const check of checks) {
  await checkEndpoint(check);
}

if (failures.length) {
  console.error("\nPublic smoke checks failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("\nPublic smoke checks passed.");
