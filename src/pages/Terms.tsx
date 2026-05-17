import { PageMeta } from "@/hooks/seo/usePageMeta";
import { LegalPage, type LegalSection } from "@/components/legal/LegalPage";

const updatedAt = "January 2026";
const SELLER_NAME = "Patrick Ryan Berthiaume";

const sections: LegalSection[] = [
  {
    title: "Who you are contracting with",
    body: [
      `PhotoBrief.ai is operated by ${SELLER_NAME} ("PhotoBrief", "we", "us", "our"). When you use PhotoBrief, you are entering into an agreement with ${SELLER_NAME}.`,
      "You can contact us at hello@photobrief.ai for any question about these Terms or your account.",
    ],
  },
  {
    title: "Agreement to these Terms",
    body: [
      "These Terms of Service govern access to and use of PhotoBrief.ai. By creating an account, using the product, submitting content, or accessing a PhotoBrief request link, you agree to these Terms.",
      "If you use PhotoBrief on behalf of a business or organization, you represent that you have authority to accept these Terms for that business or organization.",
    ],
  },
  {
    title: "What PhotoBrief provides",
    body: [
      "PhotoBrief helps businesses create guided photo requests, collect customer photos and answers, run simple checks, and organize submissions into business-ready briefs.",
      "PhotoBrief does not guarantee that a submission is complete, accurate, legally sufficient, safe to rely on, or appropriate for a specific quote, dispatch, approval, claim, or decision. Businesses remain responsible for reviewing submissions and making their own decisions.",
    ],
  },
  {
    title: "Accounts and workspace responsibility",
    body: [
      "You are responsible for keeping account credentials secure, limiting team access, maintaining accurate workspace information, and all activity that occurs under your account or workspace.",
      "You must not use PhotoBrief to collect information you do not have the right to request, or to mislead recipients about who is requesting the information or why it is being requested.",
    ],
  },
  {
    title: "Recipient communications and consent",
    body: [
      "Businesses are responsible for their communications with customers and recipients, including having permission or another lawful basis to contact them and request photos, answers, or documentation.",
      "When using manual copy/paste text flows, email, SMS, website intake, embeds, automations, or third-party messaging tools, the business is responsible for complying with applicable communications, privacy, consumer protection, and anti-spam laws.",
      "PhotoBrief may provide message templates or suggested wording, but the business is responsible for reviewing and deciding what to send.",
    ],
  },
  {
    title: "Customer submissions and uploaded content",
    body: [
      "You retain ownership of content you upload or submit. By using PhotoBrief, you grant us the rights needed to host, process, transmit, display, analyze, summarize, and store that content so we can provide the service.",
      "You agree not to upload illegal content, malware, content that violates another person's rights, or highly sensitive information unless there is a clear lawful reason and the business has requested it appropriately.",
      "Businesses are responsible for how they use, download, store, share, or act on customer submissions after receiving them through PhotoBrief.",
    ],
  },
  {
    title: "AI and automated checks",
    body: [
      "PhotoBrief may use AI or automated checks to flag obvious photo issues, summarize submissions, or assist with review. These outputs can be incomplete, incorrect, or unsuitable for a particular use.",
      "Do not rely on AI output as the sole basis for safety, legal, financial, insurance, medical, or other high-stakes decisions. Human review remains required.",
    ],
  },
  {
    title: "Acceptable use",
    body: [
      "You may not abuse, reverse engineer, attack, overload, scrape, resell, or interfere with PhotoBrief; use PhotoBrief to send spam or deceptive requests; violate laws; infringe rights; or attempt to access data you are not authorized to access.",
      "We may suspend or terminate access if we believe use of PhotoBrief creates risk, violates these Terms, or harms the product, other users, recipients, or third parties.",
    ],
  },
  {
    title: "Plans, billing, and offers",
    body: [
      "Paid plans, promotional offers, top-ups, trials, and feature availability may change over time. Pricing and plan details are shown in the product or on the pricing page. You are responsible for applicable taxes (where not collected by Paddle) and for keeping billing information current.",
      "Our order process is conducted by our online reseller Paddle.com (Paddle.com Market Limited). Paddle is the Merchant of Record for all our orders. Paddle provides all customer service inquiries related to billing and handles returns. Subscription billing, payment processing, tax calculation and remittance, invoicing, cancellations, refunds, and chargebacks are governed by Paddle's Buyer Terms (https://www.paddle.com/legal/checkout-buyer-terms) and Paddle's Refund Policy (https://www.paddle.com/legal/refund-policy).",
      "PhotoBrief offers a 30-day money-back guarantee on initial paid subscriptions. See our Refund Policy at /refund-policy for details on how to request a refund through Paddle.",
    ],
  },
  {
    title: "Third-party services",
    body: [
      "PhotoBrief may integrate with third-party services such as hosting, database, payment, email, SMS, analytics, automation, or storage providers. Third-party services may have their own terms and privacy practices.",
      "We are not responsible for third-party services outside our control, including messaging carriers, email providers, customer devices, website builders, or automation platforms.",
    ],
  },
  {
    title: "Disclaimers and limitation of liability",
    body: [
      "PhotoBrief is provided on an \u201cas is\u201d and \u201cas available\u201d basis. We do not promise uninterrupted availability, error-free operation, perfect security, or that every recipient will complete a request correctly.",
      "To the maximum extent permitted by law, PhotoBrief and its owners, employees, contractors, and service providers will not be liable for indirect, incidental, consequential, special, exemplary, or punitive damages, or lost profits, revenue, goodwill, or data.",
    ],
  },
  {
    title: "Changes to these Terms",
    body: [
      "We may update these Terms as PhotoBrief changes. If changes are material, we will take reasonable steps to notify users. Continued use of PhotoBrief after changes become effective means you accept the updated Terms.",
    ],
  },
];

export default function TermsPage() {
  return (
    <>
      <PageMeta
        title="Terms of Service | PhotoBrief.ai"
        description="Review the terms that govern use of PhotoBrief.ai and guided customer photo intake workflows."
        canonicalPath="/terms"
        breadcrumbs={[{ name: "Home", path: "/" }, { name: "Terms of Service", path: "/terms" }]}
      />
      <LegalPage title="Terms of Service" updatedAt={updatedAt} sections={sections} />
    </>
  );
}
