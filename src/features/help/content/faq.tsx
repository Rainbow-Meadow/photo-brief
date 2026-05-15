export type FaqItem = { id: string; q: string; a: React.ReactNode; audience: "business" | "recipient" };

export const faqItems: FaqItem[] = [
  {
    id: "what-is-photobrief",
    audience: "business",
    q: "What is PhotoBrief, in one sentence?",
    a: (
      <>
        It's a smart intake system that replaces your generic website form with a guided customer flow — and hands you back a clean, actionable brief you can quote, with photos already attached when photos actually matter.
      </>
    ),
  },
  {
    id: "how-it-works",
    audience: "business",
    q: "How does it actually work?",
    a: (
      <>
        We read your website, identify the services you offer and the gaps in your current form, then build intake routes for each one. When a customer clicks your CTA, they get the right questions for the job they came for — and a photo step only when photos help you quote. You get a brief in your inbox you can act on.
      </>
    ),
  },
  {
    id: "trial",
    audience: "business",
    q: "How does the free trial work?",
    a: (
      <>
        Every new account gets 14 days of Smart Intake free. No credit card upfront. Pick a plan before the trial ends to keep sending briefs — or cancel and walk away clean.
      </>
    ),
  },
  {
    id: "recipient-account",
    audience: "business",
    q: "Do customers need an account?",
    a: <>No. They tap a link, answer a few questions made for the job they're calling about, and they're done. No app. No login.</>,
  },
  {
    id: "manual-or-automated",
    audience: "business",
    q: "What can I do on Free or Starter?",
    a: (
      <>
        Every plan can hand-send PhotoBrief intake links one at a time. Free and Starter are the cheapest way to feel the workflow before you wire it into your website. Pro and above keep manual sending and add the full Website Intake setup.
      </>
    ),
  },
  {
    id: "website-intake",
    audience: "business",
    q: "What is Website Intake?",
    a: (
      <>
        Website Intake is the whole point. Your contact form gets replaced with smart intake — different questions per service, the right photo policy per route, and a brief delivered straight to your inbox. It unlocks on <strong>Pro</strong> because it includes the hosted intake, the branded badge or button, route building, and webhook setup.
      </>
    ),
  },
  {
    id: "hosted-intake",
    audience: "business",
    q: "What should I put on my website?",
    a: (
      <>
        Replace your "Contact us" or "Get a quote" button with the PhotoBrief badge or a hosted intake link. Customers get a guided experience that fits the job; you get a brief instead of a vague message. A plain button labeled <strong>Get a quote</strong> or <strong>Start a request</strong> works too if your site can't embed iframes.
      </>
    ),
  },
  {
    id: "intake-badge",
    audience: "business",
    q: "What is the PhotoBrief website badge?",
    a: (
      <>
        A small embeddable block — think trust mark for intake. It carries the PhotoBrief logo, tells customers they're starting a guided request that will save them time, and opens your hosted intake.
      </>
    ),
  },
  {
    id: "badge-or-link",
    audience: "business",
    q: "Badge, hosted link, or webhook — which one?",
    a: (
      <>
        Use the badge if your site supports iframe or custom HTML. Use a hosted link behind a normal button if it doesn't. Use the webhook only if you've decided to keep your existing form exactly as-is. All three are Pro.
      </>
    ),
  },
  {
    id: "website-tools",
    audience: "business",
    q: "Which website builders does it work with?",
    a: (
      <>
        Anything that can embed an iframe or point a button at a URL. The setup guide covers Wix, Squarespace, WordPress, Elementor, Webflow, Shopify, GoDaddy, Carrd, and Zapier/Make.
      </>
    ),
  },
  {
    id: "existing-form",
    audience: "business",
    q: "Can I keep my existing website form?",
    a: (
      <>
        On Pro, yes — drop the PhotoBrief webhook into your form tool and map your fields. It's the advanced path. Most businesses are better off replacing the form with a smart intake badge, because the form is the thing costing you quotes.
      </>
    ),
  },
  {
    id: "ai-routing",
    audience: "business",
    q: "How does it pick the right intake route?",
    a: (
      <>
        Your routing rules run first. If nothing matches, a conservative AI match uses only your configured rules to choose. If it's not confident, it falls back to your default route. You're always in control.
      </>
    ),
  },
  {
    id: "photo-policy",
    audience: "business",
    q: "When does it actually ask for photos?",
    a: (
      <>
        Each route has its own photo policy: not needed, optional, recommended, or required. A reschedule? No photos. A leak? Required, with examples. A new install quote? Recommended. Customers only get the camera step when it earns its keep — so they don't bail.
      </>
    ),
  },
  {
    id: "create-template",
    audience: "business",
    q: "How do I build a new route or template?",
    a: (
      <>
        Open <strong>Requests → New request</strong>, let AI rough one in, then edit the questions and photo policy and save it as a template. Keep them tight: only what you actually need to quote.
      </>
    ),
  },
  {
    id: "branding",
    audience: "business",
    q: "Can customers see my branding?",
    a: (
      <>
        Yes. <strong>Settings → Brand</strong> is where you upload your logo and pick your color. Your intake and request pages wear your brand by plan; the embeddable badge keeps the PhotoBrief trust mark so customers recognize the guided experience.
      </>
    ),
  },
  {
    id: "more-photos",
    audience: "business",
    q: "What if a photo is unusable?",
    a: (
      <>
        Open the brief, hit <strong>Ask for more</strong>, pick the items to redo, add a one-line note. The customer gets a link that opens straight to those items — not the whole form again.
      </>
    ),
  },
  {
    id: "pricing-photos",
    audience: "business",
    q: "What counts toward usage?",
    a: (
      <>
        Usage is based on photos collected, not raw request count. Routes that don't need photos cost you nothing on the photo meter. First-pass retakes are handled separately so a customer fixing a blurry shot doesn't punish you.
      </>
    ),
  },
  {
    id: "what-photo",
    audience: "recipient",
    q: "I don't know what photo to take",
    a: (
      <>
        Read the title and short instruction on the screen, then take the clearest photo you can. If something important is missing, you'll get a heads-up to retake.
      </>
    ),
  },
  {
    id: "feedback-meaning",
    audience: "recipient",
    q: "What does the photo feedback mean?",
    a: (
      <>
        <strong>Looks good</strong> — keep going. <strong>Usable, but could be clearer</strong> — it'll probably work. <strong>This probably needs a retake</strong> — the business may not be able to use it.
      </>
    ),
  },
  {
    id: "rejected",
    audience: "recipient",
    q: "Why did it ask me to retake?",
    a: (
      <>
        It catches the usual stuff: subject missing, too dark, blurry, glare, cut off, or text that can't be read.
      </>
    ),
  },
  {
    id: "already-submitted",
    audience: "recipient",
    q: "I already submitted — can I add more?",
    a: (
      <>
        Only if the business asks. They'll send a fresh link that opens straight to what they need.
      </>
    ),
  },
  {
    id: "find-request",
    audience: "recipient",
    q: "I can't find my request",
    a: (
      <>
        Search your email or texts for the message from the business. The link works on any device. Still stuck? Ask them to resend it.
      </>
    ),
  },
  {
    id: "mobile",
    audience: "recipient",
    q: "Does this work on my phone?",
    a: (
      <>
        Yes. It's built phone-first. Tap <strong>Take photo</strong> and your camera opens.
      </>
    ),
  },
  {
    id: "confusing",
    audience: "recipient",
    q: "Something looks off",
    a: (
      <>
        Reach out to the business that sent you the link. They can clarify or resend a clean one.
      </>
    ),
  },
];
