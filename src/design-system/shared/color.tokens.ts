/**
 * Semantic color palette — references CSS custom properties defined in index.css.
 * Components should use Tailwind classes (bg-primary, text-foreground, etc.),
 * but this file documents the full semantic palette for programmatic use.
 */

export const SEMANTIC_COLORS = {
  primary: "hsl(var(--primary))",
  primaryGlow: "hsl(var(--primary-glow))",
  primaryForeground: "hsl(var(--primary-foreground))",
  background: "hsl(var(--background))",
  foreground: "hsl(var(--foreground))",
  card: "hsl(var(--card))",
  cardForeground: "hsl(var(--card-foreground))",
  muted: "hsl(var(--muted))",
  mutedForeground: "hsl(var(--muted-foreground))",
  accent: "hsl(var(--accent))",
  accentForeground: "hsl(var(--accent-foreground))",
  border: "hsl(var(--border))",
  destructive: "hsl(var(--destructive))",
  success: "hsl(var(--success))",
  warning: "hsl(var(--warning))",
} as const;
