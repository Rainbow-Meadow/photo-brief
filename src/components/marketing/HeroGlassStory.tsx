import { ArrowRight, Camera, CheckCircle2, ClipboardList, Globe2, Route, Sparkles, Zap } from "lucide-react";
import wideGarage from "@/assets/junk-removal/wide-garage.jpg";
import pileCloseup from "@/assets/junk-removal/pile-closeup.jpg";
import appliances from "@/assets/junk-removal/appliances.jpg";
import drivewayAccess from "@/assets/junk-removal/driveway-access.jpg";

const SHOTS = [
  { src: wideGarage, label: "Full area" },
  { src: pileCloseup, label: "Main pile" },
  { src: appliances, label: "Appliances" },
  { src: drivewayAccess, label: "Access" },
];

export function HeroGlassStory() {
  return (
    <div className="relative mx-auto w-full max-w-6xl">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 rounded-[3rem] bg-ambient-future" />
      <div aria-hidden className="future-grid pointer-events-none absolute -inset-10 -z-10 opacity-70" />
      <div aria-hidden className="pointer-events-none absolute -left-10 top-16 h-40 w-40 rounded-full bg-primary/20 blur-3xl animate-pulse-glow" />
      <div aria-hidden className="pointer-events-none absolute -right-10 bottom-12 h-48 w-48 rounded-full bg-primary-glow/20 blur-3xl animate-pulse-glow" />

      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.15fr_0.95fr] lg:items-center">
        <div className="glass-strong magnetic-card rounded-[2rem] p-5 animate-float-slow">
          <div className="flex items-center justify-between">
            <span className="text-eyebrow">Website Intake</span>
            <span className="rounded-full bg-success/10 px-2.5 py-1 text-[11px] font-semibold text-success">Live</span>
          </div>
          <div className="mt-4 rounded-3xl bg-background/70 p-4 ring-1 ring-border/70">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Globe2 className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">New website lead</p>
                <p className="text-xs text-muted-foreground">Garage cleanout quote</p>
              </div>
            </div>
            <div className="mt-4 space-y-2 text-xs">
              <Row label="Name" value="Marcus T." />
              <Row label="Message" value="Need junk removed this week." />
              <Row label="Source" value="Get a quote form" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-2xl bg-primary/10 p-3 text-sm text-primary">
            <Route className="h-4 w-4" />
            Rule matched: Junk removal quote
          </div>
        </div>

        <div className="glass-strong relative overflow-hidden rounded-[2.25rem] p-5 shadow-glass-lg sm:p-6 animate-lift-in">
          <span aria-hidden className="animate-sheen pointer-events-none absolute inset-y-0 left-0 w-1/4 -skew-x-12 bg-white/35 blur-xl" />
          <div className="flex items-center justify-between gap-3">
            <div>
              <span className="text-eyebrow">Customer capture</span>
              <h3 className="mt-1 text-xl font-semibold tracking-tight text-foreground">Send 4 quick photos</h3>
            </div>
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">2/4 done</span>
          </div>

          <div className="mt-5 overflow-hidden rounded-[1.75rem] bg-muted ring-1 ring-border/70">
            <img src={pileCloseup} alt="Junk removal photo example" className="h-56 w-full object-cover sm:h-64" loading="eager" />
          </div>

          <div className="mt-4 rounded-3xl bg-background/75 p-4 ring-1 ring-border/70">
            <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Camera className="h-4 w-4 text-primary" /> Main pile close-up
            </p>
            <p className="mt-1 text-sm text-muted-foreground">Stand back enough to show the full amount.</p>
            <div className="mt-4 flex items-center gap-2 rounded-2xl bg-success/10 p-3 text-sm text-success">
              <CheckCircle2 className="h-4 w-4" /> Looks good — this photo should work well.
            </div>
          </div>
        </div>

        <div className="glass-strong magnetic-card rounded-[2rem] p-5 animate-float-delayed">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-eyebrow">Business brief</span>
              <p className="mt-1 text-sm font-semibold text-foreground">Quote-ready</p>
              <p className="text-xs text-muted-foreground">Created automatically</p>
            </div>
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow">
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
        <Zap className="h-3.5 w-3.5 text-primary" /> Website lead → template → photo request → job-ready brief
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
