## Update Beta Program Details

Apply the new beta parameters everywhere they appear: 60-day duration, 30 companies (5 per week), and tiered discount rewards based on feedback quality.

### Reward Tiers

| Tier | Count | Reward |
|------|-------|--------|
| Top 2 partners | 2 | Free Pro for life |
| Elite | 4 | 75% off in perpetuity |
| Strong | 4 | 50% off in perpetuity |
| Solid | 10 | 75% off first year post-launch |
| Participating | 10 | 50% off first year post-launch |

Rewards earned by quality of feedback, not just usage volume.

---

### Files to change

**1. `docs/founding-partner-beta-plan.md`**
- Duration: "8–12 weeks" → 60 days
- Cohort size: 30 total, 5 accepted per week across 6 weekly cohorts
- Beta Offer: replace flat "30% off" with the full tiered reward table above; note rewards are granted based on feedback quality
- Beta Phases: refit to 60-day / ~9-week cadence (Seed weeks 1–2, Validate weeks 3–5, Optimize weeks 6–7, Graduate weeks 8–9)
- Success Metrics / Conversion: update targets to reflect 30 partners and tiered structure
- Exit Criteria: update partner counts accordingly

**2. `docs/beta-program-emails.md`**
- Graduation email copy direction: reference personalized tiered discount instead of flat percentage; note the `discount` and `discountDuration` variables

**3. `src/pages/BetaList.tsx`** (public /betalist page)
- `partnerBenefits` array (line 78–84): change "60–90 days free founding beta access" → "60-day free founding beta access"; change "50% off the first year after launch" → "Up to 75% off post-launch — based on feedback quality" (or similar concise phrasing)
- Thank-you confirmation text (line 265): update "60–90 days free · ... · 50% off year one" to match new details: "60 days free · ... · up to 75% off post-launch"

**4. `supabase/functions/_shared/transactional-email-templates/beta-graduation.tsx`**
- Add optional `discountDuration` prop (`'perpetuity'` | `'first-year'` | `'free-pro'`)
- Render tier-appropriate copy: "Free Pro for life", "X% off — locked in permanently", or "X% off your first year"
- Remove default `discount = '30'`; update preview data to reflect a realistic tier

**5. `src/pages/AdminBeta.tsx`** — no changes needed (discount tier is a graduation-time decision, not a dashboard column yet)
