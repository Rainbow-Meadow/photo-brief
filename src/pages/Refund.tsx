import { Mail, RefreshCcw } from "lucide-react";

import { PageMeta } from "@/hooks/seo/usePageMeta";
import { Section, Container } from "@/design-system/schema";

const updatedAt = "January 2026";
const SELLER_NAME = "Patrick Ryan Berthiaume";

const sections = [
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

      <Section><Container width="narrow">
        <p className="inline-flex items-baseline gap-2 font-mono text-[0.7rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          <span className="inline-block h-px w-8 -translate-y-[0.25em] bg-[hsl(var(--accent-kinetic))]" />
          <span className="text-[hsl(var(--accent-kinetic))]">[ 00 ]</span>
          <span className="inline-flex items-center gap-1.5"><RefreshCcw className="h-3.5 w-3.5" /> Refund Policy</span>
        </p>
        <h1 className="mt-5 max-w-3xl text-[clamp(2.25rem,5vw,3.75rem)] font-semibold leading-[1.02] tracking-[-0.022em] text-foreground">
          30-day money-back guarantee.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Try PhotoBrief risk-free. If it's not for you, get a full refund within 30 days — no hoops.
        </p>
        <p className="mt-4 font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
          Last updated: {updatedAt}
        </p>
      </Container></Section>

      <Section size="tight"><Container width="narrow">
        <div className="space-y-4">
          {sections.map((section, i) => (
            <article key={section.title} className="border border-border bg-card p-6 sm:p-8">
              <p className="font-mono text-[0.65rem] font-medium uppercase tracking-[0.18em] text-[hsl(var(--accent-kinetic))]">
                [ {String(i + 1).padStart(2, "0")} ]
              </p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground">{section.title}</h2>
              <div className="mt-4 space-y-3 text-sm leading-7 text-muted-foreground sm:text-base">
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </article>
          ))}

          <article className="border border-[hsl(var(--accent-sage)/0.4)] bg-[hsl(var(--accent-sage)/0.06)] p-6 sm:p-8">
            <h2 className="flex items-center gap-2 text-xl font-semibold tracking-tight text-foreground">
              <Mail className="h-5 w-5 text-[hsl(var(--accent-sage))]" /> Contact
            </h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base">
              Questions about a refund?{" "}
              <a className="font-semibold text-[hsl(var(--accent-kinetic))] underline-offset-4 hover:underline" href="mailto:hello@photobrief.ai">
                hello@photobrief.ai
              </a>
            </p>
          </article>
        </div>
      </Container></Section>
    </>
  );
}
