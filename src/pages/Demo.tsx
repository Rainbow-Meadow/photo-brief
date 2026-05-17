import { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import { ArrowRight, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Section, Container, CTA, CTAGroup } from "@/design-system/schema";
import { PageMeta } from "@/hooks/seo/usePageMeta";
import { RiseIn } from "@/components/motion/RiseIn";

type Stage = "url" | "scanning" | "ready" | "failed";

interface RoutePreview {
  label: string;
  photoPolicy: "not_needed" | "optional" | "recommended" | "required";
  photoPolicyReason: string | null;
  description: string | null;
}

interface ScanResult {
  ok: boolean;
  demoSessionId: string;
  intakeToken?: string;
  businessName?: string;
  summary?: string;
  pagesScanned?: number;
  routes?: RoutePreview[];
  message?: string;
}

const POLICY_LABEL: Record<RoutePreview["photoPolicy"], string> = {
  not_needed: "No photos",
  optional: "Photos optional",
  recommended: "Photos recommended",
  required: "Photos required",
};

export default function DemoPage() {
  return (
    <>
      <PageMeta
        title="See PhotoBrief on your own site — 60 seconds"
        description="Paste your URL. We scan your site, build your Smart Intake, and let you try it as a customer. No signup."
        canonicalPath="/demo"
      />

      <Section>
        <Container width="narrow">
          <div className="space-y-3 text-center">
            <p className="ls-eyebrow">Live demo</p>
            <RiseIn>
              <h1 className="ls-h2 mt-6">
                Your site. Your intake.
                <br />Sixty seconds<span className="ls-accent-dot">.</span>
              </h1>
            </RiseIn>
            <RiseIn delay={0.1}>
              <p className="ls-subtitle mx-auto mt-8 max-w-xl">
                Paste your URL. We scan your site, build the smart intake, and you try it as a customer.
              </p>
            </RiseIn>
            <CTAGroup align="center">
              <CTA href="#build-yours" variant="primary" size="lg">
                Build my intake <ArrowRight className="h-4 w-4" />
              </CTA>
            </CTAGroup>
          </div>
        </Container>
      </Section>

      <Section id="build-yours" tone="alt">
        <Container width="narrow">
          <DemoFlow />
        </Container>
      </Section>
    </>
  );
}

function DemoFlow() {
  const [stage, setStage] = useState<Stage>("url");
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submittedAt, setSubmittedAt] = useState<number | null>(null);
  const tick = useTick(stage === "scanning");

  async function startScan() {
    const trimmed = url.trim();
    if (!trimmed) return;
    setError(null);
    setStage("scanning");
    setSubmittedAt(Date.now());
    try {
      const { data, error: invokeErr } = await supabase.functions.invoke("demo-scan", {
        body: { url: trimmed },
      });
      if (invokeErr) throw invokeErr;
      const res = data as ScanResult;
      setResult(res);
      if (res.ok && res.intakeToken) {
        setStage("ready");
      } else {
        setError(res.message ?? "We couldn't read enough from that site.");
        setStage("failed");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setStage("failed");
    }
  }

  const elapsed = submittedAt ? Math.max(0, Math.floor((tick - submittedAt) / 1000)) : 0;

  return (
    <div className="border border-border bg-background/40 p-6 sm:p-8">
      {stage === "url" && (
        <div className="space-y-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent">Step 1 of 2</p>
            <h2 className="mt-2 text-xl font-semibold text-foreground sm:text-2xl">What's your business URL?</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              We scan up to 10 pages on your site. Takes about 30 seconds.
            </p>
          </div>
          <input
            autoFocus
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") startScan(); }}
            placeholder="acmeplumbing.com"
            className="w-full border border-border bg-background px-4 py-3 text-base text-foreground outline-none focus:border-accent"
          />
          <PrimaryButton disabled={!url.trim()} onClick={startScan}>Scan my site →</PrimaryButton>
        </div>
      )}

      {stage === "scanning" && (
        <div className="flex flex-col items-center gap-4 py-12 text-center">
          <Loader2 className="h-6 w-6 animate-spin text-accent" />
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            Scanning {hostOf(url)} · {elapsed}s
          </p>
          <p className="max-w-xs text-sm text-muted-foreground">
            Reading your pages. Spotting services. Building routes.
          </p>
        </div>
      )}

      {stage === "failed" && (
        <div className="space-y-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent">Couldn't read that site</p>
          <p className="text-sm text-muted-foreground">{error ?? "Try a different URL."}</p>
          <div className="flex flex-wrap gap-3">
            <PrimaryButton onClick={() => { setStage("url"); setError(null); }}>Try another URL →</PrimaryButton>
            <NavLink
              to="/auth?mode=signup"
              className="inline-flex min-h-11 items-center justify-center px-6 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-foreground underline-offset-4 hover:underline"
            >
              Start trial instead →
            </NavLink>
          </div>
        </div>
      )}

      {stage === "ready" && result?.intakeToken && (
        <ReadyView result={result} />
      )}
    </div>
  );
}

function ReadyView({ result }: { result: ScanResult }) {
  const intakeUrl = `/i/${result.intakeToken}`;
  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent">Step 2 of 2 · Ready</p>
        <h2 className="mt-2 text-xl font-semibold text-foreground sm:text-2xl">
          Here's what we built for {result.businessName}.
        </h2>
        {result.summary ? (
          <p className="mt-2 text-sm text-muted-foreground">{result.summary}</p>
        ) : null}
      </div>

      <ul className="space-y-2">
        {result.routes?.map((r, i) => (
          <li key={i} className="border border-border bg-background/60 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-foreground">{r.label}</p>
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
                {POLICY_LABEL[r.photoPolicy]}
              </span>
            </div>
            {r.photoPolicyReason ? (
              <p className="mt-1.5 text-xs text-muted-foreground">{r.photoPolicyReason}</p>
            ) : null}
          </li>
        ))}
      </ul>

      <div className="space-y-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          Try it as a customer
        </p>
        <div className="overflow-hidden border border-border bg-background">
          <iframe
            src={intakeUrl}
            title="Your Smart Intake demo"
            className="block h-[640px] w-full"
          />
        </div>
        <a
          href={intakeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground underline-offset-4 hover:underline"
        >
          Open in a new tab →
        </a>
      </div>

      <div className="border-t border-border pt-6">
        <p className="text-sm text-foreground">
          This setup is yours. Claim it and we'll drop it into your new workspace.
        </p>
        <div className="mt-3 flex flex-wrap gap-3">
          <NavLink
            to={`/auth?mode=signup&demo=${encodeURIComponent(result.demoSessionId)}`}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-sm border border-accent bg-accent px-6 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-accent-foreground transition hover:opacity-90"
          >
            Start 14-day trial → keep this setup
          </NavLink>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Demo setup auto-deletes after 24 hours if you don't claim it.
        </p>
      </div>
    </div>
  );
}

function PrimaryButton({
  disabled, onClick, children,
}: { disabled?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button" disabled={disabled} onClick={onClick}
      className="mt-2 inline-flex min-h-11 items-center justify-center gap-2 rounded-sm border border-accent bg-accent px-6 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-accent-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}

function useTick(active: boolean) {
  const [now, setNow] = useState(() => Date.now());
  const ref = useRef<number | null>(null);
  useEffect(() => {
    if (!active) return;
    ref.current = window.setInterval(() => setNow(Date.now()), 500);
    return () => { if (ref.current) window.clearInterval(ref.current); };
  }, [active]);
  return now;
}

function hostOf(value: string) {
  try {
    return new URL(value.startsWith("http") ? value : `https://${value}`).hostname.replace(/^www\./, "");
  } catch {
    return value;
  }
}
