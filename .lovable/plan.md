# Tighten the BetaList 5-shot deck

Two problems to fix in `/tmp/build_betalist.py`, then re-render to `/mnt/documents/betalist/`:

1. The five shots each tell a slightly different story. Reads like five posters, not a deck.
2. Shots 01 and 04 show "Photos · 3" but the thumbnails are gray gradients. A submission deck for a product called *PhotoBrief* must show actual photos.

## 1. One story, five beats

Lock a single arc and rewrite each caption so it lands one beat:

| # | Beat | Kicker | Headline | Sub |
|---|------|--------|----------|-----|
| 01 | Promise | `SMART INTAKE FOR SERVICE BUSINESSES` | **Guide. Capture. Close.** | Your form gives you a name. We give you a brief — ready to quote. |
| 02 | Guide (operator setup) | `GUIDE · SETUP IN 60 SECONDS` | **Scan your site. Get a real intake.** | Routes, questions, and a photo policy — tuned to how you actually quote. |
| 03 | Capture (recipient) | `CAPTURE · WHAT THE CUSTOMER SEES` | **Plain words. One thumb. No login.** | Photos only when they actually move the job. |
| 04 | Close (operator inbox) | `CLOSE · WHAT LANDS IN YOUR INBOX` | **Quote on the first reply.** | Every brief lands ready — or tells you exactly what's missing. |
| 05 | The rule under it all | `PHOTO POLICY · FOUR MODES` | **Photos when they matter. Not when they don't.** | Most forms ignore photos or demand them. Both lose leads. PhotoBrief picks per route. |

Voice rules already in project knowledge: no "AI-powered", no "seamless", no exclamation points, sixth-grader words, periods only in the hero headline. CTAs and stat labels stay verbs/nouns the operator already uses.

Removes the current mismatches:
- 01's sub ("Your form gives you a name… on the first reply") and 03's headline ("Your form gives you a name") were saying the same thing in two places. Now 01 owns the promise; 03 owns the recipient experience.
- 02's headline ("Scan your site. Get routes, questions, and a photo policy.") was a feature list. Replaced with curiosity-gap headline + payoff in the sub.
- 04's "Or know exactly what's missing." softens to the agreed sub above.
- 05 stays as the closing principle.

Also align the small things across shots so they read as a set:
- Every kicker uses the format `BEAT · DETAIL`.
- Brandmark size, position, and `photobrief.ai` footer identical on all 5 (already true — verify).
- Shot 03's stat row labels rewritten to match operator voice: `90s avg · 0 logins · 4 photo modes` (currently "average to finish" / "logins required" / "photo policy modes" — too long, breaks rhythm).
- Shot 02's checklist labels stay; shot 04's readiness checklist stays — they already match.

## 2. Real photos in the brief

Today `render_brief_card()` paints three gray gradient rectangles where photo thumbnails should be. Same card is reused in shot 04. Fix:

- Download 3 small roofing-damage / dormer photos from Unsplash Source (CC0, no attribution required for editorial product mockups) into `/tmp/photo_assets/`. Pick photos that match the brief copy ("Front dormer — water came through after Tuesday's storm"): a close-up of damaged shingles, a dormer/roof line, a water-stained ceiling or gutter detail.
- Cache locally so re-runs don't re-download.
- In `render_brief_card`, replace the gradient loop with: open photo → `ImageOps.fit` to thumbnail size → round corners with a mask → paste. Keep the cream 1px outline. Same `PHOTOS · 3` label above.
- In shot 04's readiness column, swap `Photos · 3 of 3` to `Photos · 3 attached` so it reads naturally.

If a download fails, fall back to the current gradient so the script never breaks. Log which photos were used.

## 3. QA pass (re-run for each shot)

For every PNG, open with `code--view` and check:
- Headline + sub fit, no clipping, no orphans.
- Brandmark and `photobrief.ai` footer in identical positions across all 5.
- Real photos in 01 and 04 are sharp, not stretched, corners rounded, contrast against card.
- Kicker format `BEAT · DETAIL` consistent everywhere.
- Canvas exactly 1600×1200.

Re-bundle `betalist_premium.zip`, deliver via `<presentation-artifact>` tags.

## What this plan does NOT do

- No app/source changes. Pure asset regeneration.
- No new shots, no carousel page, no video.
- No new fonts, no palette change.
- No copy that wasn't already approved in voice rules.
