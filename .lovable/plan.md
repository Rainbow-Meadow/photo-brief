# Apple-Native Design Schema Refactor

Goal: make PhotoBrief look and behave like a native, App Store–approved Apple app — on iOS (mobile), iPadOS (tablet), and macOS (desktop) — without breaking existing screens. The current schema is close (Apple easing, glass primitives, platform tokens), but it mixes "premium SaaS" tropes with HIG. This plan tightens it into a true HIG-aligned system.

## What changes (user-visible)

- Typography that matches SF (system font stack, Dynamic Type-style scale, tighter tracking on large titles).
- Apple-correct hierarchy: Large Title → Title 1/2/3 → Headline → Body → Callout → Subhead → Footnote → Caption.
- Materials instead of "glass cards": `regular`, `thick`, `thin`, `ultraThin`, `chrome` — mapped to backdrop-filter + vibrancy overlays, with proper light/dark variants.
- iOS-correct controls: 44pt min touch targets, segmented controls, sheet-style modals (detents), bottom tab bar with SF-style icons and labels, large-title scroll-collapsing headers.
- macOS/iPadOS-correct desktop: sidebar with translucent chrome, traffic-light spacing, hairline 0.5px separators, focus rings using `accentColor`.
- Motion: spring-based (not linear/ease) with Apple's standard spring curves; reduced-motion fully respected; tap = scale 0.97 + haptic-style opacity flash; sheets slide with rubber-band.
- System color palette: replace bespoke "PhotoBrief blue" primary mapping with Apple System Colors (systemBlue/systemIndigo/systemPurple) as the semantic source, with brand purple kept as `--brand-accent` for marketing surfaces only.
- Dark mode parity tuned to iOS dark (true blacks on OLED surfaces, elevated grays for cards) instead of navy.

## Architecture changes (technical section)

### 1. Token layer rewrite
- `src/design-system/shared/apple.tokens.ts` (new): single source for Apple system colors (light/dark), materials, type ramp, spring curves, radii, hairlines, safe-area, haptics-substitute timings.
- Refactor `desktop.tokens.ts` → `macos.tokens.ts` and `mobile.tokens.ts` → `ios.tokens.ts`. Add `ipados.tokens.ts`.
- Extend `usePlatformSchema()` to return `ios | ipados | macos` (detect via viewport + pointer media query `(pointer: coarse)` and `(hover: hover)`), keeping `isMobile/isDesktop` for back-compat.

### 2. CSS variable rewrite in `src/index.css`
- Replace `--primary` mapping to use Apple systemBlue (`211 100% 50%` light / `211 100% 60%` dark) as the default; expose `--brand-accent` (current purple) for marketing.
- Add Apple system grays: `--system-gray-1..6` and `--label`, `--secondary-label`, `--tertiary-label`, `--quaternary-label`, `--separator`, `--opaque-separator`, `--system-background`, `--secondary-system-background`, `--tertiary-system-background`, `--system-grouped-background` (and grouped variants).
- Materials as classes: `.material-ultraThin`, `.material-thin`, `.material-regular`, `.material-thick`, `.material-chrome` — each is `backdrop-filter: blur(Npx) saturate(180%)` + tinted overlay + 0.5px hairline border.
- Hairlines: `.hairline-t/b/l/r` using `box-shadow: inset 0 0.5px 0 hsl(var(--separator))` (true 1 device-pixel via `transform: scaleY(.5)` fallback).
- Type utility classes: `.text-large-title`, `.text-title-1/2/3`, `.text-headline`, `.text-body`, `.text-callout`, `.text-subhead`, `.text-footnote`, `.text-caption-1/2`. Sizes/leading/tracking from SF spec.
- Replace `--ease-apple` with full motion set: `--spring-default`, `--spring-snappy`, `--spring-gentle`, `--ease-in-out-quart`, plus durations `--dur-quick (180ms)`, `--dur-standard (260ms)`, `--dur-slow (380ms)`.

