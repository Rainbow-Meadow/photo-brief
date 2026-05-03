import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Building2, Globe2, HelpCircle, Rocket, Smartphone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { GuideStep } from "@/features/help/components/GuideStep";
import { GuideTOC, type TocItem } from "@/features/help/components/GuideTOC";
import { QuickChecklist } from "@/features/help/components/QuickChecklist";
import { Callout } from "@/features/help/components/Callout";
import { PageMeta } from "@/hooks/seo/usePageMeta";
import { buildFaqJsonLd } from "@/hooks/seo/buildFaqJsonLd";

import { quickStartSteps, quickStartChecklist } from "@/features/help/content/quickStart";
import { businessSteps, businessChecklist } from "@/features/help/content/business";
import { recipientSteps } from "@/features/help/content/recipient";
import { faqItems } from "@/features/help/content/faq";

const intakeSteps = [
  {
    number: 1,
    title: "Open Website Intake",
    body: <>Go to <strong>Website Intake</strong> in the sidebar. PhotoBrief creates one intake setup for your workspace.</>,
  },
  {
    number: 2,
    title: "Copy the hosted form link",
    body: <>Use this first. Put it behind a website button like <strong>Get a quote</strong> or <strong>Request service</strong>.</>,
    whatYouSee: <>A link that starts with your site URL and opens a simple public intake form.</>,
  },
  {
    number: 3,
    title: "Choose a fallback template",
    body: <>Pick the template PhotoBrief should use when nothing else clearly matches. This prevents dead ends.</>,
  },
  {
    number: 4,
    title: "Add one or two routing rules",
    body: <>Use plain words: <strong>repair</strong>, <strong>quote</strong>, <strong>return</strong>, <strong>roof</strong>. Rules choose templates before AI tries to help.</>,
    tip: <>Simple words beat clever automation. Start with the jobs customers actually ask for.</>,
  },
  {
    number: 5,
    title: "Send a test lead",
    body: <>Use the test box on the page. A good test creates a customer, chooses a template, creates a request, and sends you into the same flow a real lead will use.</>,
  },
];

const intakeChecklist = [
  { id: "intake-link", label: "Copy hosted intake link" },
  { id: "intake-fallback", label: "Choose fallback template" },
  { id: "intake-rule", label: "Add one routing rule" },
  { id: "intake-test", label: "Send a test lead" },
  { id: "intake-site", label: "Put the link on my website" },
];

const tocItems: TocItem[] = [
  { id: "quick-start", label: "Quick start" },
  { id: "business", label: "Business setup" },
  { id: "intake", label: "Website Intake" },
  { id: "recipient", label: "Customer flow" },
  { id: "faq", label: "FAQ" },
];

type TabValue = "quick" | "business" | "intake" | "recipient" | "faq";

const hashToTab: Record<string, TabValue> = {
  "#quick-start": "quick",
  "#business": "business",
  "#intake": "intake",
  "#recipient": "recipient",
  "#faq": "faq",
};

const tabToHash: Record<TabValue, string> = {
  quick: "#quick-start",
  business: "#business",
  intake: "#intake",
  recipient: "#recipient",
  faq: "#faq",
};

