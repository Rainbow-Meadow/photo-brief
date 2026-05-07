## Goal
Make the numerical statistics (62%, 5+, 75%) in the pain point cards stand out more by extracting them into large, accent-colored headline numbers separate from the descriptive text.

## Changes

### 1. Restructure `painPoints` data (Landing.tsx ~L536)
Split each entry's `stat` field into a `number` (the big stat like "62%", "5+", "75%") and a `label` (the rest of the sentence). For the two non-numeric entries ("Forms capture text, not proof" and "Low-quality leads look identical…"), keep them as-is or assign a symbolic stat.

Updated data shape:
- `{ number: "62%", label: "of first quotes are delayed", ... }`
- `{ number: "5+", label: "back-and-forth messages", ... }`
- `{ number: "—", label: "Forms capture text, not proof", ... }` (or a relevant stat)
- `{ number: "75%", label: "prefer zero human contact", ... }`
- `{ number: "0", label: "photo context on blind leads", ... }` (or similar)

### 2. Update card layout in `PainPointSection` (~L580-601)
- Render the `number` as a large, bold, accent-colored value (text-3xl/4xl, `text-[hsl(var(--pb-lavender))]` or primary-glow gradient).
- Render the `label` below in the current white bold style.
- Keep the icon and context copy as-is but shift layout so the stat dominates visually.

No new files or dependencies needed -- purely a markup/data restructure in Landing.tsx.
