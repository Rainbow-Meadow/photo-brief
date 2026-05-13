import { useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import { ArrowRight, Check, Code2, CreditCard, FileJson, Globe2, Route, Sparkles, Terminal, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

import { PageMeta } from "@/hooks/seo/usePageMeta";
import { Section, Container } from "@/design-system/schema";
import { buildFaqJsonLd } from "@/hooks/seo/buildFaqJsonLd";
import { buildHowToJsonLd } from "@/hooks/seo/buildHowToJsonLd";
import { howItWorksSteps } from "@/components/marketing/HowItWorksSteps";
import { QuotableFacts } from "@/components/marketing/QuotableFacts";
import { ComparisonTable } from "@/components/marketing/ComparisonTable";
import { PublicPhotoPair } from "@/components/marketing/PublicPhotoPair";
import { faqItems } from "@/features/help/content/faq";
import { API_BASE_URL, API_EXAMPLES, type ApiExampleLang } from "@/config/apiExamples";

import agentsTerminalCurl from "@/assets/agents/agents-terminal-curl.png";
import agentsMcpChat from "@/assets/agents/agents-mcp-chat.png";

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

const eyebrowCls =
  "inline-flex items-baseline gap-2 font-mono text-[0.7rem] font-medium uppercase tracking-[0.18em] text-muted-foreground";
const accentCodeCls = "text-[hsl(var(--accent-kinetic))]";
const codeChipCls =
  "rounded-none border border-border bg-background px-1.5 py-0.5 font-mono text-[0.7rem] text-foreground";
const inlineCodeCls = "font-mono text-[hsl(var(--accent-kinetic))]";

function Eyebrow({ code, children }: { code: string; children: React.ReactNode }) {
  return (
    <p className={eyebrowCls}>
      <span className="inline-block h-px w-8 -translate-y-[0.25em] bg-[hsl(var(--accent-kinetic))]" />
      <span className={accentCodeCls}>[ {code} ]</span>
      <span className="inline-flex items-center gap-1.5">{children}</span>
    </p>
  );
}

function CodeBlock({ label, code }: { label: string; code: string }) {
  return (
    <div className="overflow-hidden border border-border bg-card">
      <div className="border-b border-border bg-background/40 px-5 py-3">
        <p className="font-mono text-[0.7rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          <span className={`${accentCodeCls} mr-2`}>[ // ]</span>
          {label}
        </p>
      </div>
      <pre className="overflow-x-auto p-5 font-mono text-xs leading-relaxed text-foreground/85">
        <code>{code}</code>
      </pre>
    </div>
  );
}

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
        title="PhotoBrief for AI agents | Smart intake API and manifests"
        description="Build with PhotoBrief: smart intake from a business's website, route-aware customer flows, conditional photo capture, intake brief retrieval, OpenAPI, MCP descriptor, manifests, and code samples."
        canonicalPath="/for-ai-agents"
        ogType="article"
        ogImage="/og/for-ai-agents.png"
        jsonLd={[articleJsonLd, howToJsonLd, faqJsonLd]}
        breadcrumbs={[{ name: "Home", path: "/" }, { name: "For AI agents", path: "/for-ai-agents" }]}
      />

      {/* Hero */}
      <Section><Container><div className="text-center">
        <Eyebrow code="00">
          <Sparkles className="h-3.5 w-3.5" /> For AI agents, answer engines, and automation systems
        </Eyebrow>
        <h1 className="mx-auto mt-5 max-w-3xl text-[clamp(2.5rem,6vw,4.5rem)] font-semibold leading-[1.02] tracking-[-0.025em] text-foreground">
          PhotoBrief is a smart intake layer.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Agents read a business's website, generate intake routes, walk customers through the right questions, decide whether photos are needed, and pull back a structured intake brief the business can quote, dispatch, approve, or document.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="xl" className="rounded-[0.25rem] uppercase tracking-[0.14em]">
            <a href="#api">See the API <ArrowRight className="ml-1 h-4 w-4" /></a>
          </Button>
          <Button asChild size="xl" variant="outline" className="rounded-[0.25rem] border-border uppercase tracking-[0.14em]">
            <a href="/openapi.json"><FileJson className="mr-1 h-4 w-4" /> openapi.json</a>
          </Button>
        </div>
        <div className="mt-10 grid gap-3 text-left sm:grid-cols-2">
          <div className="border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[0.65rem] font-medium uppercase tracking-[0.18em] text-[hsl(var(--accent-kinetic))]">[ 01 ]</span>
              <span className="flex h-9 w-9 items-center justify-center border border-border bg-background text-[hsl(var(--accent-kinetic))]">
                <Globe2 className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-5 text-sm font-semibold text-foreground">Smart intake from a website</p>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">Hosted form, embed, or webhook turns every website CTA into a route-aware intake.</p>
          </div>
          <div className="border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[0.65rem] font-medium uppercase tracking-[0.18em] text-[hsl(var(--accent-kinetic))]">[ 02 ]</span>
              <span className="flex h-9 w-9 items-center justify-center border border-border bg-background text-[hsl(var(--accent-kinetic))]">
                <Route className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-5 text-sm font-semibold text-foreground">Route-aware questions & photos</p>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">Each route picks its own questions and decides whether photos are not needed, optional, recommended, or required.</p>
          </div>
        </div>
      </div></Container></Section>

      <QuotableFacts />
      <ComparisonTable />

      {/* API section */}
      <Section id="api"><Container>
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow code="03"><Terminal className="h-3.5 w-3.5" /> REST API</Eyebrow>
          <h2 id="api-heading" className="mt-5 text-[clamp(2rem,4vw,3rem)] font-semibold tracking-tight text-foreground">
            Create an intake request
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            <code className={codeChipCls}>POST {API_BASE_URL}/api-create-request</code>{" "}
            — authenticate with a workspace API key on supported plans.
          </p>
        </div>

        <div className="mt-10 overflow-hidden border border-border bg-card">
          <Tabs value={lang} onValueChange={(v) => setLang(v as ApiExampleLang)}>
            <TabsList className="w-full justify-start rounded-none border-b border-border bg-background/40 p-0">
              <TabsTrigger
                value="curl"
                className="gap-1.5 rounded-none border-r border-border px-4 py-3 font-mono text-[0.7rem] uppercase tracking-[0.16em] text-muted-foreground data-[state=active]:bg-card data-[state=active]:text-[hsl(var(--accent-kinetic))]"
              >
                <Terminal className="h-3.5 w-3.5" /> cURL
              </TabsTrigger>
              <TabsTrigger
                value="javascript"
                className="gap-1.5 rounded-none border-r border-border px-4 py-3 font-mono text-[0.7rem] uppercase tracking-[0.16em] text-muted-foreground data-[state=active]:bg-card data-[state=active]:text-[hsl(var(--accent-kinetic))]"
              >
                <Code2 className="h-3.5 w-3.5" /> JavaScript
              </TabsTrigger>
              <TabsTrigger
                value="python"
                className="gap-1.5 rounded-none border-r border-border px-4 py-3 font-mono text-[0.7rem] uppercase tracking-[0.16em] text-muted-foreground data-[state=active]:bg-card data-[state=active]:text-[hsl(var(--accent-kinetic))]"
              >
                <Code2 className="h-3.5 w-3.5" /> Python
              </TabsTrigger>
            </TabsList>
            {(Object.keys(API_EXAMPLES) as ApiExampleLang[]).map((l) => (
              <TabsContent key={l} value={l} className="m-0">
                <pre className="overflow-x-auto p-5 font-mono text-xs leading-relaxed text-foreground/85"><code>{API_EXAMPLES[l]}</code></pre>
              </TabsContent>
            ))}
          </Tabs>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <article className="border border-border bg-card p-5">
            <p className="font-mono text-[0.65rem] font-medium uppercase tracking-[0.18em] text-[hsl(var(--accent-kinetic))]">[ 200 ]</p>
            <h3 className="mt-2 text-sm font-semibold text-foreground">Successful response</h3>
            <pre className="mt-3 overflow-x-auto border border-border bg-background p-3 font-mono text-xs text-foreground/80">
{`{
  "request_id": "uuid",
  "token": "abc123",
  "recipient_url": "https://photobrief.ai/r/abc123"
}`}
            </pre>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Forward <code className={inlineCodeCls}>recipient_url</code> to the customer, or use Website Intake to send automatically.
            </p>
          </article>
          <article className="border border-border bg-card p-5">
            <p className="font-mono text-[0.65rem] font-medium uppercase tracking-[0.18em] text-[hsl(var(--accent-kinetic))]">[ REQ ]</p>
            <h3 className="mt-2 text-sm font-semibold text-foreground">Required fields</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--accent-kinetic))]" /><span><code className={inlineCodeCls}>recipient_name</code> — display name</span></li>
              <li className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--accent-kinetic))]" /><span><code className={inlineCodeCls}>recipient_email</code> <em>or</em> <code className={inlineCodeCls}>recipient_phone</code></span></li>
              <li className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--accent-kinetic))]" /><span>Bearer token in <code className={inlineCodeCls}>Authorization</code></span></li>
            </ul>
          </article>
        </div>

        <PublicPhotoPair
          className="mt-8"
          items={[
            {
              src: agentsTerminalCurl,
              alt: "Developer terminal showing a curl request to the PhotoBrief API and a JSON brief response.",
              caption: "A direct API call returns a brief payload your automation can route immediately.",
            },
            {
              src: agentsMcpChat,
              alt: "AI agent chat interface using the PhotoBrief MCP tool to fetch a brief and draft a quote.",
              caption: "The same lead can also be pulled by an agent through MCP and turned into a quote draft in one move.",
            },
          ]}
        />
      </Container></Section>

      {/* MCP & Agent manifests */}
      <Section id="mcp"><Container>
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow code="04"><Code2 className="h-3.5 w-3.5" /> MCP & Agent manifests</Eyebrow>
          <h2 id="mcp-heading" className="mt-5 text-[clamp(2rem,4vw,3rem)] font-semibold tracking-tight text-foreground">
            Plug PhotoBrief into your agent
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            PhotoBrief runs a live MCP server. Connect it from Claude Code, Cursor, Windsurf, or any MCP-capable tool.
          </p>
        </div>

        <div className="mt-10">
          <CodeBlock
            label="MCP endpoint — Streamable HTTP"
            code={`# Endpoint
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
}`}
          />
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <article className="border border-border bg-card p-5">
            <p className="font-mono text-[0.65rem] font-medium uppercase tracking-[0.18em] text-[hsl(var(--accent-kinetic))]">[ MAN ]</p>
            <h3 className="mt-2 text-sm font-semibold text-foreground">agent.json</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Capabilities, auth, and discovery URLs in one file.</p>
            <pre className="mt-3 overflow-x-auto border border-border bg-background p-3 font-mono text-xs text-foreground/80">{`GET https://photobrief.ai/.well-known/agent.json`}</pre>
          </article>
          <article className="border border-border bg-card p-5">
            <p className="font-mono text-[0.65rem] font-medium uppercase tracking-[0.18em] text-[hsl(var(--accent-kinetic))]">[ MCP ]</p>
            <h3 className="mt-2 text-sm font-semibold text-foreground">mcp.json</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Live MCP server descriptor with tools, transport, and auth details.</p>
            <pre className="mt-3 overflow-x-auto border border-border bg-background p-3 font-mono text-xs text-foreground/80">{`GET https://photobrief.ai/mcp.json`}</pre>
          </article>
        </div>
      </Container></Section>

      {/* x402 Agentic Payments */}
      <Section id="x402"><Container>
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow code="05"><CreditCard className="h-3.5 w-3.5" /> Agentic payments</Eyebrow>
          <h2 id="x402-heading" className="mt-5 text-[clamp(2rem,4vw,3rem)] font-semibold tracking-tight text-foreground">
            Pay per call with x402
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            AI agents without a <code className={codeChipCls}>pb_</code> API key can pay per-call using the x402 protocol. No billing setup, no subscription — just machine-to-machine payments.
          </p>
        </div>

        <div className="mt-10 grid gap-3 sm:grid-cols-3">
          {[
            { code: "01", icon: Zap, title: "Per-call pricing", body: <><code className={inlineCodeCls}>create_request</code> = $0.10 USD (1 credit). <code className={inlineCodeCls}>lookup_pricing</code> and <code className={inlineCodeCls}>read_faq</code> = free.</> },
            { code: "02", icon: Globe2, title: "Network", body: "Base Sepolia (testnet). Mainnet support coming soon." },
            { code: "03", icon: Route, title: "How it works", body: <>Call without auth → get 402 + requirements → send <code className={inlineCodeCls}>X-Payment</code> header → done.</> },
          ].map(({ code, icon: Icon, title, body }) => (
            <article key={code} className="border border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[0.65rem] font-medium uppercase tracking-[0.18em] text-[hsl(var(--accent-kinetic))]">[ {code} ]</span>
                <span className="flex h-9 w-9 items-center justify-center border border-border bg-background text-[hsl(var(--accent-kinetic))]">
                  <Icon className="h-4 w-4" />
                </span>
              </div>
              <h3 className="mt-5 text-sm font-semibold text-foreground">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p>
            </article>
          ))}
        </div>

        <div className="mt-6">
          <CodeBlock
            label="x402 payment flow"
            code={`# 1. Get payment requirements
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
}`}
          />
        </div>
      </Container></Section>

      <Section id="discovery"><Container>
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow code="06">Discovery</Eyebrow>
          <h2 id="discovery-heading" className="mt-5 text-[clamp(2rem,4vw,3rem)] font-semibold tracking-tight text-foreground">
            Every machine-readable endpoint
          </h2>
        </div>
        <ul className="mt-10 grid gap-3 sm:grid-cols-2">
          {DISCOVERY_LINKS.map((d) => (
            <li key={d.href}>
              <a
                href={d.href}
                className="group flex items-start justify-between gap-3 border border-border bg-card p-4 text-sm transition hover:border-[hsl(var(--accent-kinetic))]"
              >
                <div className="min-w-0">
                  <code className="font-mono text-[0.78rem] font-semibold text-foreground">{d.label}</code>
                  <p className="mt-1 text-muted-foreground">{d.desc}</p>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition group-hover:text-[hsl(var(--accent-kinetic))]" />
              </a>
            </li>
          ))}
        </ul>
      </Container></Section>

      {/* FAQ */}
      <Section id="faq"><Container width="narrow">
        <div className="text-center">
          <Eyebrow code="99">FAQ</Eyebrow>
          <h2 id="faq-heading" className="mt-5 text-[clamp(2rem,4vw,3rem)] font-semibold tracking-tight text-foreground">
            Quotable answers
          </h2>
          <p className="mt-4 text-sm text-muted-foreground">
            Same source as <NavLink to="/help" className="text-[hsl(var(--accent-kinetic))] hover:underline">/help</NavLink>.
          </p>
        </div>
        <Accordion type="single" collapsible className="mt-8 border border-border bg-card px-4 sm:px-6">
          {faqItems.map((f) => (
            <AccordionItem key={f.id} value={f.id} className="border-border">
              <AccordionTrigger className="text-left text-foreground">{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Container></Section>
    </>
  );
}