### 3. Tailwind config (`tailwind.config.ts`)
- Add `fontFamily.sans` to Apple system stack: `-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", system-ui, ...`.
- Add `fontFamily.rounded` (SF Rounded) and `fontFamily.mono` (SF Mono).
- Add Apple type scale to `fontSize` with line-height + letter-spacing tuples.
- Add `colors.label`, `colors.fill`, `colors.separator`, `colors.systemBackground` semantic groups.
- Add `borderWidth.hairline: '0.5px'`.
- Add `transitionTimingFunction.spring`, `.springSnappy`.
- Keep existing tokens as deprecated aliases to avoid breakage.

### 4. Component primitives
- Rename `GlassPanel` → `Material` (keep `GlassPanel` re-export for back-compat). Variants: `ultraThin | thin | regular | thick | chrome`. Drop `elevation` (HIG materials don't stack shadows; depth comes from material thickness + hairlines).
- New `LargeTitleHeader` component: collapses to inline title on scroll like iOS Navigation.
- New `Sheet` wrapper around Radix Dialog implementing iOS detents (`medium`, `large`) on touch and centered modal on macOS.
- New `SegmentedControl` (Radix Tabs styled).
- New `ListSection` + `ListRow` (iOS grouped table style) for settings pages.
- `Button` variants extended: `filled`, `tinted`, `gray`, `plain`, `destructive` (HIG button styles); enforce 44px min height on touch.
- `MobileTabBar` restyled: SF-style stacked icon+label, translucent material chrome, top hairline, safe-area padding.
- `AppSidebar` restyled to macOS sidebar: translucent material, vibrancy text colors, rounded selection pill in `accentColor`.

### 5. Motion overhaul
- Replace `lift-in`/`bubble-in` keyframes with spring-feel cubic-bezier sequences (Apple's standard `cubic-bezier(0.32, 0.72, 0, 1)` already present; add overshoot variant for sheets).
- Standard interactions: tap → scale `.97` + opacity `.85` over 120ms; release → spring back over 240ms. Hover (desktop only) → subtle tint shift, no lift.
- All animations gated by `prefers-reduced-motion`.

### 6. Dark mode retune
- iOS-correct elevated surfaces: `--system-background: 0 0% 0%` (true black) on OLED-class viewports; `--secondary-system-background: 0 0% 11%`; `--tertiary: 0 0% 17%`. Cards use elevated grays, not navy.
- Materials in dark mode use vibrancy: tinted white overlay at low alpha over blurred backdrop.

### 7. Cleanup
- Remove hover-lift, glow shadows, gradient-heavy "premium" surfaces from app shell (keep them quarantined to marketing pages via a `marketing-surface` class).
- Remove `bg-ambient-future` / heavy radial washes from in-app pages; replace with subtle `--system-grouped-background`.
- Audit `text-white`, `bg-black`, raw HSL colors in components — replace with semantic tokens (already a project rule, enforce via codemod pass).

## Rollout (phased, no big-bang)

1. **Tokens & CSS variables** — add new variables, keep old ones as aliases. No visual change yet.
2. **Tailwind config + type utilities** — ship Apple type scale and system font stack. Visible: typography snaps to SF.
3. **Materials + Sheet + SegmentedControl + ListRow primitives** — new components available, old ones still work.
4. **Shell refactor** — `DashboardLayout`, `AppSidebar`, `MobileTabBar`, headers swapped to materials + large-title pattern.
5. **Page sweep** — convert Settings, Customers, Requests, Submissions to ListSection/ListRow + Sheet.
6. **Motion + dark mode tune** — swap easings, retune dark surfaces.
7. **Marketing isolation** — wrap Landing/Pricing/Help in `.marketing-surface` so brand purple + glow effects survive.

## Out of scope

- No changes to business logic, routes, data, or backend.
- No changes to Remotion video theme.
- Brand identity (logo, marketing pages) stays purple/lavender; only the in-app product chrome moves to system colors.

## Open questions

Before I implement, I want to confirm a few direction choices.
