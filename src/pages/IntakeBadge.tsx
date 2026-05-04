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
          className={`m-0 grid w-full max-w-[760px] gap-4 rounded-[1.35rem] border p-4 shadow-[0_18px_48px_-28px_hsl(250_80%_35%/0.55)] ${
            forceDark
              ? "border-white/15 bg-[#101014] text-white"
              : forceLight
                ? "border-slate-200 bg-white text-slate-950"
                : "border-border bg-card text-foreground dark:border-white/15 dark:bg-[#101014] dark:text-white"
          } ${compact ? "sm:grid-cols-[1fr_auto] sm:items-center" : "sm:grid-cols-[1fr_auto] sm:items-center"}`}
        >
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <BrandMark variant="horizontal" tone={forceDark ? "light" : "auto"} size={30} eager />
              <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary dark:text-primary-glow">
                Guided photo request
              </span>
            </div>
            <h1 className={`mt-3 font-semibold tracking-tight ${compact ? "text-base" : "text-xl"}`}>
              {title}
            </h1>
            <p className={`mt-1.5 leading-6 ${compact ? "text-xs" : "text-sm"} ${forceDark ? "text-white/70" : "text-muted-foreground dark:text-white/70"}`}>
              {message}
            </p>
            <p className={`mt-3 inline-flex items-center gap-1.5 text-xs font-medium ${forceDark ? "text-white/65" : "text-muted-foreground dark:text-white/65"}`}>
              <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Faster review. Fewer follow-ups.
            </p>
          </div>
          <a
            href={destination}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-glow transition hover:-translate-y-0.5 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {cta} <ArrowRight className="ml-1.5 h-4 w-4" />
          </a>
        </section>
      </div>
    </>
  );
}
