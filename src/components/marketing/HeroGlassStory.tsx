import { ArrowRight, Camera, CheckCircle2, ClipboardList, Link2, Route, Sparkles, Zap } from "lucide-react";
import wideGarage from "@/assets/junk-removal/wide-garage.jpg";
import pileCloseup from "@/assets/junk-removal/pile-closeup.jpg";
import appliances from "@/assets/junk-removal/appliances.jpg";
import drivewayAccess from "@/assets/junk-removal/driveway-access.jpg";
import { cn } from "@/lib/utils";

const SHOTS = [
  { src: wideGarage, label: "Full area" },
  { src: pileCloseup, label: "Main pile" },
  { src: appliances, label: "Appliances" },
  { src: drivewayAccess, label: "Access" },
];

type HeroGlassStoryProps = {
  /** The landing hero gives this component less width than full-page portfolio sections. */
  density?: "default" | "hero";
};

export function HeroGlassStory({ density = "default" }: HeroGlassStoryProps) {
  const isHero = density === "hero";

  return (
    <div className={cn("relative mx-auto w-full", isHero ? "max-w-[720px]" : "max-w-6xl")}>
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 rounded-[3rem] bg-ambient-future" />
      <div aria-hidden className="future-grid pointer-events-none absolute -inset-10 -z-10 opacity-70" />
      <div aria-hidden className="pointer-events-none absolute -left-10 top-16 h-40 w-40 rounded-full bg-primary/20 blur-3xl animate-pulse-glow" />
      <div aria-hidden className="pointer-events-none absolute -right-10 bottom-12 h-48 w-48 rounded-full bg-primary-glow/20 blur-3xl animate-pulse-glow" />

      <div
        className={cn(
          "grid gap-5 lg:items-center",
          isHero
            ? "md:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] md:gap-4"
            : "lg:grid-cols-[minmax(210px,0.9fr)_minmax(260px,1.15fr)_minmax(210px,0.95fr)]",
        )}
      >
        <div className={cn("glass-strong magnetic-card rounded-[2rem] p-5 animate-float-slow", isHero && "md:col-start-1 md:row-start-1")}>
          <div className="flex items-center justify-between">
            <span className="text-eyebrow">Send the link</span>
            <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">Free start</span>
          </div>
          <div className="mt-4 rounded-3xl bg-background/70 p-4 ring-1 ring-border/70">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Link2 className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">PhotoBrief request</p>
                <p className="text-xs text-muted-foreground">Garage cleanout quote</p>
              </div>
            </div>
            <div className="mt-4 space-y-2 text-xs">
              <Row label="Customer" value="Marcus T." />
              <Row label="Needed" value="4 quick photos" />
              <Row label="Link" value="photobrief.ai/r/…" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-2xl bg-primary/10 p-3 text-sm text-primary">
            <Route className="h-4 w-4 shrink-0" />
            <span>Pro can trigger this from your website automatically</span>
          </div>
        </div>

        <div className={cn("glass-strong relative overflow-hidden rounded-[2.25rem] p-5 shadow-glass-lg sm:p-6 animate-lift-in", isHero && "md:col-start-2 md:row-span-2 md:row-start-1")}>
          <span aria-hidden className="animate-sheen pointer-events-none absolute inset-y-0 left-0 w-1/4 -skew-x-12 bg-white/35 blur-xl" />
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <span className="text-eyebrow">Customer capture</span>
              <h3 className="mt-1 text-xl font-semibold tracking-tight text-foreground">One photo at a time</h3>
            </div>
            <span className="shrink-0 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">2/4 done</span>
          </div>

          <div className="mt-5 overflow-hidden rounded-[1.75rem] bg-muted ring-1 ring-border/70">
            <img src={pileCloseup} alt="Junk removal photo example" className={cn("w-full object-cover", isHero ? "h-48 sm:h-56" : "h-56 sm:h-64")} loading="eager" />
          </div>

          <div className="mt-4 rounded-3xl bg-background/75 p-4 ring-1 ring-border/70">
            <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Camera className="h-4 w-4 shrink-0 text-primary" /> Main pile close-up
            </p>
            <p className="mt-1 text-sm text-muted-foreground">Stand back enough to show the full amount.</p>
            <div className="mt-4 flex items-center gap-2 rounded-2xl bg-success/10 p-3 text-sm text-success">
              <CheckCircle2 className="h-4 w-4 shrink-0" /> Looks good — this photo should work well.
            </div>
          </div>
        </div>

        <div className={cn("glass-strong magnetic-card rounded-[2rem] p-5 animate-float-delayed", isHero && "md:col-start-1 md:row-start-2")}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <span className="text-eyebrow">Business brief</span>
              <p className="mt-1 text-sm font-semibold text-foreground">Ready to quote</p>
              <p className="text-xs text-muted-foreground">Photos organized automatically</p>
            </div>
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow">
              <Sparkles className="h-5 w-5" />
            </span>
          </div>

          <div className="mt-4 grid grid-cols-4 gap-1.5">
            {SHOTS.map((shot) => (
              <div key={shot.label} className="relative aspect-square overflow-hidden rounded-xl ring-1 ring-border/70">
                <img src={shot.src} alt={shot.label} className="h-full w-full object-cover" loading="lazy" />
                <span className="absolute right-1 top-1 rounded-full bg-success p-0.5 text-success-foreground">
                  <CheckCircle2 className="h-3 w-3" />
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-3xl bg-background/75 p-4 ring-1 ring-border/70">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
              <ClipboardList className="h-3.5 w-3.5" /> Summary
            </p>
            <p className="mt-2 text-sm leading-6 text-foreground">
              Single-car garage cleanout, about half truckload. Ground-level access. Appliance handling needed.
            </p>
          </div>
          <button className="btn-primary-glass mt-4 flex w-full items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold text-primary-foreground">
            Review brief <ArrowRight className="ml-2 h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mx-auto mt-5 flex max-w-3xl items-center justify-center gap-2 rounded-full glass px-4 py-2 text-xs font-medium text-muted-foreground">
        <Zap className="h-3.5 w-3.5 shrink-0 text-primary" /> Manual link or website lead → guided photos → ready-to-use brief
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-muted/50 px-3 py-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="truncate font-medium text-foreground">{value}</span>
    </div>
  );
}
