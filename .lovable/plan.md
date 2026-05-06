Remove the "Beta Program" navigation entry from `src/components/layout/MarketingLayout.tsx`:

1. **Header nav** (line 18): Remove `{ to: "/#beta-program", label: "Beta Program" }` from `marketingRoutes`.
2. **Footer nav** (line 148): Remove the `<NavLink to="/#beta-program">Beta Program</NavLink>` element.

No other files reference this route in navigation.