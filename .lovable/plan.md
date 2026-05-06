
## Overview

The landing page uses a dark navy background (#07050d / #0c0915) with purple/lavender accents (#8f63ff, #b98cff, #7C3AED) and subtle violet radial glows. The current emails use a white body with light lavender outer padding — functional but disconnected from the premium dark aesthetic.

This plan updates the shared email brand system and all templates so they feel like they came directly from the landing page.

## Visual direction

- **Outer background**: Dark navy (#0c0915) with a subtle purple radial glow at the top, mirroring the landing page body
- **Card container**: Dark glass panel (#15121f) with a soft purple-tinted border (rgba(207,178,255,0.14)), matching `.pb-command-panel` / `.dark .pb-card`
- **Header**: Logo image (hosted horizontal-light PNG) on the dark surface, with a subtle bottom border in violet
- **CTA buttons**: Purple gradient (#8f63ff -> #7C3AED), matching the landing page's "Apply to join the beta" button style
- **Text**: White/off-white headings (#f8f5ff), lavender-muted body text (rgba(255,255,255,0.68)), soft footer text (rgba(255,255,255,0.50))
- **Cards/callout boxes**: Slightly lighter dark panel (#1b1726) with violet-tinted border
- **Accent color for eyebrows/numbers**: Lavender (#b98cff)
- **Footer**: Muted text, "Sent via PhotoBrief.ai"

## Changes

### 1. Update `brand-styles.ts`

Overhaul the BRAND colors and all shared style objects:

| Token | Current | New |
|-------|---------|-----|
| bg | #F8F7FA (light lavender) | #0c0915 (dark navy) |
| surface | #FFFFFF | #15121f (dark glass) |
| primary | #111014 | #f8f5ff (white-lavender) |
| secondary | #625F68 | rgba(255,255,255,0.68) |
| border | #E1DEE7 | rgba(207,178,255,0.14) |
| cta | #7C3AED | #8f63ff (keep purple, brighter) |
| ctaHover | #6D28D9 | #b98cff |
| accent | #A78BFA | #b98cff |
| muted | #94909C | rgba(255,255,255,0.50) |

Update `s.main.backgroundColor` to `#0c0915` (dark), `s.container` to dark glass panel, button to purple with white text, card to darker inset panel, all text styles to light-on-dark.

**BrandHeader**: Replace `<Text>` wordmark with `<Img>` pointing to `https://photobrief.ai/brand/photobrief-horizontal-light.png` (the light-ink horizontal logo for dark backgrounds), ~36px height.

### 2. All 9 transactional templates

Since they import from `brand-styles.ts`, the color/layout changes propagate automatically. No per-template changes needed -- they all use `BrandHeader`, `BrandFooter`, `s.*` styles.

### 3. Auth email templates (6 files in `_shared/email-templates/`)

These have their own inline styles (not shared). Each will be updated with the same dark palette:
- `signup.tsx`, `invite.tsx`, `magic-link.tsx`, `recovery.tsx`, `email-change.tsx`, `reauthentication.tsx`
- Same dark bg, dark card, purple CTA, light text, logo image in header

### 4. Deploy edge functions

Deploy `auth-email-hook`, `send-transactional-email`, and `preview-transactional-email`.

## Files modified

- `supabase/functions/_shared/transactional-email-templates/brand-styles.ts`
- `supabase/functions/_shared/email-templates/signup.tsx`
- `supabase/functions/_shared/email-templates/invite.tsx`
- `supabase/functions/_shared/email-templates/magic-link.tsx`
- `supabase/functions/_shared/email-templates/recovery.tsx`
- `supabase/functions/_shared/email-templates/email-change.tsx`
- `supabase/functions/_shared/email-templates/reauthentication.tsx`
