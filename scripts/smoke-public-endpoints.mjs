#!/usr/bin/env node

/**
 * Public production smoke checks.
 *
 * These run after Cloudflare Pages + Workers deploy. They intentionally check
 * real public URLs instead of local artifacts because the failure mode we care
 * about is routing/origin/deploy drift.
 *
 * Cloudflare custom-domain and Worker route updates can take a few seconds to
 * settle after Wrangler reports success, so checks retry transient network and
 * 5xx failures before failing the deployment.
 */

const checks = [
  { label: "Landing", url: "https://photobrief.ai/", expect: [200] },
  { label: "Pricing", url: "https://photobrief.ai/pricing", expect: [200] },
  { label: "For AI agents", url: "https://photobrief.ai/for-ai-agents", expect: [200] },
  { label: "Help", url: "https://photobrief.ai/help", expect: [200] },
  { label: "Sitemap", url: "https://photobrief.ai/sitemap.xml", expect: [200] },
  { label: "Robots", url: "https://photobrief.ai/robots.txt", expect: [200] },
  { label: "Beta agent health", url: "https://beta-agent.photobrief.ai/health", expect: [200], jsonOk: true, retries: 6 },
];

const failures = [];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function shouldRetry(errorOrStatus) {
  if (typeof errorOrStatus === "number") return errorOrStatus === 0 || errorOrStatus >= 500;
  return true;
}

async function fetchWithTimeout(check) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    return await fetch(check.url, {
      redirect: check.redirect ?? "follow",
      signal: controller.signal,
      headers: { "User-Agent": "PhotoBriefDeploySmoke/1.0" },
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function checkEndpoint(check) {
  const attempts = check.retries ?? 3;
  let lastFailure = "unknown failure";

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetchWithTimeout(check);

      if (!check.expect.includes(response.status)) {
        lastFailure = `expected ${check.expect.join("/")}, got ${response.status}`;
        if (attempt < attempts && shouldRetry(response.status)) {
          await sleep(1500 * attempt);
          continue;
        }
        failures.push(`${check.label}: ${lastFailure}`);
        return;
      }

      if (check.redirectLocationIncludes) {
        const location = response.headers.get("location") || "";
        if (!location.includes(check.redirectLocationIncludes)) {
          lastFailure = `redirect location did not include ${check.redirectLocationIncludes}; got ${location || "<empty>"}`;
          failures.push(`${check.label}: ${lastFailure}`);
          return;
        }
      }

      if (check.jsonOk) {
        const body = await response.json().catch(() => null);
        if (!body?.ok) {
          lastFailure = "expected JSON body with ok=true";
          if (attempt < attempts) {
            await sleep(1500 * attempt);
            continue;
          }
          failures.push(`${check.label}: ${lastFailure}`);
          return;
        }
      }

      const suffix = attempt > 1 ? ` after ${attempt} attempts` : "";
      console.log(`✅ ${check.label}: ${response.status}${suffix}`);
      return;
    } catch (error) {
      lastFailure = error instanceof Error ? error.message : String(error);
      if (attempt < attempts && shouldRetry(error)) {
        await sleep(1500 * attempt);
        continue;
      }
      failures.push(`${check.label}: ${lastFailure}`);
      return;
    }
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
