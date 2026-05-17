import { useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import { ArrowRight, Code2, FileJson, Terminal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { PageMeta } from "@/hooks/seo/usePageMeta";
import { Section, Container } from "@/design-system/schema";
import { buildHowToJsonLd } from "@/hooks/seo/buildHowToJsonLd";
import { howItWorksSteps } from "@/components/marketing/HowItWorksSteps";
import { API_BASE_URL, API_EXAMPLES, type ApiExampleLang } from "@/config/apiExamples";

const DISCOVERY_LINKS = [
  { href: "/llms.txt", label: "/llms.txt", desc: "Short markdown brief for LLMs." },
  { href: "/llms-full.txt", label: "/llms-full.txt", desc: "Full reference: features, FAQ, API." },
  { href: "/openapi.json", label: "/openapi.json", desc: "OpenAPI 3.1 spec." },
  { href: "/.well-known/ai-plugin.json", label: "/.well-known/ai-plugin.json", desc: "ChatGPT plugin manifest." },
  { href: "/.well-known/agent.json", label: "/.well-known/agent.json", desc: "Agent capabilities manifest." },
  { href: "/mcp.json", label: "/mcp.json", desc: "MCP server descriptor." },
  { href: "/sitemap.xml", label: "/sitemap.xml", desc: "Sitemap." },
];

const codeChipCls = "rounded-none border border-border bg-background px-1.5 py-0.5 font-mono text-[0.7rem] text-foreground";

export default function ForAiAgentsPage() {
  const [lang, setLang] = useState<ApiExampleLang>("curl");

  const howToJsonLd = useMemo(
    () => buildHowToJsonLd("Turn a small-business inquiry into a PhotoBrief visual intake workflow", howItWorksSteps),
    [],
  );
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
        description="Build with PhotoBrief: smart intake from a business's site, route-aware photo capture, brief retrieval, OpenAPI, MCP, manifests, and code samples."
        canonicalPath="/for-ai-agents"
        ogType="article"
        ogImage="https://photobrief.ai/og/for-ai-agents.png"
        jsonLd={[articleJsonLd, howToJsonLd]}
        breadcrumbs={[{ name: "Home", path: "/" }, { name: "For AI agents", path: "/for-ai-agents" }]}
      />

      {/* Hero */}
      <Section><Container><div className="mx-auto max-w-2xl text-center">
        <p className="ls-eyebrow">For AI agents</p>
        <h1 className="mt-5 text-[clamp(2.5rem,6vw,4.5rem)] font-semibold leading-[1.02] tracking-[-0.025em] text-foreground">
          PhotoBrief is a smart intake layer.
        </h1>
        <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
          Agents read a business's website, generate intake routes, walk customers through the right questions, decide whether photos are needed, and pull back a structured intake brief.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="xl" className="rounded-[0.25rem] uppercase tracking-[0.14em]">
            <a href="#api">See the API <ArrowRight className="ml-1 h-4 w-4" /></a>
          </Button>
          <Button asChild size="xl" variant="outline" className="rounded-[0.25rem] border-border uppercase tracking-[0.14em]">
            <a href="/openapi.json"><FileJson className="mr-1 h-4 w-4" /> openapi.json</a>
          </Button>
        </div>
      </div></Container></Section>

      {/* API section */}
      <Section id="api" tone="alt"><Container>
        <div className="mx-auto max-w-2xl text-center">
          <p className="ls-eyebrow">REST API</p>
          <h2 className="mt-5 text-[clamp(2rem,4vw,3rem)] font-semibold tracking-tight text-foreground">
            Create an intake request
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            <code className={codeChipCls}>POST {API_BASE_URL}/api-create-request</code> — authenticate with a workspace API key.
          </p>
        </div>

        <div className="mt-10 overflow-hidden border border-border bg-card">
          <Tabs value={lang} onValueChange={(v) => setLang(v as ApiExampleLang)}>
            <TabsList className="w-full justify-start rounded-none border-b border-border bg-background/40 p-0">
              <TabsTrigger value="curl" className="gap-1.5 rounded-none border-r border-border px-4 py-3 font-mono text-[0.7rem] uppercase tracking-[0.16em] text-muted-foreground data-[state=active]:bg-card data-[state=active]:text-[hsl(var(--accent-kinetic))]">
                <Terminal className="h-3.5 w-3.5" /> cURL
              </TabsTrigger>
              <TabsTrigger value="javascript" className="gap-1.5 rounded-none border-r border-border px-4 py-3 font-mono text-[0.7rem] uppercase tracking-[0.16em] text-muted-foreground data-[state=active]:bg-card data-[state=active]:text-[hsl(var(--accent-kinetic))]">
                <Code2 className="h-3.5 w-3.5" /> JavaScript
              </TabsTrigger>
              <TabsTrigger value="python" className="gap-1.5 rounded-none border-r border-border px-4 py-3 font-mono text-[0.7rem] uppercase tracking-[0.16em] text-muted-foreground data-[state=active]:bg-card data-[state=active]:text-[hsl(var(--accent-kinetic))]">
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
      </Container></Section>

      {/* MCP */}
      <Section id="mcp"><Container>
        <div className="mx-auto max-w-2xl text-center">
          <p className="ls-eyebrow">MCP</p>
          <h2 className="mt-5 text-[clamp(2rem,4vw,3rem)] font-semibold tracking-tight text-foreground">
            Plug PhotoBrief into your agent
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Live MCP server. Connect it from Claude Code, Cursor, Windsurf, or any MCP-capable tool.
          </p>
        </div>

        <div className="mt-10 overflow-hidden border border-border bg-card">
          <pre className="overflow-x-auto p-5 font-mono text-xs leading-relaxed text-foreground/85"><code>{`# Endpoint
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
      </Container></Section>

      {/* Discovery */}
      <Section id="discovery" tone="alt"><Container>
        <div className="mx-auto max-w-2xl text-center">
          <p className="ls-eyebrow">Discovery</p>
          <h2 className="mt-5 text-[clamp(2rem,4vw,3rem)] font-semibold tracking-tight text-foreground">
            Every machine-readable endpoint
          </h2>
        </div>
        <ul className="mt-10 grid gap-3 sm:grid-cols-2">
          {DISCOVERY_LINKS.map((d) => (
            <li key={d.href}>
              <a href={d.href} className="group flex items-start justify-between gap-3 border border-border bg-card p-4 text-sm transition hover:border-[hsl(var(--accent-kinetic))]">
                <div className="min-w-0">
                  <code className="font-mono text-[0.78rem] font-semibold text-foreground">{d.label}</code>
                  <p className="mt-1 text-muted-foreground">{d.desc}</p>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition group-hover:text-[hsl(var(--accent-kinetic))]" />
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-8 text-center text-sm text-muted-foreground">
          FAQ lives at <NavLink to="/help" className="text-[hsl(var(--accent-kinetic))] hover:underline">/help</NavLink>.
        </p>
      </Container></Section>
    </>
  );
}
