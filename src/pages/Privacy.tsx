import { Mail, ShieldCheck } from "lucide-react";

import { PageMeta } from "@/hooks/seo/usePageMeta";

const updatedAt = "January 2026";

const sections = [
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
      "Payment information may be processed by our payment provider. PhotoBrief does not intentionally store full payment card numbers in the app.",
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
    title: "Sharing information",
    body: [
      "We share information with service providers that help us host, secure, analyze, support, communicate, and process payments for PhotoBrief.",
      "We may share information when required by law, to protect rights and safety, to prevent abuse, or as part of a business transaction such as a merger, financing, acquisition, or sale of assets.",
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

      <div className="relative overflow-hidden bg-background">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-ambient-future opacity-70" />
        <div aria-hidden className="future-grid pointer-events-none absolute inset-0 opacity-45" />

        <section className="pb-container-narrow pb-section">
          <div className="rounded-[2rem] border-white/[0.06] border bg-white/[0.03] p-6 shadow-[0_30px_90px_-60px_hsl(222_47%_11%/0.35)] backdrop-blur sm:p-8 lg:p-10">
            <span className="inline-flex items-center gap-2 rounded-full border-white/[0.08] border bg-white/[0.04] px-3 py-1 text-xs font-semibold text-primary">
              <ShieldCheck className="h-3.5 w-3.5" /> Privacy Policy
            </span>
            <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-tight text-foreground sm:text-6xl">
              How PhotoBrief handles customer photo intake data.
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
              This policy explains what we collect, why we use it, and how businesses and recipients should think about PhotoBrief data.
            </p>
            <p className="mt-4 text-sm text-muted-foreground">Last updated: {updatedAt}</p>
          </div>
        </section>

        <section className="pb-container-narrow pb-section">
          <div className="space-y-4">
            {sections.map((section) => (
              <article key={section.title} className="rounded-[1.5rem] border border-white/[0.06] bg-white/[0.03] p-5 backdrop-blur sm:p-6">
                <h2 className="text-xl font-semibold tracking-tight text-foreground">{section.title}</h2>
                <div className="mt-3 space-y-3 text-sm leading-7 text-muted-foreground sm:text-base">
                  {section.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </article>
            ))}

            <article className="rounded-[1.5rem] border border-white/[0.06] bg-primary/5 p-5 sm:p-6">
              <h2 className="flex items-center gap-2 text-xl font-semibold tracking-tight text-foreground">
                <Mail className="h-5 w-5 text-primary" /> Contact
              </h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base">
                Questions about this policy can be sent to <a className="font-semibold text-primary underline-offset-4 hover:underline" href="mailto:hello@photobrief.ai">hello@photobrief.ai</a>.
              </p>
            </article>
          </div>
        </section>
      </div>
    </>
  );
}
