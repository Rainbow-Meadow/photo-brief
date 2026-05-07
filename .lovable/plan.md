Swap two lines in `src/pages/Landing.tsx` (around lines 449-453) so the section order becomes:

1. **Pricing Path** ("Start manual. Automate later.") — currently after beta
2. **Founding Partner Beta** — currently before pricing path

The change is a simple reorder of the two component calls:

```
// Before:
<FoundingPartnerSection />
<PricingPathSection />

// After:
<PricingPathSection />
<FoundingPartnerSection />
```

No other changes needed — both are self-contained section components.
