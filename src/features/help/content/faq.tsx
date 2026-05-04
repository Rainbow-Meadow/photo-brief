export type FaqItem = { id: string; q: string; a: React.ReactNode; audience: "business" | "recipient" };

export const faqItems: FaqItem[] = [
  {
    id: "founding-beta",
    audience: "business",
    q: "How does the Founding Partner Beta work?",
    a: (
      <>
        PhotoBrief.ai is currently invite-only. Accepted founding partners get 90 days of free beta access, concierge setup, direct support, priority feature influence, and 50% off their first year after launch. In return, we ask that partners use PhotoBrief in real workflows and share honest feedback every two weeks.
      </>
    ),
  },
  {
    id: "recipient-account",
    audience: "business",
    q: "Do customers need an account?",
    a: <>No. They open a link, follow the mobile photo workflow, and submit. No app. No login.</>,
  },
  {
    id: "manual-or-automated",
    audience: "business",
    q: "What can I do on Free or Starter?",
    a: (
      <>
        Every plan can create and send clickable PhotoBrief links manually. Free and Starter are the lowest-friction way to prove the workflow before connecting website automation. Pro and above keep manual links and add Website Intake.
      </>
    ),
  },
  {
    id: "website-intake",
    audience: "business",
    q: "What is Website Intake?",
    a: (
      <>
        Website Intake turns website leads into PhotoBrief requests automatically. It unlocks on <strong>Pro</strong> because it includes a hosted intake form, a branded website badge/embed, template routing, auto-send behavior, and webhook/integration setup.
      </>
    ),
  },
  {
    id: "hosted-intake",
    audience: "business",
    q: "What should I put on my website?",
    a: (
      <>
        For the most consistent customer experience, use the branded PhotoBrief.ai intake badge. It explains why the photo request helps the customer, keeps PhotoBrief branding consistent, and links into your hosted intake flow. A plain button like <strong>Get a quote</strong>, <strong>Request service</strong>, or <strong>Start request</strong> also works when the website builder does not support iframe embeds.
      </>
    ),
  },
  {
    id: "intake-badge",
    audience: "business",
    q: "What is the PhotoBrief.ai website badge?",
    a: (
      <>
        The badge is a small embeddable website block, similar in spirit to a trusted payment badge. It shows the PhotoBrief.ai logo, tells customers they are starting a guided photo request, explains that it helps the business review faster with fewer follow-ups, and opens your hosted intake link.
      </>
    ),
  },
  {
    id: "badge-or-link",
    audience: "business",
    q: "Should I use the badge, a hosted link, or a webhook?",
    a: (
      <>
        Use the badge when your website can embed an iframe or custom HTML. Use a hosted link behind a normal button when the site only allows links. Use the webhook only when you need to keep an existing form exactly as-is or you already use an automation tool. All Website Intake paths unlock on Pro.
      </>
    ),
  },
  {
    id: "website-tools",
    audience: "business",
    q: "Which website tools does PhotoBrief work with?",
    a: (
      <>
        Anything that can embed an iframe or link a button to a web address can use Website Intake on Pro. The setup guide includes simple paths for Wix, Squarespace, WordPress, Elementor, Webflow, Shopify, GoDaddy, Carrd, and Zapier/Make.
      </>
    ),
  },
  {
    id: "existing-form",
    audience: "business",
    q: "Can I use my existing website form?",
    a: (
      <>
        Yes on Pro. Copy the webhook URL from <strong>Website Intake</strong> into your form tool, then map your fields to name, email, phone, request type, message, and address. This is the advanced path; most businesses should start with the branded badge or hosted link.
      </>
    ),
  },
  {
    id: "ai-routing",
    audience: "business",
    q: "How does Website Intake choose a template?",
    a: (
      <>
        It checks your exact/contains rules first. If no rule matches, it can try a conservative AI match using only your configured rules. If that is not confident enough, it uses your fallback template.
      </>
    ),
  },
  {
    id: "create-template",
    audience: "business",
    q: "What is the best way to make a template?",
    a: (
      <>
        Start from <strong>Requests → New request</strong>. Use AI to build a simple request, edit it, then save it as a template. Keep templates focused: a few photos and only necessary questions.
      </>
    ),
  },
  {
    id: "branding",
    audience: "business",
    q: "Can I show my own logo to customers?",
    a: (
      <>
        Yes. Go to <strong>Settings → Brand</strong> to upload your logo and pick your brand colour. Your customer-facing request and intake pages can use your business branding by plan, while the hosted Website Intake badge keeps the PhotoBrief.ai trust mark visible so customers recognize the guided photo request experience.
      </>
    ),
  },
  {
    id: "more-photos",
    audience: "business",
    q: "How do I ask for a retake?",
    a: (
      <>
        Open the submission, choose <strong>Ask for more</strong>, select only the photos that need redoing, add a short note, and send. The customer gets a link that opens only the flagged items.
      </>
    ),
  },
  {
    id: "pricing-photos",
    audience: "business",
    q: "What counts toward usage?",
    a: (
      <>
        PhotoBrief is designed around photo usage, not just raw request count. Simple requests use fewer photos; bigger requests use more. First-pass follow-up retakes are handled separately so customers can fix a submission without feeling punished.
      </>
    ),
  },
  {
    id: "what-photo",
    audience: "recipient",
    q: "I don’t know what photo to take",
    a: (
      <>
        Read the photo title and short instruction on the screen. Take the clearest photo you can. If something important is missing, PhotoBrief will suggest a retake.
      </>
    ),
  },
  {
    id: "feedback-meaning",
    audience: "recipient",
    q: "What does the photo feedback mean?",
    a: (
      <>
        <strong>Looks good</strong> means continue. <strong>Usable, but could be clearer</strong> means the photo may still work. <strong>This probably needs a retake</strong> means the business may not be able to use it as-is.
      </>
    ),
  },
  {
    id: "rejected",
    audience: "recipient",
    q: "Why did PhotoBrief suggest a retake?",
    a: (
      <>
        It looks for simple issues: the requested subject is missing, the photo is too dark, blurry, has glare, cuts off the subject, or has an unreadable label/text.
      </>
    ),
  },
  {
    id: "already-submitted",
    audience: "recipient",
    q: "I already submitted — can I add more?",
    a: (
      <>
        Only if the business asks for more. They’ll send a new link that opens straight to the photos they need redone.
      </>
    ),
  },
  {
    id: "find-request",
    audience: "recipient",
    q: "I can’t find my request",
    a: (
      <>
        Search your email or texts for the message from the business. The link works on any device. If you still cannot find it, ask the business to resend the link.
      </>
    ),
  },
  {
    id: "mobile",
    audience: "recipient",
    q: "Does this work on my phone?",
    a: (
      <>
        Yes. PhotoBrief is built for phones first. Tap <strong>Take photo</strong> and your phone opens the camera.
      </>
    ),
  },
  {
    id: "confusing",
    audience: "recipient",
    q: "Something looks confusing",
    a: (
      <>
        Reach out to the business that sent you the request. They can explain what they need or send a fresh link if something went wrong.
      </>
    ),
  },
];
