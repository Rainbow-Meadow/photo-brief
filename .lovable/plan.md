## Goal

Make `vite build` (production) hard-fail with a clear error if `VITE_SUPABASE_URL` or `VITE_SUPABASE_PUBLISHABLE_KEY` are missing, so a broken bundle like the current `photobrief.ai` deployment can never ship again.

## Change

Edit `vite.config.ts` to add a small inline plugin that runs in `buildStart` only for production builds (`command === "build"` and not `--mode development`). It reads the env via Vite's `loadEnv(mode, process.cwd(), "")`, checks both keys are non-empty, and throws with an actionable message listing the missing ones.

- Dev (`vite` / `vite dev`) is unaffected — still loads whatever is in `.env`.
- Test mode (`mode === "test"`) is skipped so vitest runs locally without the keys.
- Failure surfaces as a non-zero exit during build, which fails the publish/deploy step.

## Technical detail

```ts
// vite.config.ts
import { defineConfig, loadEnv } from "vite";
// ...
export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    // ...existing config...
    plugins: [
      react(),
      mode === "development" && componentTagger(),
      command === "build" && mode !== "test" && {
        name: "require-supabase-env",
        buildStart() {
          const missing = ["VITE_SUPABASE_URL", "VITE_SUPABASE_PUBLISHABLE_KEY"]
            .filter((k) => !env[k]);
          if (missing.length) {
            this.error(
              `Missing required env var(s): ${missing.join(", ")}. ` +
              `These must be present at build time so the Supabase client is wired into the bundle. ` +
              `Re-publish from Lovable so the latest .env is injected, or set them in your build environment.`,
            );
          }
        },
      },
    ].filter(Boolean),
  };
});
```

No other files change. The existing runtime stub in `src/integrations/supabase/client.ts` stays as a defensive fallback, but production builds will now refuse to produce a bundle that would hit it.
