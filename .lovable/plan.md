
# Reposition Landing Page Around the Hosted Web Form

## Summary

Shift the landing page messaging so the **hosted intake form** (and the webhook bridge for existing forms) is the primary use case — not manual links. Manual links become the secondary "get started fast" path.

## Changes (all in `src/pages/Landing.tsx`)

### 1. Hero copy
- **Headline**: "Replace your intake form." / "Get photos, not just text."
- **Subtext**: Explain that you drop a hosted PhotoBrief form on your site or connect your existing form via webhook, and customers get a guided mobile photo workflow instead of a generic text box.

### 2. Trust chips (below CTAs)
- Change from `["No app for customers", "Reviewed for fit", "Concierge setup"]` to `["Hosted form or webhook", "No app for customers", "Concierge setup"]`

### 3. Workflow steps (the `workflowSteps` array)
- Step 1: Reframe from "Send one guided link" to "Add PhotoBrief to your website" — hosted form, webhook to existing form, or embed.
- Step 2: Keep as-is (customer capture).
- Step 3: Keep as-is (flagging).
- Step 4: Keep as-is (brief delivery).

### 4. "Clean" comparison signals (`cleanSignals` array)
- Change last item from "Manual links now, routed website intake on Pro" to "Hosted form replaces or extends your current one"

### 5. Use cases — promote "Website lead intake"
- Move the `Globe2` website intake use case from position 5 to position 1 in the array, and update its copy to be more prominent: title "Website intake that collects proof", body emphasizing replace-or-bridge.

### 6. Pricing path (`pricingPath` array)
- Swap the emphasis: lead with the hosted form / webhook path as the primary, and position manual links as the quick-start alternative.

### 7. Pain point section copy (the new `painPoints` array)
- Update the "Forms capture text, not proof" card context to reinforce that their current form can be replaced or bridged.

No new files, no database changes, no new dependencies.
