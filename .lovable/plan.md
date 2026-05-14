## Problem

Google Search Console flags **"Duplicate field 'FAQPage'"** on `/for-ai-agents/` and `/pricing/` (4 affected items, first detected 5/10/26).

Root cause: the same FAQ JSON-LD (built from `faqItems`) is emitted on **four** URLs:

- `/` (Landing) — `[SOFTWARE_APP_JSONLD, heroJsonLd, faqJsonLd]`
- `/pricing` (Pricing) — `[buildFaqJsonLd(businessFaqs)]`
- `/for-ai-agents` (ForAiAgents) — `[articleJsonLd, howToJsonLd, faqJsonLd]`
- `/help` (BetaGuidePage) — `[buildFaqJsonLd(faqItems)]` ← canonical FAQ host

Google requires FAQPage to live on the page that actually presents the FAQ (per its 2023 guidance, FAQPage rich results are also restricted, so spraying it across pages adds risk with zero upside). `/help` is the canonical FAQ page; everywhere else is duplicating the same structured data, which trips the validator.

## Fix

Keep FAQPage JSON-LD **only** on `/help`. Remove it from `Landing`, `Pricing`, and `ForAiAgents`. Other JSON-LD on those pages stays intact (SoftwareApplication on Landing, TechArticle + HowTo on ForAiAgents, BreadcrumbList everywhere via `PageMeta`).

### Files to edit

**`src/pages/Landing.tsx`**
- Remove `import { buildFaqJsonLd }` and `import { faqItems }`.
- Remove `const faqJsonLd = buildFaqJsonLd(faqItems);`.
- Change `jsonLd={[SOFTWARE_APP_JSONLD, heroJsonLd, faqJsonLd]}` → `jsonLd={[SOFTWARE_APP_JSONLD, heroJsonLd]}`.

**`src/pages/Pricing.tsx`**
- Remove `import { buildFaqJsonLd }` and `import { faqItems }`.
- Remove `businessFaqs` memo and `jsonLd` memo.
- Remove the `jsonLd={jsonLd}` prop from `<PageMeta>` (BreadcrumbList still auto-emits from `breadcrumbs`).

**`src/pages/ForAiAgents.tsx`**
- Remove `import { buildFaqJsonLd }` and `import { faqItems }`.
- Remove `const faqJsonLd = useMemo(...)`.
- Change `jsonLd={[articleJsonLd, howToJsonLd, faqJsonLd]}` → `jsonLd={[articleJsonLd, howToJsonLd]}`.

**`src/features/help/pages/BetaGuidePage.tsx`** — no change. Remains the single source of FAQPage structured data.

### Verify

1. `grep -rn "buildFaqJsonLd" src/pages/` returns nothing; only `BetaGuidePage.tsx` should reference it.
2. After build + prerender, `dist/pricing/index.html` and `dist/for-ai-agents/index.html` contain no `"@type":"FAQPage"`.
3. In GSC, click **Validate Fix** on the "Duplicate field FAQPage" report after deploy.

### Out of scope

- Not touching `SEOHead` JSON-LD removal logic (the duplication is cross-URL, not cross-mount).
- Not modifying `faqItems`, `buildFaqJsonLd`, or `/help` page.
- No copy or layout changes.