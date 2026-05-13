// All recipient-facing and dashboard-facing strings live here, so copy
// can be tuned (and translated later) without touching components.
export const microcopy = {
  recipient: {
    introTitle: "Thanks for reaching out.",
    introBody:
      "Quick guided walkthrough so the business can help you faster. About 2 minutes. No app, no login.",
    capturePromptHint: "Take or upload a photo",
    retake: "Retake",
    useAnyway: "Use anyway",
    accept: "Looks good",
    skip: "Skip this one",
    reviewTitle: "Quick review",
    submit: "Send it",
    confirmationTitle: "Done. They've got what they need.",
    confirmationBody: "The business has your details. They'll be in touch shortly.",
  },
  business: {
    inboxEmpty: "No briefs yet",
    inboxEmptyHint: "Send your first PhotoBrief link, or wire your website intake, to start filling the inbox.",
    submissionsEmpty: "No briefs yet",
    submissionsEmptyHint: "When customers submit, briefs land here — summarized, scored, and ready to quote.",
    guidesEmpty: "No custom routes",
    guidesEmptyHint: "Start from a template, or describe the job and let AI build the route.",
  },
  ai: {
    rateLimited: "PhotoBrief AI is catching its breath. Try again in a moment.",
    paymentRequired: "AI usage limit reached for this workspace. Upgrade or add credits to keep going.",
  },
} as const;
