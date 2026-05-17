
## Audit of current sitemap.xml

| URL | Unique purpose? | Verdict |
|---|---|---|
| `/` | The pitch + signup funnel | **Keep** |
| `/demo` | Standalone interactive demo (312 LOC page, not duplicated on `/`) | **Keep** |
| `/pricing` | Plans + Product schema | **Keep** |
| `/for-ai-agents` | TechArticle for LLM citation. Human-readable companion to `/llms.txt` — they're not duplicates (llms.txt is plain text, this is the cite-able HTML) | **Keep** |
| `/help` | Support / FAQ hub | **Keep** |
| `/privacy` | Legal, required | **Keep** |
| `/terms` | Legal, required (Paddle MoR ToS) | **Keep** |
| `/refund-policy` | Required by Paddle as MoR + linked from Terms; not redundant | **Keep** |

**Conclusion:** every URL serves a specific, unique purpose. The bloat isn't URLs — it's the per-entry `<changefreq>` and `<priority>` tags, which Google has [publicly confirmed](https://developers.google.com/search/blog/2023/05/sitemaps-lastmod-ping) it ignores. Bing/others largely the same. Only `<lastmod>` is still respected.

## What to rip out

1. **Every `<changefreq>` tag** (16 lines of noise across 8 URLs).
2. **Every `<priority>` tag** (16 more lines). Priorities only matter *within* a single sitemap and Google ignores them anyway.
3. **Trailing newline weirdness / inconsistent indentation** — clean pass.

## What to add (small, earns its keep)

- **`<lastmod>` per URL**, set to the build date. Actually used by crawlers to decide whether to re-fetch.
- Wire it to a tiny generator so it stays truthful: `scripts/generate-sitemap.ts` reads a small allowlist (the 8 paths above) and stamps today's date on build. Hook via `prebuild` in `package.json`. Matches the pattern already documented in the sitemap-robots knowledge file and aligns with `scripts/prerender.mjs`, which already reads `public/sitemap.xml` as the source of truth.

## Files touched

- `public/sitemap.xml` — regenerated, stripped to `<loc>` + `<lastmod>` per URL.
- `scripts/generate-sitemap.ts` — new, ~40 lines, hardcoded URL list (keeps it auditable; no DB calls).
- `package.json` — add `"prebuild": "bunx tsx scripts/generate-sitemap.ts"` (and `predev` if you want dev parity).

## Out of scope (intentional)

- Not touching `robots.txt`, `_redirects`, or `_headers` — they're already aligned.
- Not adding/removing routes. If you want me to also kill `/demo` or `/for-ai-agents` as "not pulling weight," say the word — but my read is both earn their slot.
- Not switching to a Vite plugin; the script approach is simpler and matches existing tooling.

## One decision for you

Do you want the generator (cleaner, auto-stamped `lastmod`), or just a hand-edited static `sitemap.xml` with the noise stripped? Default: **generator**.
