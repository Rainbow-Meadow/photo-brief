# Visual regression tests

Playwright screenshot suite that pins the editorial design across every page.
Runs against the published preview at https://photo-brief.lovable.app by
default (override with `PHOTOBRIEF_BASE_URL`).

## Run locally

```bash
bunx playwright install chromium    # one-time
bun run test:visual                 # run all suites
bun run test:visual:update          # accept new baselines after intended UI changes
bun run test:visual -- --project=public-desktop
bun run test:visual:report          # open the HTML report
```

Authed suites depend on the `auth-setup` project, which logs the
`seed.business@photobrief.test` user in (see `mem://seed-users`) and writes
its session to `tests/visual/.auth/business.json`. Storage-state files and
`.results/` are gitignored.

## Updating baselines

After an intentional UI change:

1. `bun run test:visual:update`
2. Inspect diffs in `tests/visual/__screenshots__/` before committing.
3. Commit the new PNGs alongside the code change.

## Adding a route

- **Public**: append to `PUBLIC_ROUTES` in `public.spec.ts`.
- **Authed**: append to `AUTHED_ROUTES` in `authed.spec.ts`.
- **Wizard / multi-step**: add a new `test(...)` to `wizards.spec.ts` and
  drive the steps with `page.getByRole(...).click()` between `snapshot` calls.

## Stability tips

- Mark volatile DOM (relative timestamps, live counters) with
  `data-volatile="true"` — `helpers.ts` masks it automatically.
- For per-test masks, pass extra selectors as the third arg to `snapshot()`.
- Animations and caret are disabled globally via `playwright.config.ts`.
