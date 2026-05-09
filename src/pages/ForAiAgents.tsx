import { useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import { ArrowRight, Check, Code2, CreditCard, FileJson, Globe2, Route, Sparkles, Terminal, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

import { PageMeta } from "@/hooks/seo/usePageMeta";
import { MarketingHero, MarketingSection } from "@/components/layout/primitives";
import { buildFaqJsonLd } from "@/hooks/seo/buildFaqJsonLd";
import { buildHowToJsonLd } from "@/hooks/seo/buildHowToJsonLd";
import { howItWorksSteps } from "@/components/marketing/HowItWorksSteps";
import { QuotableFacts } from "@/components/marketing/QuotableFacts";
import { ComparisonTable } from "@/components/marketing/ComparisonTable";
import { faqItems } from "@/features/help/content/faq";
import { API_BASE_URL, API_EXAMPLES, type ApiExampleLang } from "@/config/apiExamples";

const DISCOVERY_LINKS = [
  { href: "/llms.txt", label: "/llms.txt", desc: "Short markdown brief for LLMs." },
  { href: "/llms-full.txt", label: "/llms-full.txt", desc: "Full reference: features, FAQ, API." },
  { href: "/openapi.json", label: "/openapi.json", desc: "OpenAPI 3.1 spec." },
  { href: "/.well-known/ai-plugin.json", label: "/.well-known/ai-plugin.json", desc: "ChatGPT plugin manifest." },
  { href: "/.well-known/agent.json", label: "/.well-known/agent.json", desc: "Agent capabilities manifest." },
  { href: "/mcp.json", label: "/mcp.json", desc: "MCP server descriptor (includes x402 config)." },
  { href: "https://mcp.photobrief.ai/x402/requirements", label: "/x402/requirements", desc: "x402 payment requirements endpoint." },
  { href: "/sitemap.xml", label: "/sitemap.xml", desc: "Sitemap." },
];

export default function ForAiAgentsPage() {
  const [lang, setLang] = useState<ApiExampleLang>("curl");

  const faqJsonLd = useMemo(() => buildFaqJsonLd(faqItems), []);
  const howToJsonLd = useMemo(() => buildHowToJsonLd("Turn a small-business inquiry into a PhotoBrief visual intake workflow", howItWorksSteps), []);
  const articleJsonLd = useMemo<Record<string, unknown>>(
    () => ({
      "@context": "https://schema.org",
      "@type": "TechArticle",
      headline: "PhotoBrief for AI agents",
      description:
        "How AI agents and business systems use PhotoBrief to convert website inquiries into routed, AI-checked customer photo workflows.",
      author: { "@type": "Organization", name: "PhotoBrief" },
      mainEntityOfPage: "https://photobrief.ai/for-ai-agents",
    }),
    [],
  );

  return (
    <>
      <PageMeta
        title="PhotoBrief for AI agents | Visual intake API and manifests"
        description="Build with PhotoBrief: Website Intake automation, request creation API, OpenAPI, MCP descriptor, manifests, and code samples for AI agents."
        canonicalPath="/for-ai-agents"
        ogType="article"
        jsonLd={[articleJsonLd, howToJsonLd, faqJsonLd]}
        breadcrumbs={[{ name: "Home", path: "/" }, { name: "For AI agents", path: "/for-ai-agents" }]}
      />

      {/* Hero */}
      <MarketingHero align="center">
        <div className="pb-lens-field" />
        <span className="pb-eyebrow">
          <Sparkles className="h-3.5 w-3.5" /> For AI agents, answer engines, and automation systems
        </span>
        <h1 className="pb-section-title mx-auto mt-5 max-w-3xl text-white">PhotoBrief is a visual intake layer.</h1>
        <p className="pb-copy mx-auto mt-5 max-w-2xl text-base sm:text-lg">
          Agents can create photo requests, connect website intake, route leads to templates, and return a structured visual brief that a business can quote, dispatch, approve, or document.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg" variant="pb-primary">
            <a href="#api">See the API <ArrowRight className="ml-1 h-4 w-4" /></a>
          </Button>
          <Button asChild size="lg" variant="pb-secondary">
            <a href="/openapi.json"><FileJson className="mr-1 h-4 w-4" /> openapi.json</a>
          </Button>
        </div>
        <div className="mt-8 grid gap-3 text-left sm:grid-cols-2">
          <div className="pb-card rounded-2xl p-4">
            <Globe2 className="h-5 w-5 text-[hsl(var(--pb-lavender))]" />
            <p className="mt-3 text-sm font-semibold text-white">Website Intake</p>
            <p className="mt-1 text-xs leading-5 text-[hsl(var(--pb-muted))]">Hosted form or webhook turns website leads into PhotoBrief requests.</p>
          </div>
          <div className="pb-card rounded-2xl p-4">
            <Route className="h-5 w-5 text-[hsl(var(--pb-lavender))]" />
            <p className="mt-3 text-sm font-semibold text-white">Template routing</p>
            <p className="mt-1 text-xs leading-5 text-[hsl(var(--pb-muted))]">Rules and conservative AI fallback select from configured templates only.</p>
          </div>
        </div>
      </MarketingHero>

      <QuotableFacts />
      <ComparisonTable />

      {/* API section */}
      <MarketingSection id="api" aria-labelledby="api-heading">
          <div className="mx-auto max-w-2xl text-center">
            <span className="pb-eyebrow">REST API</span>
            <h2 id="api-heading" className="pb-section-title mt-4 text-white">
              Create a photo request
            </h2>
            <p className="pb-copy mt-4 text-base">
              <code className="rounded border border-white/10 bg-white/[0.05] px-1.5 py-0.5 text-xs text-[hsl(var(--pb-lavender))]">POST {API_BASE_URL}/api-create-request</code>{" "}
              — authenticate with a workspace API key on supported plans.
            </p>
          </div>

          <div className="mt-10 overflow-hidden rounded-2xl border border-[hsl(var(--pb-line))] bg-[hsl(var(--pb-ink))]">
            <Tabs value={lang} onValueChange={(v) => setLang(v as ApiExampleLang)}>
              <TabsList className="w-full justify-start rounded-none border-b border-white/10 bg-white/[0.03] px-2">
                <TabsTrigger value="curl" className="gap-1.5 text-white/70 data-[state=active]:text-white"><Terminal className="h-3.5 w-3.5" /> cURL</TabsTrigger>
                <TabsTrigger value="javascript" className="gap-1.5 text-white/70 data-[state=active]:text-white"><Code2 className="h-3.5 w-3.5" /> JavaScript</TabsTrigger>
                <TabsTrigger value="python" className="gap-1.5 text-white/70 data-[state=active]:text-white"><Code2 className="h-3.5 w-3.5" /> Python</TabsTrigger>
              </TabsList>
              {(Object.keys(API_EXAMPLES) as ApiExampleLang[]).map((l) => (
                <TabsContent key={l} value={l} className="m-0">
                  <pre className="overflow-x-auto p-5 text-xs leading-relaxed text-white/80"><code>{API_EXAMPLES[l]}</code></pre>
                </TabsContent>
              ))}
            </Tabs>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <article className="pb-card rounded-2xl p-5 text-sm">
              <h3 className="font-semibold text-white">Successful response</h3>
              <pre className="mt-3 overflow-x-auto rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs text-white/70">
{`{
  "request_id": "uuid",
  "token": "abc123",
  "recipient_url": "https://photobrief.ai/r/abc123"
}`}
              </pre>
              <p className="mt-3 text-[hsl(var(--pb-muted))]">Forward <code className="text-[hsl(var(--pb-lavender))]">recipient_url</code> to the customer, or use Website Intake to send automatically.</p>
            </article>
            <article className="pb-card rounded-2xl p-5 text-sm">
              <h3 className="font-semibold text-white">Required fields</h3>
              <ul className="mt-3 space-y-1.5 text-[hsl(var(--pb-muted))]">
                <li className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--pb-mint))]" /><span><code className="text-[hsl(var(--pb-lavender))]">recipient_name</code> — display name</span></li>
                <li className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--pb-mint))]" /><span><code className="text-[hsl(var(--pb-lavender))]">recipient_email</code> <em>or</em> <code className="text-[hsl(var(--pb-lavender))]">recipient_phone</code></span></li>
                <li className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--pb-mint))]" /><span>Bearer token in <code className="text-[hsl(var(--pb-lavender))]">Authorization</code></span></li>
              </ul>
            </article>
          </div>
      </MarketingSection>

      {/* MCP & Agent manifests */}
      <MarketingSection id="mcp" aria-labelledby="mcp-heading">
        <div className="mx-auto max-w-2xl text-center">
          <span className="pb-eyebrow">MCP & Agent manifests</span>
          <h2 id="mcp-heading" className="pb-section-title mt-4 text-white">Plug PhotoBrief into your agent</h2>
          <p className="pb-copy mt-4 text-base">PhotoBrief runs a live MCP server. Connect it from Claude Code, Cursor, Windsurf, or any MCP-capable tool.</p>
        </div>

        <div className="mt-10 overflow-hidden rounded-2xl border border-[hsl(var(--pb-line))] bg-[hsl(var(--pb-ink))]">
          <div className="border-b border-white/10 bg-white/[0.03] px-5 py-3">
            <p className="text-xs font-medium text-white/70">MCP endpoint — Streamable HTTP</p>
          </div>
          <pre className="overflow-x-auto p-5 text-xs leading-relaxed text-white/80"><code>{`# Endpoint
https://mcp.photobrief.ai/mcp

# Tools available
create_request   — Create a photo request (requires pb_ API key)
lookup_pricing   — Plans, prices, and credit model (no auth)
read_faq         — Canonical FAQ answers (no auth)

# Claude Code / Cursor / Windsurf config example
{
  "mcpServers": {
    "photobrief": {
      "url": "https://mcp.photobrief.ai/mcp"
    }
  }
}`}</code></pre>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <article className="pb-card rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-white">agent.json</h3>
            <p className="mt-2 text-sm text-[hsl(var(--pb-muted))]">Capabilities, auth, and discovery URLs in one file.</p>
            <pre className="mt-3 overflow-x-auto rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs text-white/70">{`GET https://photobrief.ai/.well-known/agent.json`}</pre>
          </article>
          <article className="pb-card rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-white">mcp.json</h3>
            <p className="mt-2 text-sm text-[hsl(var(--pb-muted))]">Live MCP server descriptor with tools, transport, and auth details.</p>
            <pre className="mt-3 overflow-x-auto rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs text-white/70">{`GET https://photobrief.ai/mcp.json`}</pre>
          </article>
        </div>
      </MarketingSection>

      {/* x402 Agentic Payments */}
      <MarketingSection id="x402" aria-labelledby="x402-heading">
        <div className="mx-auto max-w-2xl text-center">
          <span className="pb-eyebrow"><CreditCard className="h-3.5 w-3.5" /> Agentic payments</span>
          <h2 id="x402-heading" className="pb-section-title mt-4 text-white">Pay per call with x402</h2>
          <p className="pb-copy mt-4 text-base">
            AI agents without a <code className="rounded border border-white/10 bg-white/[0.05] px-1.5 py-0.5 text-xs text-[hsl(var(--pb-lavender))]">pb_</code> API key can pay per-call using the x402 protocol. No billing setup, no subscription — just machine-to-machine payments.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <article className="pb-card rounded-2xl p-5">
            <Zap className="h-5 w-5 text-[hsl(var(--pb-lavender))]" />
            <h3 className="mt-3 text-sm font-semibold text-white">Per-call pricing</h3>
            <p className="mt-2 text-sm text-[hsl(var(--pb-muted))]"><code className="text-[hsl(var(--pb-lavender))]">create_request</code> = $0.10 USD (1 credit)</p>
            <p className="mt-1 text-sm text-[hsl(var(--pb-muted))]"><code className="text-[hsl(var(--pb-lavender))]">lookup_pricing</code> and <code className="text-[hsl(var(--pb-lavender))]">read_faq</code> = free</p>
          </article>
          <article className="pb-card rounded-2xl p-5">
            <Globe2 className="h-5 w-5 text-[hsl(var(--pb-lavender))]" />
            <h3 className="mt-3 text-sm font-semibold text-white">Network</h3>
            <p className="mt-2 text-sm text-[hsl(var(--pb-muted))]">Base Sepolia (testnet). Mainnet support coming soon.</p>
          </article>
          <article className="pb-card rounded-2xl p-5">
            <Route className="h-5 w-5 text-[hsl(var(--pb-lavender))]" />
            <h3 className="mt-3 text-sm font-semibold text-white">How it works</h3>
            <p className="mt-2 text-sm text-[hsl(var(--pb-muted))]">Call without auth → get 402 + requirements → send <code className="text-[hsl(var(--pb-lavender))]">X-Payment</code> header → done.</p>
          </article>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-[hsl(var(--pb-line))] bg-[hsl(var(--pb-ink))]">
          <div className="border-b border-white/10 bg-white/[0.03] px-5 py-3">
            <p className="text-xs font-medium text-white/70">x402 payment flow</p>
          </div>
          <pre className="overflow-x-auto p-5 text-xs leading-relaxed text-white/80"><code>{`# 1. Get payment requirements
GET https://mcp.photobrief.ai/x402/requirements?tool=create_request

# 2. Pay and execute in one call
curl -X POST https://mcp.photobrief.ai/x402/pay \\
  -H "Content-Type: application/json" \\
  -H "X-Payment: eyJ0cmFuc2FjdGlvbiI6IjB4Li4uIiwicGF5ZXIiOiIweC4uLiJ9" \\
  -d '{"recipient_name":"Jane","recipient_email":"jane@example.com"}'

# Or via MCP: pass x_payment parameter instead of api_key
{
  "mcpServers": {
    "photobrief": {
      "url": "https://mcp.photobrief.ai/mcp"
    }
  }
}`}</code></pre>
        </div>
      </MarketingSection>
      <section id="discovery" aria-labelledby="discovery-heading">
        <div className="pb-container pb-section">
          <div className="mx-auto max-w-2xl text-center">
            <span className="pb-eyebrow">Discovery</span>
            <h2 id="discovery-heading" className="pb-section-title mt-4 text-white">Every machine-readable endpoint</h2>
          </div>
          <ul className="mt-10 grid gap-3 sm:grid-cols-2">
            {DISCOVERY_LINKS.map((d) => (
              <li key={d.href}>
                <a href={d.href} className="block rounded-2xl border border-[hsl(var(--pb-line))] bg-[hsl(var(--pb-panel)/0.88)] p-4 text-sm transition hover:border-[hsl(var(--pb-lavender)/0.55)] hover:bg-[hsl(var(--pb-panel-2)/0.92)]">
                  <code className="font-semibold text-[hsl(var(--pb-lavender))]">{d.label}</code>
                  <p className="mt-1 text-[hsl(var(--pb-muted))]">{d.desc}</p>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" aria-labelledby="faq-heading">
        <div className="pb-container-narrow pb-section">
          <div className="text-center">
            <span className="pb-eyebrow">FAQ</span>
            <h2 id="faq-heading" className="pb-section-title mt-4 text-white">Quotable answers</h2>
            <p className="pb-copy mt-4 text-sm">Same source as <NavLink to="/help" className="text-[hsl(var(--pb-lavender))] hover:underline">/help</NavLink>.</p>
          </div>
          <Accordion type="single" collapsible className="mt-8 pb-command-panel rounded-2xl">
            {faqItems.map((f) => (
              <AccordionItem key={f.id} value={f.id} className="border-white/10 px-4">
                <AccordionTrigger className="text-left text-sm font-medium text-white/90">{f.q}</AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-[hsl(var(--pb-muted))]">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </>
  );
}
