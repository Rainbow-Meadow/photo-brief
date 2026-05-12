import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

const LOVABLE_CLOUD_SUPABASE_URL = "https://mvlcefiygkzzewcdzsmj.supabase.co";
const LOVABLE_CLOUD_SUPABASE_PUBLISHABLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJIUzI1NiIsInJlZiI6Im12bGNlZml5Z2t6ZXdjZHpzbWoiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTc3NzYwOTYxNCwiZXhwIjoyMDkzMTg1NjE0fQ.ydcCiiUvi_tx5mhHy35hNURoUmi_QNifYkoJA-HZRnU";

// https://vitejs.dev/config/
export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const supabaseUrl = env.VITE_SUPABASE_URL || env.SUPABASE_URL || LOVABLE_CLOUD_SUPABASE_URL;
  const supabasePublishableKey =
    env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    env.VITE_SUPABASE_ANON_KEY ||
    env.SUPABASE_PUBLISHABLE_KEY ||
    env.SUPABASE_ANON_KEY ||
    LOVABLE_CLOUD_SUPABASE_PUBLISHABLE_KEY;

  return {
    define: {
      "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(supabaseUrl || ""),
      "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify(supabasePublishableKey || ""),
    },
    server: {
      host: "::",
      port: 8080,
      hmr: {
        overlay: false,
      },
    },
    plugins: [
      react(),
      mode === "development" && componentTagger(),
      command === "build" && mode === "production" && {
        name: "require-supabase-env",
        buildStart() {
          const missing = [
            ["VITE_SUPABASE_URL", supabaseUrl],
            ["VITE_SUPABASE_PUBLISHABLE_KEY", supabasePublishableKey],
          ]
            .filter(([, value]) => !value)
            .map(([name]) => name);
          if (missing.length) {
            // @ts-expect-error - Rollup plugin context provides this.error
            this.error(
              `Missing required env var(s): ${missing.join(", ")}. ` +
                `These public Supabase values must resolve at build time so the client is wired into the bundle.`,
            );
          }
        },
      },
    ].filter(Boolean),
    build: {
      // Keep public production bundles lean and avoid exposing full source maps.
      // Re-enable only if an error-monitoring workflow needs uploaded maps.
      sourcemap: false,
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
      dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
    },
  };
});
