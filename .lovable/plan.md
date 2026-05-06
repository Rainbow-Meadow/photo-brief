
# Merge BetaList into Landing — Clean Delete

Kill `/betalist` entirely. Merge the best of both pages into one Landing page. Update every reference.

---

## Unified Landing section order

1. Hero (Landing's large logo/glow, primary CTA scrolls to `#apply`, secondary "See how it works", video spotlight)
2. Free Pro for Life spotlight
3. Interactive demo
4. Sticky section nav
5. How it works
6. Before / after
7. Use cases (all 5)
8. Founding partner beta (benefits/expectations + detailed expectations + reward tiers + scoring rubric)
9. Pricing path
10. Trust points
11. Application form (`#apply`) — full form, validation, `waitlist-submit` call, UTM tracking, thank-you screen
12. Final CTA

---

## Files to change

| File | Change |
|------|--------|
| `src/pages/Landing.tsx` | Major rewrite — absorb form, Free Pro spotlight, expectations, rewards, rubric, trust points from BetaList. Add `useSearchParams` for UTM/ref/interest. |
| `src/pages/BetaList.tsx` | **Delete** |
| `src/App.tsx` | Remove `/betalist` route and `BetaListPage` import |
| `src/config/access.ts` | `signupCtaTarget()` → `"/#apply"`, `planCtaTarget()` → `"/#apply?interest=..."` |
| `src/components/layout/MarketingLayout.tsx` | Nav/footer "Beta Program" → `/#beta-program` anchor |
| `src/components/marketing/FoundingCustomerBanner.tsx` | Link → `/#apply?interest=founding-partner` |
| `src/pages/Pricing.tsx` | "View beta program" → `/#beta-program` |
| `src/pages/Signup.tsx` | Replace `/betalist` refs with `/` |
| `src/pages/Auth.tsx` | Replace `/betalist` refs with `/` |
| `src/pages/BetaInvite.tsx` | Fallback redirect → `/` |
| `src/pages/Waitlist.tsx` | Redirect target → `/` |
| `src/components/pricing/PricingCardGrid.tsx` | Flows through `access.ts`, may need direct fix if it hardcodes `/betalist` |
| `public/sitemap.xml` | Remove `/betalist` entry |
| `public/_redirects` | Remove lines referencing `/betalist` |

No backend/edge function changes needed — `waitlist-submit` is URL-agnostic.
