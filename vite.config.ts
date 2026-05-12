import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
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
      command === "build" && mode !== "test" && {
        name: "require-supabase-env",
        buildStart() {
          const required = ["VITE_SUPABASE_URL", "VITE_SUPABASE_PUBLISHABLE_KEY"];
          const missing = required.filter((k) => !env[k]);
          if (missing.length) {
            // @ts-expect-error - Rollup plugin context provides this.error
            this.error(
              `Missing required env var(s): ${missing.join(", ")}. ` +
                `These must be present at build time so the Supabase client is wired into the bundle. ` +
                `Re-publish from Lovable so the latest .env is injected, or set them in your build environment.`,
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
