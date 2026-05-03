import type { GuideStepProps } from "../components/GuideStep";

export const businessSteps: GuideStepProps[] = [
  {
    number: 1,
    title: "What PhotoBrief does",
    body: (
      <>
        PhotoBrief turns messy customer inquiries into clear photo-ready briefs. You ask for the
        right photos once, customers complete a simple phone workflow, and you get the photos,
        answers, AI checks, and summary in one place.
      </>
    ),
  },
  {
    number: 2,
    title: "Start with one reusable template",
    body: (
      <>
        Open <strong>Requests → New request</strong> and build a request with AI. Tell it what the
        job is, how many photos you need, which photos are required, and any questions customers
        must answer. Save the result as a template when it looks right.
      </>
    ),
    tip: <>Your best first template is usually your most common quote, repair, return, or service intake.</>,
  },
  {
    number: 3,
    title: "Send a manual request",
    body: (
      <>
        Add the customer’s name and email or phone, then tap <strong>Create request</strong>. If
        you include an email, PhotoBrief sends the link automatically. You can always copy the link
        from the request page.
      </>
    ),
  },
  {
    number: 4,
    title: "Connect Website Intake",
    body: (
      <>
        Open <strong>Website Intake</strong>. Copy the hosted intake link and put it behind a
        button on your site like “Get a quote” or “Request service.” This is the easiest setup.
      </>
    ),
    whatYouSee: <>A hosted form link, a webhook URL, template routing rules, a test lead form, and recent intake events.</>,
  },
  {
    number: 5,
    title: "Choose what each website lead sends",
    body: (
      <>
        In Website Intake, choose a fallback template first. Then add simple routing rules like
        <strong> contains “repair” → Appliance repair intake</strong> or
        <strong> contains “quote” → Quote photos</strong>. If no rule matches, PhotoBrief can try
        a conservative AI match before using the fallback.
      </>
    ),
    tip: <>Rules first. AI second. Fallback last. That keeps automation useful without getting weird.</>,
  },
  {
    number: 6,
    title: "Use your existing website form if you want",
    body: (
      <>
        If your site already has a form, copy the <strong>webhook URL</strong> from Website Intake
        into your form tool, Zapier, Make, Webflow, or WordPress plugin. Then map your form fields
        to PhotoBrief fields: name, email, phone, request type, message, and address.
      </>
    ),
  },
  {
    number: 7,
    title: "Test before sharing",
    body: (
      <>
        Use the <strong>Send test lead</strong> box on Website Intake. It runs the same path as a
        real website submission and should create a customer, choose a template, and create a
        PhotoBrief request.
      </>
    ),
    warn: <>Use your own email while testing if auto-send is on.</>,
  },
  {
    number: 8,
    title: "What your customer sees",
    body: (
      <>
        Customers either open your hosted intake form or a PhotoBrief request link. The capture
        flow is mobile-first: welcome screen, one photo at a time, simple AI feedback, quick
        questions, review, and submit. No account. No app.
      </>
    ),
  },
  {
    number: 9,
    title: "Review the finished brief",
    body: (
      <>
        Open the completed request to see all photos, answers, and AI notes. The AI checks stay
        intentionally simple: requested subject, too dark, blurry, unreadable label, glare, or
        cropped subject.
      </>
    ),
    tip: <>Ask for more only when a specific photo blocks the job. The customer will only redo the flagged items.</>,
  },
  {
    number: 10,
    title: "Keep the system simple",
    body: (
      <>
        Make one template per common job type. Keep photo steps short. Use Website Intake for
        automatic leads. Use manual requests for one-off situations. That’s the whole operating
        model.
      </>
    ),
  },
];

export const businessChecklist = [
  { id: "biz-template", label: "Create one reusable template for my most common job" },
  { id: "biz-test", label: "Send a test request to myself" },
  { id: "biz-intake-link", label: "Copy my hosted Website Intake link" },
  { id: "biz-routing", label: "Add one routing rule and a fallback template" },
  { id: "biz-review", label: "Review one completed brief end-to-end" },
];
