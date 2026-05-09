# Layout System

Shared layout primitives that standardize widths, spacing, surfaces, and grids
across PhotoBrief. Live in `src/components/layout/primitives/`.

> **Rule:** prefer primitives over ad-hoc Tailwind. If you find yourself
> writing `mx-auto max-w-7xl px-...`, `rounded-[2rem] bg-card/85 border ...`,
> or one-off section padding, reach for a primitive instead.

## Primitive catalog

### App pages

| Primitive | Purpose |
|---|---|
| `PageShell` | Page-level max-width + horizontal padding wrapper. One per page. |
| `PageStack` | Vertical rhythm between page modules (`compact` / `default` / `relaxed`). |
| `PageSection` | In-app section wrapper with optional heading/description/actions. Variants: `default`, `card`, `elevated`, `muted`, `split`. |
| `Surface` | Card/panel primitive. Variants: `panel`, `elevated`, `muted`, `outline`. Radius: `default`, `lg`, `pill`. Padding: `none`, `sm`, `md`, `lg`. |
| `ResponsiveGrid` | Standard responsive grid grammar. Cols: `1-2`, `1-3`, `1-4`, `sidebar`, `aside`. |
| `PageHeader` | Existing — title/description/actions block (use at the top of every app page). |
| `EmptyState` | Existing — zero-state with icon, title, description, primary/secondary actions. |

### Marketing pages

| Primitive | Purpose |
|---|---|
| `MarketingHero` | Hero spacing + container width. Provide content as children. |
| `MarketingSection` | Public-page section wrapper. Composes `pb-section` + `pb-container`. Optional eyebrow/title/subtitle. |

### Setup flows

| Primitive | Purpose |
|---|---|
| `WizardLayout` | Stepper rail + content panel + sticky footer actions. Mobile stacks the rail above the content. |

## Standard widths

- **App default** — `max-w-7xl` (dashboard, inbox, library)
- **App narrow** — `max-w-5xl` (settings groups)
- **App reading** — `max-w-3xl` (forms, single-record detail)
- **App full** — no max width (full-bleed admin tables)
- **Marketing default** — `pb-container` (1240px)
- **Marketing narrow** — `pb-container-narrow` (820px)

## Standard spacing

- **App page gap** — `PageStack gap="default"` → `space-y-5 sm:space-y-7`
- **App compact** — `PageStack gap="compact"` → `space-y-3 sm:space-y-4`
- **App relaxed** — `PageStack gap="relaxed"` → `space-y-7 sm:space-y-10`
- **Marketing section** — `MarketingSection` (default) → `pb-section`
- **Marketing tight** — `MarketingSection spacing="tight"` → `pb-section-tight`

## Radius scale

| Token | Class | Use |
|---|---|---|
| default panel | `rounded-2xl` | Standard surfaces, inputs |
| large marketing | `rounded-3xl` | Marketing/showcase panels |
| pill | `rounded-full` | Badges, pill buttons |

Avoid `rounded-[2rem]`, `rounded-[1.75rem]`, etc. — use the scale.

## Marketing vs app rules

- **App pages**: always wrap in `PageShell` + `PageHeader` (unless a full-screen
  wizard like `/requests/new`). Use `PageStack` for vertical rhythm. Cards
  use `Surface`, never raw `rounded-[…] bg-card/85 border`.
- **Marketing pages**: use `MarketingHero` once at the top, then
  `MarketingSection` for each section. Keep premium dark/cream brand
  aesthetic via `pb-*` brand classes inside section content.

## Mobile behavior

- Single-column by default (`ResponsiveGrid` mobile = 1 col).
- DashboardLayout's `<main>` already adds `pb-24` to clear the bottom tab bar
  and `pt-safe` for the notch. `PageShell bottomSafe` is opt-in for pages
  that opt out of the standard layout.
- No hover effects or expensive blurs on touch (`@media (hover: none)`).
- Surfaces use `surface-card` which is platform-aware via `index.css`.

## ✅ Allowed

```tsx
// App page
<PageShell>
  <PageStack>
    <PageHeader title="Templates" actions={<NewBtn />} />
    <Surface variant="panel" radius="lg" padding="md">…</Surface>
    <ResponsiveGrid cols="1-3">{cards}</ResponsiveGrid>
  </PageStack>
</PageShell>

// Marketing page
<MarketingHero align="center">…</MarketingHero>
<MarketingSection eyebrow="FAQ" title="Questions, answered." width="narrow">
  …
</MarketingSection>

// Wizard
<WizardLayout steps={steps} currentIndex={i} onStepChange={setI} footer={<Nav />}>
  {stepBody}
</WizardLayout>
```

## ❌ Discouraged

```tsx
// Don't: ad-hoc widths/padding scattered per page
<div className="container mx-auto max-w-7xl py-8 px-4">…</div>

// Don't: one-off card chrome
<section className="rounded-[2rem] border border-border/70 bg-card/85
  p-5 shadow-[0_30px_90px_-55px_hsl(...)] backdrop-blur sm:p-7">…</section>

// Don't: bespoke breakpoints on every page
<div className="grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">…</div>
```

## Migration status

In-place migrations applied to:

- `src/features/workspace/pages/DashboardPage.tsx`
- `src/features/requests/pages/RequestsInboxPage.tsx`
- `src/features/guides/pages/GuideLibraryPage.tsx`
- `src/pages/AdminWebsiteIntelligence.tsx`
- `src/pages/Pricing.tsx` (hero + sections)
- `src/pages/Landing.tsx` (hero + sections)
- `src/pages/ForAiAgents.tsx` (hero + sections)

Remaining (use the same primitives when next touched):
`WebsiteIntakePage.tsx` (refactor to `WizardLayout`), other admin and
feature pages.