export default function BetaGuidePage() {
  const [tab, setTab] = useState<TabValue>("quick");

  useEffect(() => {
    const apply = () => {
      const next = hashToTab[window.location.hash];
      if (next) setTab(next);
    };
    apply();
    window.addEventListener("hashchange", apply);
    return () => window.removeEventListener("hashchange", apply);
  }, []);

  const handleTabChange = (v: string) => {
    const next = v as TabValue;
    setTab(next);
    if (window.location.hash !== tabToHash[next]) {
      history.replaceState(null, "", tabToHash[next]);
    }
  };

  const businessFaqs = useMemo(() => faqItems.filter((f) => f.audience === "business"), []);
  const recipientFaqs = useMemo(() => faqItems.filter((f) => f.audience === "recipient"), []);

  return (
    <div className="space-y-8">
      <PageMeta
        title="Help & setup guide | PhotoBrief"
        description="Simple visual setup guide for PhotoBrief: create requests, connect Website Intake, and show customers how photo capture works."
        canonicalPath="/help"
        ogType="article"
        jsonLd={[buildFaqJsonLd(faqItems)]}
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Help", path: "/help" },
        ]}
      />
      <header className="relative isolate overflow-hidden rounded-[2rem] border border-border/70 bg-card/85 p-6 shadow-[0_30px_90px_-55px_hsl(222_47%_11%/0.55)] backdrop-blur sm:p-10">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-56 bg-ambient-sky opacity-70" />
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
              <Rocket className="h-3.5 w-3.5 text-primary" /> Simple setup guide
            </span>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Set up PhotoBrief without overthinking it.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground">
              Build one useful template, send one test request, then connect Website Intake so new leads can turn into photo-ready briefs automatically.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm" className="rounded-full">
              <a href="#quick-start" onClick={() => handleTabChange("quick")}>
                Start here <ArrowRight className="ml-1 h-4 w-4" />
              </a>
            </Button>
            <Button asChild size="sm" variant="outline" className="rounded-full bg-background/70">
              <a href="#intake" onClick={() => handleTabChange("intake")}>
                Website Intake
              </a>
            </Button>
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <div className="sticky top-20">
            <GuideTOC items={tocItems} activeId={tabToHash[tab].slice(1)} />
          </div>
        </aside>

        <div className="min-w-0">
          <Tabs value={tab} onValueChange={handleTabChange} className="space-y-6">
            <TabsList className="flex w-full flex-wrap gap-1 rounded-2xl bg-muted/60 p-1">
              <TabsTrigger value="quick" className="gap-1.5 rounded-xl">
                <Rocket className="h-3.5 w-3.5" /> Start
              </TabsTrigger>
              <TabsTrigger value="business" className="gap-1.5 rounded-xl">
                <Building2 className="h-3.5 w-3.5" /> Setup
              </TabsTrigger>
              <TabsTrigger value="intake" className="gap-1.5 rounded-xl">
                <Globe2 className="h-3.5 w-3.5" /> Intake
              </TabsTrigger>
              <TabsTrigger value="recipient" className="gap-1.5 rounded-xl">
                <Smartphone className="h-3.5 w-3.5" /> Customer
              </TabsTrigger>
              <TabsTrigger value="faq" className="gap-1.5 rounded-xl">
                <HelpCircle className="h-3.5 w-3.5" /> FAQ
              </TabsTrigger>
            </TabsList>

            <TabsContent value="quick" id="quick-start" className="space-y-4 scroll-mt-24">
              <SectionIntro
                icon={<Rocket className="h-4 w-4" />}
                title="Quick start"
                body="The shortest path: create one request, send it to yourself, and review the result."
              />
              <QuickChecklist storageKey="pb.help.quickStart" items={quickStartChecklist} title="Do these first" />
              <div className="space-y-4">
                {quickStartSteps.map((step) => <GuideStep key={step.number} {...step} />)}
              </div>
            </TabsContent>

            <TabsContent value="business" id="business" className="space-y-4 scroll-mt-24">
              <SectionIntro
                icon={<Building2 className="h-4 w-4" />}
                title="Business setup"
                body="The simple operating model: reusable templates, clean requests, automatic intake."
              />
              <QuickChecklist storageKey="pb.help.business" items={businessChecklist} title="Recommended setup" />
              <div className="space-y-4">
                {businessSteps.map((step) => <GuideStep key={step.number} {...step} />)}
              </div>
            </TabsContent>

            <TabsContent value="intake" id="intake" className="space-y-4 scroll-mt-24">
              <SectionIntro
                icon={<Globe2 className="h-4 w-4" />}
                title="Website Intake"
                body="The easiest automation: put one hosted form link on your website and let PhotoBrief start the photo request."
              />
              <QuickChecklist storageKey="pb.help.intake" items={intakeChecklist} title="Website Intake setup" />
              <div className="space-y-4">
                {intakeSteps.map((step) => <GuideStep key={step.number} {...step} />)}
              </div>
              <Callout variant="tip" title="Hosted link first, webhook second">
                Use the hosted link unless your existing website form is already easy to connect. It is faster, cleaner, and easier to test.
              </Callout>
            </TabsContent>

            <TabsContent value="recipient" id="recipient" className="space-y-4 scroll-mt-24">
              <SectionIntro
                icon={<Smartphone className="h-4 w-4" />}
                title="Customer flow"
                body="A simple walkthrough you can send to customers. No app or sign-in needed."
              />
              <div className="space-y-4">
                {recipientSteps.map((step) => <GuideStep key={step.number} {...step} />)}
              </div>
            </TabsContent>

            <TabsContent value="faq" id="faq" className="space-y-6 scroll-mt-24">
              <SectionIntro
                icon={<HelpCircle className="h-4 w-4" />}
                title="FAQ"
                body="Quick answers for setup, intake, and customer capture."
              />

              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground">For businesses</h3>
                <Accordion type="single" collapsible className="rounded-2xl border bg-card">
                  {businessFaqs.map((f) => (
                    <AccordionItem key={f.id} value={f.id} className="px-4">
                      <AccordionTrigger className="text-left text-sm font-medium">{f.q}</AccordionTrigger>
                      <AccordionContent className="text-sm leading-relaxed text-muted-foreground">{f.a}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground">For customers</h3>
                <Accordion type="single" collapsible className="rounded-2xl border bg-card">
                  {recipientFaqs.map((f) => (
                    <AccordionItem key={f.id} value={f.id} className="px-4">
                      <AccordionTrigger className="text-left text-sm font-medium">{f.q}</AccordionTrigger>
                      <AccordionContent className="text-sm leading-relaxed text-muted-foreground">{f.a}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-10 rounded-2xl border bg-card p-5 text-sm sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-foreground">
                <BookOpen className="h-4 w-4 text-primary" />
                <span className="font-medium">Ready to build your first request?</span>
              </div>
              <Button asChild size="sm">
                <Link to="/requests/new">Open New request</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionIntro({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="space-y-1 rounded-2xl border bg-card/80 p-4 shadow-sm">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
        {icon} {title}
      </span>
      <p className="text-sm leading-6 text-muted-foreground">{body}</p>
    </div>
  );
}
