import type { GuideStepProps } from "../components/GuideStep";

export const quickStartSteps: GuideStepProps[] = [
  {
    number: 1,
    title: "Create a photo request",
    body: (
      <>
        Open <strong>Requests → New request</strong>. Start with AI, choose a saved template,
        or tap <strong>Start blank</strong>. The goal is simple: tell the customer exactly what
        photos you need.
      </>
    ),
    screenshot: {
      src: "/help/requests-new-template.svg",
      alt: "The Create a photo request page with simple AI setup and draft preview",
      pins: [
        { x: 18, y: 18, label: 1, note: "Build with AI, use a saved template, or start blank" },
        { x: 24, y: 50, label: 2, note: "Answer a few simple setup questions" },
        { x: 78, y: 50, label: 3, note: "Review the request before sending" },
      ],
    },
    whatYouSee: <>A simple setup card on the left and an editable request preview on the right.</>,
  },
  {
    number: 2,
    title: "Tell AI the essentials",
    body: (
      <>
        If you use AI, answer the short setup questions: what the request is for, how many photos
        you want, any must-have photos, and any questions the customer must answer.
      </>
    ),
    tip: <>Keep it boring. Two to five photos and one or two questions is usually enough.</>,
  },
  {
    number: 3,
    title: "Check the photos and questions",
    body: (
      <>
        Review the generated draft. Each photo step should be clear enough that a customer can do
        it without calling you. Edit the wording, remove anything extra, then add the customer’s
        name and email or phone.
      </>
    ),
  },
  {
    number: 4,
    title: "Create the request",
    body: (
      <>
        Tap <strong>Create request</strong>. PhotoBrief creates a secure link and emails it
        automatically when an email is available. You can also copy the link from the request page.
      </>
    ),
    whatYouSee: <>A confirmation toast, then the request detail page.</>,
  },
  {
    number: 5,
    title: "Review the finished brief",
    body: (
      <>
        When the customer finishes, open the request. You’ll see the photos, simple AI notes, any
        answers, and a summary. Accept it or ask only for the specific retakes you need.
      </>
    ),
    tip: <>Follow-up retakes are built for first-pass cleanup, not making the customer redo everything.</>,
  },
];

export const quickStartChecklist = [
  { id: "qs-1", label: "Open Requests → New request" },
  { id: "qs-2", label: "Build with AI, saved template, or blank" },
  { id: "qs-3", label: "Keep the request to the photos that matter" },
  { id: "qs-4", label: "Add customer name + email/phone" },
  { id: "qs-5", label: "Create request and review the finished brief" },
];
