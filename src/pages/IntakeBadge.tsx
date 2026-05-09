import { useSearchParams } from "react-router-dom";
import { ArrowRight, CheckCircle2 } from "lucide-react";

import { BrandMark } from "@/components/layout/BrandMark";
import { PageMeta } from "@/hooks/seo/usePageMeta";

function readParam(params: URLSearchParams, key: string, fallback: string) {
  const raw = params.get(key)?.trim();
  return raw || fallback;
}

function cleanToken(token: string | null) {
  return token?.replace(/[^a-zA-Z0-9_-]/g, "") ?? "";
}

export default function IntakeBadgePage() {
  const [params] = useSearchParams();
  const token = cleanToken(params.get("token"));
  const theme = readParam(params, "theme", "auto");
  const compact = params.get("layout") === "compact";
  const cta = readParam(params, "cta", "Start photo request");
  const title = readParam(params, "title", "Send photos the easy way");
  const message = readParam(
    params,
    "message",
    "This guided PhotoBrief request helps us review your request faster, ask fewer follow-up questions, and give you a better answer.",
  );
  const destination = token ? `/i/${token}` : "/";
  const forceDark = theme === "dark";
  const forceLight = theme === "light";

  const surfaceCls = forceDark
    ? "border-white/15 bg-[#101014] text-white"
    : forceLight
      ? "border-slate-200 bg-white text-slate-950"
      : "border-border bg-card text-foreground";
  const mutedCls = forceDark ? "text-white/65" : "text-muted-foreground";

  return (
    <>
      <PageMeta
        title="PhotoBrief.ai photo request badge"
        description="PhotoBrief.ai badge for hosted website intake links."
        canonicalPath="/badge/intake"
        noindex
      />
      <div className={`min-h-screen bg-transparent p-0 ${forceDark ? "dark" : ""}`}>
        <section
          className={`m-0 grid w-full max-w-[760px] gap-4 border p-5 ${surfaceCls} sm:grid-cols-[1fr_auto] sm:items-center`}
        >
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              {/* `forceDark` means the host page bg is dark — render the light/cream lockup so the wordmark is legible. */}
              <BrandMark variant="horizontal" tone={forceDark ? "dark" : "light"} size={28} eager />
              <span className="inline-flex items-baseline gap-2 font-mono text-[0.65rem] font-medium uppercase tracking-[0.18em]">
                <span className="inline-block h-px w-6 -translate-y-[0.25em] bg-[hsl(var(--accent-kinetic))]" />
                <span className="text-[hsl(var(--accent-kinetic))]">[ PB ]</span>
                <span className={mutedCls}>Guided photo request</span>
              </span>
            </div>
            <h1
              className={`mt-3 font-[Geist,Inter,system-ui,sans-serif] font-semibold leading-[1.1] tracking-[-0.022em] ${
                compact ? "text-base" : "text-xl"
              }`}
            >
              {title}
            </h1>
            <p className={`mt-1.5 leading-6 ${compact ? "text-xs" : "text-sm"} ${mutedCls}`}>
              {message}
            </p>
            <p className={`mt-3 inline-flex items-center gap-1.5 font-mono text-[0.65rem] uppercase tracking-[0.18em] ${mutedCls}`}>
              <CheckCircle2 className="h-3 w-3 text-[hsl(var(--accent-kinetic))]" /> Faster review · Fewer follow-ups
            </p>
          </div>
          <a
            href={destination}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-12 items-center justify-center gap-2 bg-[hsl(var(--accent-kinetic))] px-5 font-[Geist,Inter,system-ui,sans-serif] text-[0.78rem] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--primary-foreground))] transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--ring))]"
          >
            {cta} <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </section>
      </div>
    </>
  );
}
