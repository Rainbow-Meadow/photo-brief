import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
// Hardcoded fallback for publishable Supabase values. Safe to expose (URL + anon key
// are public). Used because the Lovable publish pipeline currently doesn't inject
// VITE_SUPABASE_* into the production bundle from .env.
const SUPABASE_URL_FALLBACK = "https://mvlcefiygkzzewcdzsmj.supabase.co";
const SUPABASE_PUBLISHABLE_KEY_FALLBACK =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im12bGNlZml5Z2t6emV3Y2R6c21qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2MDk2MTQsImV4cCI6MjA5MzE4NTYxNH0.ydcCiiUvi_tx5mhHy35hNURoUmi_QNifYkoJA-HZRnU";
const SUPABASE_PROJECT_ID_FALLBACK = "mvlcefiygkzzewcdzsmj";

export default defineConfig(({ mode }) => ({
  define: {
    "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(
      process.env.VITE_SUPABASE_URL || SUPABASE_URL_FALLBACK,
    ),
    "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify(
      process.env.VITE_SUPABASE_PUBLISHABLE_KEY || SUPABASE_PUBLISHABLE_KEY_FALLBACK,
    ),
    "import.meta.env.VITE_SUPABASE_PROJECT_ID": JSON.stringify(
      process.env.VITE_SUPABASE_PROJECT_ID || SUPABASE_PROJECT_ID_FALLBACK,
    ),
  },
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
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
}));
