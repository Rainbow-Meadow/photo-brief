# Landing page effectiveness audit

Date: 2026-05-03

## Goal

Make the landing page clearer, more compelling, and better aligned to the current PhotoBrief product model.

The page needs to explain two things quickly:

1. PhotoBrief solves the immediate pain of chasing customer photos.
2. Businesses can start with manual links, then upgrade to Pro when they want website intake automation.

## Previous issue

The previous landing page looked polished, but it led too heavily with Website Intake. That made the product feel like an integration project before the visitor understood the simple first win.

For a small business, the best adoption story is not:

> Connect your website and automate everything.

It is:

> Send one better link instead of chasing photos.

Once that works, Pro automation becomes much easier to understand and justify.

## Refactor strategy

The new page follows this conversion sequence:

1. **Pain:** stop chasing customer photos.
2. **Immediate outcome:** send one clickable PhotoBrief link.
3. **Low-risk adoption:** Free and Starter support manual links.
4. **Product workflow:** request or lead → template/photos → mobile capture → organized brief.
5. **Switch value:** less chasing, better photos, faster decisions.
6. **Pro expansion:** Website Intake turns the same workflow into automated intake.
7. **Use cases:** show industries where photo evidence drives decisions.
8. **Pricing:** explain manual-link plans versus Pro automation.
9. **CTA:** start with one better link.

## Core messaging changes

### Hero

Changed from:

> Turn website leads into photo-ready briefs.

To:

> Stop chasing customer photos. Send one link instead.

Why: the new headline speaks to the problem every target customer already recognizes. It also supports the Free/Starter manual-link entry point.

### Positioning

The page now makes a clear distinction:

- Free + Starter: manual clickable PhotoBrief links.
- Pro+: Website Intake, routing, hosted form, webhooks, automation.

This mirrors the pricing and entitlement model.

### Product visual

The hero visual now shows:

> Manual link or website lead → guided photos → ready-to-use brief.

This prevents the page from implying that Website Intake is required to use PhotoBrief.

### Pricing story

Pricing now says:

> Free and Starter help you prove the manual PhotoBrief link workflow. Pro adds Website Intake automation, routing, and integrations.

That makes the upgrade path feel natural instead of arbitrary.

## Why this should convert better

### It lowers perceived setup effort

A visitor can understand the first step immediately: create and send a link. That is easier to try than a website integration.

### It preserves Pro value

Website Intake is still presented as the bigger operational win, but only after the visitor understands the manual workflow.

### It names the pain directly

“Stop chasing customer photos” is more visceral and more broadly applicable than “turn website leads into photo-ready briefs.”

### It avoids overpromising integration simplicity

Webhook and Website Intake are powerful, but they should not be the first mental hurdle. The new page frames them as the next step, not the starting requirement.

## Current implementation

Updated files:

- `src/pages/Landing.tsx`
- `src/components/marketing/HeroGlassStory.tsx`
- `src/components/marketing/HowItWorksSteps.tsx`
- `src/components/marketing/StatsBand.tsx`
- `src/components/marketing/FinalCtaCard.tsx`

## Product principle

The landing page should sell the smallest useful behavior first:

> Send a PhotoBrief link instead of asking for photos over email.

Then it should make Pro feel like the obvious next move:

> Let the website send that PhotoBrief for you.
