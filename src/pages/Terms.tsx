import { NavLink } from "react-router-dom";
import { ArrowRight, FileText, Mail, Scale } from "lucide-react";

import { PageMeta } from "@/hooks/seo/usePageMeta";
import { Button } from "@/components/ui/button";

const updatedAt = "January 2026";

const sections = [
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
      "You agree not to upload illegal content, malware, content that violates another person’s rights, or highly sensitive information unless there is a clear lawful reason and the business has requested it appropriately.",
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
    title: "Plans, billing, and beta offers",
    body: [
      "Paid plans, beta offers, founding partner discounts, top-ups, trials, and feature availability may change over time. Pricing and plan details are shown in the product or on the pricing page.",
      "Unless stated otherwise, fees are non-refundable except where required by law or expressly offered by PhotoBrief. You are responsible for applicable taxes and for keeping billing information current.",
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
      "PhotoBrief is provided on an “as is” and “as available” basis. We do not promise uninterrupted availability, error-free operation, perfect security, or that every recipient will complete a request correctly.",
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

      <div className="relative overflow-hidden bg-background">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-ambient-future opacity-70" />
        <div aria-hidden className="future-grid pointer-events-none absolute inset-0 opacity-45" />

        <section className="relative mx-auto max-w-5xl px-4 pb-10 pt-16 sm:px-6 lg:px-8 lg:pt-20">
          <div className="rounded-[2rem] border bg-card/80 p-6 shadow-[0_30px_90px_-60px_hsl(222_47%_11%/0.55)] backdrop-blur sm:p-8 lg:p-10">
            <span className="inline-flex items-center gap-2 rounded-full border bg-background/70 px-3 py-1 text-xs font-semibold text-primary">
              <Scale className="h-3.5 w-3.5" /> Terms of Service
            </span>
            <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-tight text-foreground sm:text-6xl">
              The ground rules for using PhotoBrief.
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
              These terms are written for a practical B2B photo intake product: clear responsibilities, clear limits, and no fake legal theater.
            </p>
            <p className="mt-4 text-sm text-muted-foreground">Last updated: {updatedAt}</p>
          </div>
        </section>

        <section className="relative mx-auto grid max-w-5xl gap-6 px-4 pb-16 sm:px-6 lg:grid-cols-[15rem_minmax(0,1fr)] lg:px-8 lg:pb-24">
          <aside className="h-fit rounded-[1.5rem] border bg-card/70 p-4 text-sm text-muted-foreground shadow-sm backdrop-blur lg:sticky lg:top-28">
            <p className="font-semibold text-foreground">Quick note</p>
            <p className="mt-2 leading-6">
              This page is a practical product terms draft. Have counsel review it before relying on it as your final legal agreement.
            </p>
            <Button asChild variant="outline" className="mt-4 w-full rounded-2xl bg-background/70">
              <NavLink to="/privacy">View Privacy <ArrowRight className="ml-2 h-4 w-4" /></NavLink>
            </Button>
          </aside>

          <div className="space-y-4">
            {sections.map((section) => (
              <article key={section.title} className="rounded-[1.5rem] border bg-card/80 p-5 shadow-sm backdrop-blur sm:p-6">
                <h2 className="flex items-center gap-2 text-xl font-semibold tracking-tight text-foreground">
                  <FileText className="h-5 w-5 text-primary" /> {section.title}
                </h2>
                <div className="mt-3 space-y-3 text-sm leading-7 text-muted-foreground sm:text-base">
                  {section.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </article>
            ))}

            <article className="rounded-[1.5rem] border bg-primary/5 p-5 sm:p-6">
              <h2 className="flex items-center gap-2 text-xl font-semibold tracking-tight text-foreground">
                <Mail className="h-5 w-5 text-primary" /> Contact
              </h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base">
                Questions about these Terms can be sent to <a className="font-semibold text-primary underline-offset-4 hover:underline" href="mailto:hello@photobrief.ai">hello@photobrief.ai</a>.
              </p>
            </article>
          </div>
        </section>
      </div>
    </>
  );
}
