## Tighten the "Fine Print" section layout

Currently the section has a wide two-column intro (text left, large notebook illustration right at `max-w-[420px]`), then a big `mt-10` gap, then a narrow `max-w-3xl` accordion centered below — leaving a hollow void on the left side under the headline and excess space between the intro and the accordion.

### Changes (single file: `src/pages/Landing.tsx`, `BetaDetailsAccordion`, ~lines 1681–1693)

1. **Reduce intro→accordion gap**
   - `mx-auto mt-10 max-w-3xl sm:mt-10` → `mx-auto mt-6 max-w-3xl sm:mt-8`

2. **Shrink the notebook illustration locally** (only in this section, not the shared `TradeAccent`)
   - Wrap the `TradeAccent` in a `div className="mx-auto w-full max-w-[260px] lg:ml-auto lg:mr-0"` so the illustration caps around 260px instead of 420px, pulling the right column tighter and reducing intro height.

3. **Pull accordion up under the intro tightly**
   - Already covered by step 1.

No copy, token, or component-API changes. No edits to `SectionIntro`/`TradeAccent` themselves (they're shared).

### Out of scope
Other sections, accordion internals, copy, illustrations.
