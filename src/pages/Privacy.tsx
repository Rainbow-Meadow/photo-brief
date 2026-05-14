import { Mail, ShieldCheck } from "lucide-react";

import { PageMeta } from "@/hooks/seo/usePageMeta";
import { Section, Container } from "@/design-system/schema";

const updatedAt = "January 2026";

const SELLER_NAME = "Patrick Ryan Berthiaume";

const sections = [
  {
    title: "Who we are",
    body: [
      `PhotoBrief.ai is operated by ${SELLER_NAME} ("PhotoBrief", "we", "us", "our"). For the personal data described in this policy, ${SELLER_NAME} acts as the data controller and decides how and why personal data is processed.`,
      "You can contact us at hello@photobrief.ai for any privacy-related question, including requests to access, correct, export, or delete your data.",
    ],
  },
  {
    title: "What PhotoBrief does",
    body: [
      "PhotoBrief.ai helps businesses create guided photo requests and receive customer submissions in a structured brief. That means we handle account information, business workspace information, customer contact details entered by a business, request links, uploaded photos, answers, notes, and related activity records.",
      "We use this information to provide the product, secure accounts, route requests, support customers, improve the service, and communicate about PhotoBrief.",
    ],
  },
  {
    title: "Information we collect",
    body: [
      "Account and workspace information, such as name, email address, business name, workspace settings, plan information, and team membership.",
      "Request and recipient information, such as customer names, email addresses, phone numbers, request messages, PhotoBrief links, guide templates, uploaded photos, answers, and submission metadata.",
      "Usage and device information, such as pages viewed, actions taken, browser/device details, approximate location derived from IP address, log data, and diagnostic information.",
      "Payment information (card details, billing address, tax identifiers) is collected and processed directly by our Merchant of Record, Paddle.com Market Limited (\"Paddle\"). PhotoBrief does not store full payment card numbers — we only receive limited transaction metadata (such as plan, status, last four digits, and country) needed to provision your subscription.",
    ],
  },
  {
    title: "How we use information",
    body: [
      "To create, send, display, organize, and review PhotoBrief requests and submissions.",
      "To operate account login, workspace access, billing, support, analytics, abuse prevention, and security monitoring.",
      "To improve templates, onboarding, product flows, and reliability. When we use examples for internal improvement, we aim to limit access and avoid unnecessary exposure of customer content.",
      "To send transactional messages, product updates, support responses, security notices, and billing notices.",
    ],
  },
  {
    title: "Customer photos and submissions",
    body: [
      "Businesses are responsible for choosing what they request from their customers and for having the rights, permissions, or consent needed to collect that information.",
      "Recipients should not upload sensitive information unless the business has specifically requested it and has a lawful reason to collect it. PhotoBrief is designed for practical photo intake, not for collecting highly sensitive personal records.",
      "We may process uploaded photos, answers, and request context to generate simple checks, summaries, or review signals for the business. These outputs are meant to assist review, not replace human judgment.",
    ],
  },
  {
    title: "Legal basis for processing",
    body: [
      "Where applicable law (such as UK/EU GDPR) requires a legal basis to process personal data, we rely on: (a) performance of a contract — to provide PhotoBrief to you and your workspace; (b) legitimate interests — to secure, improve, support, and market the service in a proportionate way; (c) consent — where you have given it (for example, optional marketing emails or non-essential cookies); and (d) legal obligation — to meet tax, accounting, security, and law-enforcement requirements.",
      "You can withdraw consent at any time where consent is the legal basis, without affecting the lawfulness of prior processing.",
    ],
  },
  {
    title: "Sharing information",
    body: [
      "We share information with service providers (sub-processors) that help us host, secure, analyze, support, and communicate for PhotoBrief — including cloud hosting, database, email/SMS delivery, analytics, and customer support tooling.",
      "We share order, billing, tax, and contact information with our Merchant of Record, Paddle.com Market Limited (\"Paddle\"), so that Paddle can process payments, handle subscription billing, calculate and remit sales tax/VAT, issue invoices, and manage refunds and chargebacks. Paddle acts as an independent controller for the personal data it processes for these purposes. Paddle's privacy notice is available at https://www.paddle.com/legal/privacy.",
      "We may share information with professional advisers (legal, accounting), and when required by law, to protect rights and safety, to prevent abuse, or as part of a business transaction such as a merger, financing, acquisition, or sale of assets.",
      "We do not sell customer conversations, request content, or uploaded photos to advertisers.",
    ],
  },
  {
    title: "Retention and deletion",
    body: [
      "We keep information for as long as needed to provide PhotoBrief, comply with legal obligations, resolve disputes, enforce agreements, maintain security, and support legitimate business needs.",
      "Businesses may delete or archive requests, customers, and submissions through the product where supported. Some records may remain in backups, logs, billing records, or audit trails for a limited period.",
    ],
  },
  {
    title: "Security",
    body: [
      "We use reasonable administrative, technical, and organizational safeguards designed to protect PhotoBrief data. No internet service can guarantee perfect security, so businesses should use strong passwords, limit team access, and avoid requesting unnecessary sensitive information.",
    ],
  },
  {
    title: "Your choices",
    body: [
      "You can update account and workspace information in the product, unsubscribe from non-essential emails where available, and contact us about access, correction, export, deletion, or privacy questions.",
      "Some requests may need to be handled by the business that collected the information, especially where PhotoBrief acts as a service provider for that business.",
    ],
  },
  {
    title: "Changes to this policy",
    body: [
      "We may update this Privacy Policy as PhotoBrief changes. If changes are material, we will take reasonable steps to notify users, such as updating the effective date or providing an in-app or email notice.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <>
      <PageMeta
        title="Privacy Policy | PhotoBrief.ai"
        description="Learn how PhotoBrief.ai collects, uses, protects, and handles information for guided customer photo intake."
        canonicalPath="/privacy"
        breadcrumbs={[{ name: "Home", path: "/" }, { name: "Privacy Policy", path: "/privacy" }]}
      />

      <Section><Container width="narrow">
        <p className="inline-flex items-baseline gap-2 font-mono text-[0.7rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          <span className="inline-block h-px w-8 -translate-y-[0.25em] bg-[hsl(var(--accent-kinetic))]" />
          <span className="text-[hsl(var(--accent-kinetic))]">[ 00 ]</span>
          <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" /> Privacy Policy</span>
        </p>
        <h1 className="mt-5 max-w-3xl text-[clamp(2.25rem,5vw,3.75rem)] font-semibold leading-[1.02] tracking-[-0.022em] text-foreground">
          How PhotoBrief handles customer photo intake data.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          This policy explains what we collect, why we use it, and how businesses and recipients should think about PhotoBrief data.
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
              Questions about this policy can be sent to{" "}
              <a className="font-semibold text-[hsl(var(--accent-kinetic))] underline-offset-4 hover:underline" href="mailto:hello@photobrief.ai">
                hello@photobrief.ai
              </a>.
            </p>
          </article>
        </div>
      </Container></Section>
    </>
  );
}
