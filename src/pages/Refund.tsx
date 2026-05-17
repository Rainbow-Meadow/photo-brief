import { PageMeta } from "@/hooks/seo/usePageMeta";
import { LegalPage, type LegalSection } from "@/components/legal/LegalPage";

const updatedAt = "January 2026";
const SELLER_NAME = "Patrick Ryan Berthiaume";

const sections: LegalSection[] = [
  {
    title: "30-day money-back guarantee",
    body: [
      `${SELLER_NAME} (operating PhotoBrief.ai) offers a 30-day money-back guarantee on all paid PhotoBrief subscriptions. If you are not satisfied with PhotoBrief, you may request a full refund within 30 days of your initial order date.`,
      "This applies to first-time subscription purchases. Renewals can also be refunded on a case-by-case basis if you contact us promptly after the renewal charge.",
    ],
  },
  {
    title: "How to request a refund",
    body: [
      "All PhotoBrief payments are processed by our Merchant of Record, Paddle (Paddle.com Market Limited). Refunds are issued through Paddle.",
      "To request a refund, visit https://paddle.net and look up your order using the email address you used at checkout, or contact us at hello@photobrief.ai and we will help process your request through Paddle.",
      "Refund handling, timing, and method are governed by Paddle's Buyer Terms (https://www.paddle.com/legal/checkout-buyer-terms) and Paddle's Refund Policy (https://www.paddle.com/legal/refund-policy).",
    ],
  },
  {
    title: "After a refund",
    body: [
      "Once a refund is approved, your PhotoBrief subscription will be cancelled and access to paid features will end at the close of the current billing period or immediately, depending on the refund type.",
      "Workspace data (requests, briefs, customers, submissions) may be retained for a limited period in accordance with our Privacy Policy and then deleted.",
    ],
  },
  {
    title: "Questions",
    body: [
      "If you have questions about a charge, a refund, or your subscription, contact hello@photobrief.ai before disputing the charge with your bank or card issuer. Most issues can be resolved within one business day.",
    ],
  },
];

export default function RefundPage() {
  return (
    <>
      <PageMeta
        title="Refund Policy | PhotoBrief.ai"
        description="PhotoBrief.ai offers a 30-day money-back guarantee. Refunds are processed through our Merchant of Record, Paddle."
        canonicalPath="/refund-policy"
        breadcrumbs={[{ name: "Home", path: "/" }, { name: "Refund Policy", path: "/refund-policy" }]}
      />
      <LegalPage title="Refund Policy" updatedAt={updatedAt} sections={sections} />
    </>
  );
}
