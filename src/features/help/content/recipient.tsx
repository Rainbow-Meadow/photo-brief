import type { GuideStepProps } from "../components/GuideStep";

export const recipientSteps: GuideStepProps[] = [
  {
    number: 1,
    title: "Open the link",
    body: (
      <>
        Tap the PhotoBrief link from the business. It works in your phone browser. You do not need
        an app or account.
      </>
    ),
    whatYouSee: <>A simple welcome screen with the business name and how many photos are needed.</>,
  },
  {
    number: 2,
    title: "Tap Start",
    body: (
      <>
        The first screen tells you roughly how long it will take. Most requests are designed to be
        finished in a few minutes.
      </>
    ),
    screenshot: {
      src: "/help/recipient-chat.png",
      alt: "Mobile PhotoBrief welcome and first photo step",
      ratio: "9/16",
      pins: [
        { x: 50, y: 12, label: 1, note: "Progress: how close you are to done" },
        { x: 50, y: 42, label: 2, note: "One photo step at a time" },
        { x: 50, y: 78, label: 3, note: "Big Take photo button" },
      ],
    },
  },
  {
    number: 3,
    title: "Take or choose a photo",
    body: (
      <>
        For each step, tap <strong>Take photo</strong>. You can also choose a photo from your
        library if you already have one. PhotoBrief uploads it and checks that photo before moving
        on.
      </>
    ),
  },
  {
    number: 4,
    title: "Read the simple feedback",
    body: (
      <>
        After each photo, PhotoBrief gives one simple result: <strong>Looks good</strong>,
        <strong> Usable, but could be clearer</strong>, or <strong>This probably needs a retake</strong>.
      </>
    ),
    screenshot: {
      src: "/help/recipient-feedback.png",
      alt: "Simple photo feedback with retake and keep options",
      ratio: "9/16",
      pins: [
        { x: 50, y: 35, label: 1, note: "Simple feedback" },
        { x: 30, y: 75, label: 2, note: "Retake if it helps" },
        { x: 70, y: 75, label: 3, note: "Keep if it is usable" },
      ],
    },
  },
  {
    number: 5,
    title: "Retake only when needed",
    body: (
      <>
        A mild warning means the photo may still work. A stronger warning means retaking is the
        safest choice. The feedback will tell you what to fix, like glare, blur, darkness, a cut-off
        subject, or unreadable label.
      </>
    ),
    warn: <>Keeping a clearly bad photo may slow things down if the business needs to ask again.</>,
  },
  {
    number: 6,
    title: "Answer any short questions",
    body: (
      <>
        Some requests include one or two short questions. Answer them, then continue. If there are
        no questions, you’ll go straight to review.
      </>
    ),
  },
  {
    number: 7,
    title: "Review and send",
    body: (
      <>
        At the end, check the photos and answers once. Tap <strong>Send</strong>. You’ll see a
        confirmation screen, and the business will receive your finished brief.
      </>
    ),
    screenshot: {
      src: "/help/recipient-review.png",
      alt: "Review screen with photo thumbnails and send button",
      ratio: "9/16",
    },
    whatYouSee: <>A confirmation page that tells you the photos were sent.</>,
  },
];
