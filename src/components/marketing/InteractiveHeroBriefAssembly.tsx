import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Camera,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  RefreshCw,
  ScanLine,
  ShieldCheck,
  Wifi,
  Battery,
  Signal,
  Send,
  Clock,
  AlertTriangle,
  User,
  Smartphone,
  Truck,
  MessageSquareText,
  Globe,
  Bell,
  Loader2,
  MapPin,
  Package,
  Sofa,
  Refrigerator,
  TreePine,
  LayoutList,
  Play,
  Pause,
  Volume2,
  VolumeX,
} from "lucide-react";
import wideGarage from "@/assets/junk-removal/wide-garage.webp";
import pileCloseup from "@/assets/junk-removal/pile-closeup.webp";
import appliances from "@/assets/junk-removal/appliances.webp";
import drivewayAccess from "@/assets/junk-removal/driveway-access.webp";

const API_URL =
  "https://mvlcefiygkzzewcdzsmj.functions.supabase.co/live-preview-submission";
const SESSION_KEY = "pb-session";

/** Index of the photo that will be "blurry" on first capture */
const BLURRY_INDEX = 1;

/* ── Fake brand ── */
const BRAND = {
  name: "ClearPath Junk Removal",
  short: "ClearPath",
  tagline: "We haul it all.",
  color: "#0d9488",        // teal-600
  colorLight: "#ccfbf1",   // teal-50
  colorMid: "#5eead4",     // teal-300
  colorRing: "rgba(13,148,136,0.25)",
};

const photos = [
  {
    id: "wide-area",
    src: wideGarage,
    label: "Wide area",
    prompt: "Stand back and capture the full area",
    status: "Verified",
    note: "Room context captured",
    good: true,
  },
  {
    id: "main-pile",
    src: pileCloseup,
    label: "Main pile",
    prompt: "Get closer to show the main pile",
    status: "Verified",
    note: "Amount and scale visible",
    good: true,
  },
  {
    id: "appliance",
    src: appliances,
    label: "Appliance",
    prompt: "Photograph any appliances separately",
    status: "Needs review",
    note: "Appliance handling likely needed",
    good: false,
  },
  {
    id: "access",
    src: drivewayAccess,
    label: "Access",
    prompt: "Show the access path to the area",
    status: "Verified",
    note: "Ground-level access shown",
    good: true,
  },
];

/** Customer answers (used in questions + final brief) */
const CUSTOMER_ANSWERS = [
  { q: "What needs removing?", a: "Furniture, Appliances, Boxes" },
  { q: "Approximate volume?", a: "Medium (half garage)" },
  { q: "Stairs or tight access?", a: "No" },
];

type Phase =
  | "CUSTOMER_REQUEST"
  | "ROUTING"
  | "QUESTIONS"
  | "CAPTURING"
  | "CUSTOMER_REVIEW"
  | "COMPLETE";

const PHASE_HINTS: Record<Phase, string> = {
  CUSTOMER_REQUEST: `The customer finds ${BRAND.short} online and submits a service request.`,
  ROUTING: "PhotoBrief matches the request to the right template automatically.",
  QUESTIONS: "The customer answers a few quick questions first.",
  CAPTURING: "Now the customer captures photos, one at a time.",
  CUSTOMER_REVIEW: "The customer reviews everything before sending.",
  COMPLETE: "The complete brief arrives on the business phone — ready to quote.",
};

function getSessionId() {
  if (typeof window === "undefined") return "server";
  const existing = window.localStorage.getItem(SESSION_KEY);
  if (existing) return existing;
  const next =
    window.crypto?.randomUUID?.() ??
    `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  window.localStorage.setItem(SESSION_KEY, next);
  return next;
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

/* ── Phone bezel — FIXED SIZE ── */
const PHONE_CONTENT_H = 520;

function PhoneMockup({
  label,
  sublabel,
  children,
  variant = "light",
}: {
  label: string;
  sublabel?: string;
  children: React.ReactNode;
  variant?: "light" | "dark";
}) {
  const bg = variant === "dark" ? "bg-[#0c0e14]" : "bg-white";
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="text-center">
        <span className="text-xs font-bold uppercase tracking-[0.16em] text-white/50">
          {label}
        </span>
        {sublabel && (
          <span className="ml-2 text-xs text-white/30">{sublabel}</span>
        )}
      </div>
      <div aria-hidden="true" className="relative w-[260px] rounded-[2.25rem] border-[3px] border-white/[0.08] bg-[#1a1a1f] p-[3px] shadow-[0_8px_40px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.04)] sm:w-[280px] sm:rounded-[2.5rem]">
        {/* Notch */}
        <div className="absolute left-1/2 top-[10px] z-20 h-[22px] w-[90px] -translate-x-1/2 rounded-full bg-black" />
        <div
          className={`relative overflow-hidden rounded-[2.25rem] ${bg}`}
          style={{ height: PHONE_CONTENT_H + 52 }}
        >
          {/* Status bar */}
          <div
            className={`flex items-center justify-between px-6 pb-1 pt-[38px] text-[10px] font-semibold ${variant === "dark" ? "text-white/50" : "text-black/40"}`}
          >
            <span>9:41</span>
            <div className="flex items-center gap-1">
              <Signal className="h-3 w-3" />
              <Wifi className="h-3 w-3" />
              <Battery className="h-3.5 w-3.5" />
            </div>
          </div>
          {/* Scrollable content area */}
          <div
            className="overflow-y-auto px-4 pb-6"
            style={{ height: PHONE_CONTENT_H }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Animated connection line ── */
function ConnectionLine() {
  return (
    <div className="hidden items-center justify-center self-center lg:flex">
      <div className="flex flex-col items-center gap-2">
        <div className="h-20 w-px border-l border-dashed border-white/15" />
        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[hsl(var(--pb-violet)/0.4)] bg-[hsl(var(--pb-violet)/0.12)]">
          <ArrowRight className="h-3.5 w-3.5 text-[hsl(var(--pb-lavender))]" />
        </div>
        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/25">
          Live sync
        </span>
        <div className="h-20 w-px border-l border-dashed border-white/15" />
      </div>
    </div>
  );
}

/* ── Powered by PhotoBrief mini-badge (for customer screens) ── */
function MiniPoweredBy() {
  return (
    <p className="mt-3 flex items-center justify-center gap-1 text-[9px] text-black/25">
      <Camera className="h-2.5 w-2.5" />
      Powered by PhotoBrief
    </p>
  );
}

/* ── ClearPath brand header (for customer screens) ── */
function ClearPathHeader({ compact }: { compact?: boolean }) {
  return (
    <div className={`flex items-center gap-2 ${compact ? "" : "mb-3"}`}>
      <div
        className="flex h-8 w-8 items-center justify-center rounded-lg"
        style={{ backgroundColor: BRAND.colorLight }}
      >
        <Truck className="h-4 w-4" style={{ color: BRAND.color }} />
      </div>
      <div className="min-w-0">
        <p className="text-[12px] font-bold text-black/80">{BRAND.short}</p>
        {!compact && (
          <p className="text-[9px] text-black/35">{BRAND.tagline}</p>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────── */
/* ── BUSINESS SCREENS                                  ── */
/* ─────────────────────────────────────────────────────── */

/** Business phone — idle dashboard (phases 1-5) */
function BusinessIdleScreen({
  phase,
  capturedCount,
}: {
  phase: Phase;
  capturedCount: number;
}) {
  const showNotif = phase !== "CUSTOMER_REQUEST";
  const showProgress = phase === "CAPTURING" || phase === "CUSTOMER_REVIEW" || phase === "QUESTIONS";

  return (
    <div className="flex min-h-[420px] flex-col">
      {/* ClearPath dashboard header */}
      <div className="mb-4 mt-1">
        <div className="flex items-center gap-2">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl"
            style={{ backgroundColor: "rgba(13,148,136,0.15)" }}
          >
            <Truck className="h-4.5 w-4.5" style={{ color: BRAND.color }} />
          </div>
          <div>
            <p className="text-[13px] font-bold text-white/80">{BRAND.short}</p>
            <p className="text-[9px] text-white/35">{BRAND.tagline}</p>
          </div>
        </div>
      </div>

      {/* Requests section */}
      <div className="rounded-xl bg-white/[0.04] p-3">
        <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white/35">
          <LayoutList className="h-3 w-3" /> Recent requests
        </p>

        {!showNotif ? (
          <div className="mt-4 flex flex-col items-center py-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.04]">
              <ClipboardList className="h-5 w-5 text-white/15" />
            </div>
            <p className="mt-2 text-[11px] text-white/25">No new requests</p>
            <p className="mt-0.5 text-[9px] text-white/15">
              Requests from your website will appear here
            </p>
          </div>
        ) : (
          <div className="mt-2 space-y-2">
            {/* New lead notification */}
            <div className="rounded-xl bg-white/[0.06] p-3 ring-1 ring-white/[0.06]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Bell className="h-3.5 w-3.5 text-white/40" />
                    <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-emerald-400" />
                  </div>
                  <span className="text-[11px] font-semibold text-white/70">
                    New lead
                  </span>
                </div>
                <span className="text-[9px] text-white/30">Just now</span>
              </div>
              <div className="mt-2 space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] text-white/45">
                  <User className="h-2.5 w-2.5" /> Sarah Johnson
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-white/45">
                  <Package className="h-2.5 w-2.5" /> Garage cleanout
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-white/45">
                  <Globe className="h-2.5 w-2.5" /> Website intake
                </div>
              </div>

              {/* Progress indicator */}
              {showProgress && (
                <div className="mt-3 flex items-center gap-2 rounded-lg bg-white/[0.04] px-2.5 py-2">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-400" />
                  </span>
                  <span className="text-[10px] font-semibold text-amber-400/80">
                    {phase === "QUESTIONS"
                      ? "Answering questions…"
                      : phase === "CUSTOMER_REVIEW"
                        ? "Reviewing photos…"
                        : `Capturing photos… ${capturedCount}/${photos.length}`}
                  </span>
                </div>
              )}

              {phase === "ROUTING" && (
                <div className="mt-3 flex items-center gap-2 rounded-lg bg-white/[0.04] px-2.5 py-2">
                  <Loader2 className="h-3 w-3 animate-spin text-white/30" />
                  <span className="text-[10px] text-white/40">
                    Routing to template…
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* No action needed hint */}
      <div className="mt-3 rounded-xl bg-white/[0.03] p-3 text-center">
        <p className="text-[10px] text-white/20">
          {showNotif
            ? "No action needed — the customer is completing their brief."
            : "Your website intake is live and waiting for leads."}
        </p>
      </div>

      {/* Website intake status */}
      <div className="mt-3 flex items-center justify-between rounded-xl bg-white/[0.04] px-3 py-2.5">
        <span className="flex items-center gap-2 text-[10px] text-white/35">
          <Globe className="h-3 w-3" /> Website intake
        </span>
        <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[9px] font-bold text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Active
        </span>
      </div>
    </div>
  );
}

/** Business phone — completed brief (phase COMPLETE) */
function BriefCompleteScreen() {
  return (
    <>
      <div className="mb-3 mt-1 flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/35">
            {BRAND.short}
          </span>
          <h3 className="mt-0.5 text-[15px] font-bold tracking-tight text-white/90">
            Brief complete
          </h3>
        </div>
        <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
          Ready
        </span>
      </div>

      {/* Customer info */}
      <div className="mb-2 rounded-xl bg-white/[0.04] p-2.5">
        <div className="flex items-center gap-2">
          <User className="h-3 w-3 text-white/30" />
          <span className="text-[11px] font-semibold text-white/60">Sarah Johnson</span>
          <span className="ml-auto text-[9px] text-white/25">via website</span>
        </div>
      </div>

      {/* Customer answers */}
      <div className="mb-2 rounded-xl bg-white/[0.04] p-3">
        <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white/35">
          <MessageSquareText className="h-3 w-3" /> Answers
        </p>
        <div className="mt-2 space-y-1.5">
          {CUSTOMER_ANSWERS.map((qa) => (
            <div key={qa.q} className="flex items-start justify-between gap-2 rounded-lg bg-white/[0.03] px-2.5 py-1.5">
              <span className="text-[10px] text-white/40">{qa.q}</span>
              <span className="text-[10px] font-semibold text-white/65 text-right shrink-0">{qa.a}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Photo grid */}
      <div className="grid grid-cols-2 gap-1.5">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="relative overflow-hidden rounded-xl ring-1 ring-white/[0.08]"
          >
            <img
              src={photo.src}
              alt={photo.label}
              className="h-[60px] w-full object-cover"
              width={300} height={300} loading="lazy" sizes="150px"
            />
            <div className="flex items-center justify-between bg-black/50 px-2 py-1">
              <span className="text-[9px] font-semibold text-white/70">
                {photo.label}
              </span>
              <span className="flex items-center gap-0.5 text-[8px] font-bold text-emerald-400">
                <ShieldCheck className="h-2 w-2" />
                OK
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* AI Summary */}
      <div className="mt-2 rounded-xl bg-white/[0.04] p-3">
        <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white/35">
          <ScanLine className="h-3 w-3" /> AI summary
        </p>
        <p className="mt-2 text-[11px] leading-[1.6] text-white/55">
          Garage cleanout — furniture, appliances, and boxes. Medium volume, ground-level access. All photos verified. Appliance may need separate handling.
        </p>
      </div>

      <button
        type="button"
        className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500/20 px-4 py-2.5 text-[12px] font-bold text-emerald-400 transition-all"
        disabled
      >
        <CheckCircle2 className="h-3.5 w-3.5" /> Quote now
      </button>
    </>
  );
}

/* ─────────────────────────────────────────────────────── */
/* ── CUSTOMER SCREENS                                  ── */
/* ─────────────────────────────────────────────────────── */

/** Phase 1 — Customer submits a request on ClearPath's website */
function CustomerRequestScreen({ onSubmit }: { onSubmit: () => void }) {
  return (
    <div className="flex min-h-[420px] flex-col">
      {/* Fake website header */}
      <div className="mb-3 mt-1 flex items-center justify-between">
        <ClearPathHeader />
        <span className="text-[9px] text-black/25">clearpathjunk.com</span>
      </div>

      {/* Hero area */}
      <div
        className="mb-4 rounded-xl p-4 text-center"
        style={{ backgroundColor: BRAND.colorLight }}
      >
        <Truck className="mx-auto h-7 w-7" style={{ color: BRAND.color }} />
        <p className="mt-2 text-[14px] font-bold" style={{ color: BRAND.color }}>
          Get a free quote
        </p>
        <p className="mt-0.5 text-[10px] text-black/40">
          Tell us what you need hauled — we'll get back to you fast.
        </p>
      </div>

      {/* Form fields */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 rounded-xl bg-black/[0.04] px-3 py-2.5">
          <User className="h-3.5 w-3.5 shrink-0 text-black/25" />
          <span className="text-[12px] text-black/55">Sarah Johnson</span>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-black/[0.04] px-3 py-2.5">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-black/25" />
          <span className="text-[12px] text-black/55">742 Evergreen Terrace</span>
        </div>
        <div className="flex items-center justify-between rounded-xl bg-black/[0.04] px-3 py-2.5">
          <span className="flex items-center gap-2 text-[12px] text-black/55">
            <Package className="h-3.5 w-3.5 shrink-0 text-black/25" />
            Garage cleanout
          </span>
          <ChevronRight className="h-3.5 w-3.5 text-black/20" />
        </div>
        <div className="rounded-xl bg-black/[0.04] px-3 py-2.5">
          <p className="text-[12px] text-black/40 leading-[1.5]">
            Need the garage cleared before we move. Lots of old furniture and a broken fridge…
          </p>
        </div>
      </div>

      {/* Submit */}
      <button
        type="button"
        onClick={onSubmit}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-[13px] font-bold text-white transition-all hover:brightness-110 active:scale-[0.98]"
        style={{ backgroundColor: BRAND.color }}
      >
        <Send className="h-4 w-4" /> Request service
      </button>
      <MiniPoweredBy />
    </div>
  );
}

/** Phase 2 — Routing transition */
function CustomerRoutingScreen({ onDone }: { onDone: () => void }) {
  // Auto-advance after a short "pause"
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
      <ClearPathHeader />
      <div className="mt-6 flex flex-col items-center">
        <div
          className="flex h-14 w-14 items-center justify-center rounded-full"
          style={{ backgroundColor: BRAND.colorLight }}
        >
          <Loader2 className="h-6 w-6 animate-spin" style={{ color: BRAND.color }} />
        </div>
        <h3 className="mt-4 text-[15px] font-bold tracking-tight text-black/80">
          Setting up your photo brief
        </h3>
        <p className="mt-1.5 px-4 text-[12px] leading-[1.6] text-black/40">
          {BRAND.short} uses PhotoBrief to collect the right photos upfront — so they can quote faster.
        </p>
        <div className="mt-5 flex items-center gap-2 rounded-full bg-black/[0.04] px-3 py-1.5">
          <Camera className="h-3 w-3 text-black/30" />
          <span className="text-[10px] font-semibold text-black/40">4 photos · 3 questions · ~3 min</span>
        </div>
        <button
          type="button"
          onClick={onDone}
          className="mt-6 flex items-center gap-2 rounded-xl px-6 py-3 text-[13px] font-bold text-white transition-all hover:brightness-110 active:scale-[0.98]"
          style={{ backgroundColor: BRAND.color }}
        >
          Continue <ArrowRight className="h-4 w-4" />
        </button>
      </div>
      <MiniPoweredBy />
    </div>
  );
}

/** Phase 3 — Customer answers context questions */
function CustomerQuestionsScreen({ onContinue }: { onContinue: () => void }) {
  const [selected, setSelected] = useState({
    items: new Set(["furniture", "appliances", "boxes"]),
    volume: "medium",
    stairs: "no",
  });

  const itemChips = [
    { id: "furniture", label: "Furniture", icon: Sofa },
    { id: "appliances", label: "Appliances", icon: Refrigerator },
    { id: "boxes", label: "Boxes", icon: Package },
    { id: "yard", label: "Yard waste", icon: TreePine },
  ];

  return (
    <div className="flex min-h-[420px] flex-col">
      {/* Header */}
      <div className="mb-3 mt-1 flex items-center justify-between">
        <ClearPathHeader compact />
        <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ backgroundColor: BRAND.colorLight, color: BRAND.color }}>
          Step 1 of 2
        </span>
      </div>

      <h3 className="text-[15px] font-bold tracking-tight text-black/85">
        A few quick questions
      </h3>
      <p className="mt-0.5 mb-4 text-[11px] text-black/40">
        This helps {BRAND.short} prepare an accurate quote.
      </p>

      {/* Q1 — What needs removing */}
      <div className="mb-3">
        <p className="mb-1.5 text-[11px] font-semibold text-black/60">What needs removing?</p>
        <div className="flex flex-wrap gap-1.5">
          {itemChips.map((chip) => {
            const active = selected.items.has(chip.id);
            const Icon = chip.icon;
            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => {
                  const next = new Set(selected.items);
                  active ? next.delete(chip.id) : next.add(chip.id);
                  setSelected({ ...selected, items: next });
                }}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium transition-all ${
                  active
                    ? "text-white"
                    : "bg-black/[0.04] text-black/50"
                }`}
                style={active ? { backgroundColor: BRAND.color } : undefined}
              >
                <Icon className="h-3 w-3" /> {chip.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Q2 — Volume */}
      <div className="mb-3">
        <p className="mb-1.5 text-[11px] font-semibold text-black/60">Approximate volume?</p>
        <div className="flex gap-1.5">
          {["small", "medium", "large"].map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setSelected({ ...selected, volume: v })}
              className={`flex-1 rounded-xl py-2 text-[11px] font-medium capitalize transition-all ${
                selected.volume === v
                  ? "text-white"
                  : "bg-black/[0.04] text-black/50"
              }`}
              style={selected.volume === v ? { backgroundColor: BRAND.color } : undefined}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Q3 — Stairs */}
      <div className="mb-4">
        <p className="mb-1.5 text-[11px] font-semibold text-black/60">Any stairs or tight access?</p>
        <div className="flex gap-1.5">
          {["yes", "no"].map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setSelected({ ...selected, stairs: v })}
              className={`flex-1 rounded-xl py-2 text-[11px] font-medium capitalize transition-all ${
                selected.stairs === v
                  ? "text-white"
                  : "bg-black/[0.04] text-black/50"
              }`}
              style={selected.stairs === v ? { backgroundColor: BRAND.color } : undefined}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Continue */}
      <button
        type="button"
        onClick={onContinue}
        className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-[13px] font-bold text-white transition-all hover:brightness-110 active:scale-[0.98]"
        style={{ backgroundColor: BRAND.color }}
      >
        Continue to photos <Camera className="h-4 w-4" />
      </button>
      <MiniPoweredBy />
    </div>
  );
}

/** Customer capture screen */
function CustomerCaptureScreen({
  currentStep,
  captured,
  blurryPending,
  onCapture,
}: {
  currentStep: number;
  captured: Set<number>;
  blurryPending: boolean;
  onCapture: () => void;
}) {
  const photo = photos[currentStep];
  const capturedCount = captured.size;
  const isBlurryShot = currentStep === BLURRY_INDEX && blurryPending && captured.has(BLURRY_INDEX);

  return (
    <>
      {/* App header */}
      <div className="mb-3 mt-1">
        <div className="flex items-center justify-between">
          <ClearPathHeader compact />
          <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ backgroundColor: BRAND.colorLight, color: BRAND.color }}>
            Step 2 · {capturedCount}/{photos.length}
          </span>
        </div>
        <h3 className="mt-1 text-[15px] font-bold tracking-tight text-black/85">
          Capture photos
        </h3>
      </div>

      {/* Progress dots */}
      <div className="mb-3 flex items-center gap-1.5">
        {photos.map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300`}
            style={{
              backgroundColor: captured.has(i)
                ? BRAND.color
                : i === currentStep
                  ? BRAND.colorRing
                  : "rgba(0,0,0,0.06)",
            }}
          />
        ))}
      </div>

      {/* Photo viewfinder */}
      <div className="relative overflow-hidden rounded-2xl bg-black/[0.03]">
        {isBlurryShot ? (
          <div className="relative">
            <img
              src={photo.src}
              alt={photo.label}
              className="h-[200px] w-full object-cover blur-[3px]"
              width={300} height={300} loading="lazy" sizes="300px"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-amber-900/30">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90">
                <AlertTriangle className="h-6 w-6 text-amber-500" />
              </div>
            </div>
          </div>
        ) : captured.has(currentStep) ? (
          <div className="relative">
             <img
               src={photo.src}
               alt={photo.label}
               className="h-[200px] w-full object-cover"
               width={300} height={300} loading="lazy" sizes="300px"
             />
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90">
                <CheckCircle2 className="h-6 w-6 text-emerald-500" />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex h-[200px] flex-col items-center justify-center bg-gradient-to-b from-black/[0.02] to-black/[0.05]">
            <div className="relative flex h-28 w-28 items-center justify-center">
              <div className="absolute left-0 top-0 h-5 w-5 border-l-2 border-t-2 border-black/20 rounded-tl" />
              <div className="absolute right-0 top-0 h-5 w-5 border-r-2 border-t-2 border-black/20 rounded-tr" />
              <div className="absolute bottom-0 left-0 h-5 w-5 border-b-2 border-l-2 border-black/20 rounded-bl" />
              <div className="absolute bottom-0 right-0 h-5 w-5 border-b-2 border-r-2 border-black/20 rounded-br" />
              <Camera className="h-8 w-8 text-black/20" />
            </div>
          </div>
        )}
      </div>

      {/* Blurry feedback card */}
      {isBlurryShot && (
        <div className="mt-3 rounded-xl bg-amber-50 border border-amber-200 p-3">
          <p className="flex items-center gap-2 text-[13px] font-semibold text-amber-700">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            This looks blurry
          </p>
          <p className="mt-1 text-[12px] leading-[1.5] text-amber-600/80">
            Hold the camera steady and retake so the details are clear.
          </p>
        </div>
      )}

      {/* Normal prompt */}
      {!isBlurryShot && (
        <div className="mt-3 rounded-xl bg-black/[0.04] p-3">
          <p className="flex items-center gap-2 text-[13px] font-semibold text-black/70">
            <Camera className="h-3.5 w-3.5 shrink-0" style={{ color: BRAND.color }} />
            {photo.label}
          </p>
          <p className="mt-1 text-[12px] leading-[1.5] text-black/45">
            {photo.prompt}
          </p>
        </div>
      )}

      {/* Capture / Next / Retake button */}
      <button
        type="button"
        onClick={onCapture}
        className={`mt-3 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-[13px] font-bold text-white transition-all hover:brightness-110 active:scale-[0.98] ${
          isBlurryShot ? "bg-amber-500" : ""
        }`}
        style={!isBlurryShot ? { backgroundColor: BRAND.color } : undefined}
      >
        {isBlurryShot ? (
          <>
            <RefreshCw className="h-4 w-4" /> Retake photo
          </>
        ) : captured.has(currentStep) ? (
          <>
            Next shot <ChevronRight className="h-4 w-4" />
          </>
        ) : (
          <>
            <Camera className="h-4 w-4" /> Capture photo
          </>
        )}
      </button>

      {/* Thumbnails */}
      <div className="mt-3 grid grid-cols-4 gap-1.5">
        {photos.map((p, i) => (
          <div
            key={p.id}
            className={`relative aspect-square overflow-hidden rounded-lg ${
              i === currentStep
                ? "ring-2"
                : "ring-1 ring-black/[0.06]"
            }`}
            style={i === currentStep ? { boxShadow: `0 0 0 2px ${BRAND.color}` } : undefined}
          >
            {i === BLURRY_INDEX && blurryPending && captured.has(i) ? (
              <>
                <img
                  src={p.src}
                  alt={p.label}
                  className="h-full w-full object-cover blur-[2px]"
                  width={300} height={300} loading="lazy" sizes="48px"
                />
                <span className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500">
                  <AlertTriangle className="h-2.5 w-2.5 text-white" />
                </span>
              </>
            ) : captured.has(i) ? (
              <>
                <img
                  src={p.src}
                  alt={p.label}
                  className="h-full w-full object-cover"
                  width={300} height={300} loading="lazy" sizes="48px"
                />
                <span className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500">
                  <CheckCircle2 className="h-2.5 w-2.5 text-white" />
                </span>
              </>
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-black/[0.03]">
                <span className="text-[10px] font-bold text-black/20">
                  {i + 1}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

/** Customer review screen */
function CustomerReviewScreen({ onSubmit }: { onSubmit: () => void }) {
  return (
    <>
      <div className="mb-3 mt-1">
        <div className="flex items-center justify-between">
          <ClearPathHeader compact />
          <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
            {photos.length}/{photos.length}
          </span>
        </div>
        <h3 className="mt-1 text-[15px] font-bold tracking-tight text-black/85">
          Review &amp; send
        </h3>
        <p className="mt-1 text-[11px] text-black/40">
          Check everything looks right, then send it over.
        </p>
      </div>

      {/* Answers summary */}
      <div className="mb-2 rounded-xl bg-black/[0.03] p-2.5">
        <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-black/30 mb-1.5">Your answers</p>
        {CUSTOMER_ANSWERS.map((qa) => (
          <div key={qa.q} className="flex items-center justify-between py-0.5">
            <span className="text-[10px] text-black/35">{qa.q}</span>
            <span className="text-[10px] font-semibold text-black/55">{qa.a}</span>
          </div>
        ))}
      </div>

      {/* All captured thumbnails */}
      <div className="grid grid-cols-2 gap-2">
        {photos.map((p) => (
          <div key={p.id} className="overflow-hidden rounded-xl ring-1 ring-black/[0.06]">
            <img
              src={p.src}
              alt={p.label}
              className="h-[72px] w-full object-cover"
              width={300} height={300} loading="lazy" sizes="150px"
            />
            <div className="flex items-center justify-between px-2 py-1.5 bg-black/[0.02]">
              <span className="text-[10px] font-semibold text-black/50">{p.label}</span>
              <span className="flex items-center gap-0.5 text-[9px] font-bold text-emerald-500">
                <CheckCircle2 className="h-2.5 w-2.5" /> OK
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Submit button */}
      <button
        type="button"
        onClick={onSubmit}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-[13px] font-bold text-white transition-all hover:brightness-110 active:scale-[0.98]"
        style={{ backgroundColor: BRAND.color }}
      >
        <Send className="h-4 w-4" /> Send to {BRAND.short}
      </button>
      <MiniPoweredBy />
    </>
  );
}

/** Customer confirmation — after submit */
function CustomerConfirmationScreen() {
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
        <CheckCircle2 className="h-8 w-8 text-emerald-500" />
      </div>
      <h3 className="mt-4 text-[16px] font-bold tracking-tight text-black/85">
        Photos sent!
      </h3>
      <p className="mt-2 text-[12px] leading-[1.6] text-black/45 px-4">
        {BRAND.name} has your photos and will follow up with a quote.
      </p>
      <div className="mt-5 rounded-xl bg-black/[0.03] px-4 py-3">
        <p className="text-[10px] text-black/30">
          You can close this page now.
        </p>
      </div>
      <MiniPoweredBy />
    </div>
  );
}

/* ─────────────────────────────────────────────────────── */
/* ── Main component                                    ── */
/* ─────────────────────────────────────────────────────── */
/* ── Auto-play scene timing (seconds) — matches voiceover ── */
const SCENE_TIMINGS: { phase: Phase; time: number; captureStep?: number }[] = [
  { phase: "CUSTOMER_REQUEST", time: 0 },
  { phase: "ROUTING", time: 3.3 },
  { phase: "QUESTIONS", time: 6.3 },
  { phase: "CAPTURING", time: 18.3, captureStep: 0 },
  { phase: "CAPTURING", time: 21.5, captureStep: 1 },  // blurry capture
  { phase: "CAPTURING", time: 24.0, captureStep: 1 },  // retake
  { phase: "CAPTURING", time: 26.5, captureStep: 2 },
  { phase: "CAPTURING", time: 29.0, captureStep: 3 },
  { phase: "CUSTOMER_REVIEW", time: 32.3 },
  { phase: "COMPLETE", time: 46.3 },
];

export function InteractiveHeroBriefAssembly() {
  const [phase, setPhase] = useState<Phase>("CUSTOMER_REQUEST");
  const [currentStep, setCurrentStep] = useState(0);
  const [captured, setCaptured] = useState<Set<number>>(() => new Set());
  const [blurryPending, setBlurryPending] = useState(true);
  const [email, setEmail] = useState("");
  const [requestUrl, setRequestUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ── Auto-play / audio state ── */
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastSceneIdx = useRef(-1);

  // Lazy-init audio element
  const getAudio = useCallback(() => {
    if (!audioRef.current) {
      const a = new Audio("/audio/photobrief-voiceover.mp3");
      a.preload = "auto";
      audioRef.current = a;
    }
    return audioRef.current;
  }, []);

  // Sync scene to audio currentTime
  const syncScene = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || audio.paused) return;
    const t = audio.currentTime;

    // Find the latest scene whose time has passed
    let idx = 0;
    for (let i = SCENE_TIMINGS.length - 1; i >= 0; i--) {
      if (t >= SCENE_TIMINGS[i].time) { idx = i; break; }
    }

    if (idx !== lastSceneIdx.current) {
      lastSceneIdx.current = idx;
      const scene = SCENE_TIMINGS[idx];
      setPhase(scene.phase);

      // Handle capture-phase sub-steps
      if (scene.phase === "CAPTURING" && scene.captureStep !== undefined) {
        const step = scene.captureStep;
        setCaptured(prev => {
          const next = new Set(prev);
          // Add all photos up to this step
          for (let s = 0; s < step; s++) next.add(s);
          // Special: idx=4 is blurry capture (don't mark good yet), idx=5 is retake
          if (idx === 4) { next.add(step); } // blurry first attempt
          if (idx >= 5) { next.add(step); }  // retake done
          if (idx >= 6) { next.add(2); }
          if (idx >= 7) { next.add(3); }
          return next;
        });
        setCurrentStep(step);
        // blurryPending is true only before retake
        setBlurryPending(idx <= 4);
      }
      if (scene.phase === "CUSTOMER_REVIEW" || scene.phase === "COMPLETE") {
        setCaptured(new Set([0, 1, 2, 3]));
        setBlurryPending(false);
      }
    }

    rafRef.current = requestAnimationFrame(syncScene);
  }, []);

  // Play / pause toggle
  const togglePlay = useCallback(() => {
    const audio = getAudio();
    if (isPlaying) {
      audio.pause();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      setIsPlaying(false);
    } else {
      // Reset if ended or near end
      if (audio.ended || audio.currentTime > 80) {
        audio.currentTime = 0;
        lastSceneIdx.current = -1;
        setPhase("CUSTOMER_REQUEST");
        setCaptured(new Set());
        setCurrentStep(0);
        setBlurryPending(true);
      }
      audio.muted = isMuted;
      audio.play().then(() => {
        setIsPlaying(true);
        rafRef.current = requestAnimationFrame(syncScene);
      }).catch(() => {});
    }
  }, [isPlaying, isMuted, getAudio, syncScene]);

  // Mute toggle
  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (audio) audio.muted = !isMuted;
    setIsMuted(m => !m);
  }, [isMuted]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      audioRef.current?.pause();
    };
  }, []);

  // Listen for audio end
  useEffect(() => {
    const audio = getAudio();
    const onEnd = () => {
      setIsPlaying(false);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    audio.addEventListener("ended", onEnd);
    return () => audio.removeEventListener("ended", onEnd);
  }, [getAudio]);

  const hasFlag = [...captured].some((i) => !photos[i].good);

  function handleCapture() {
    const next = new Set(captured);

    // If blurry photo is showing and user taps retake
    if (currentStep === BLURRY_INDEX && blurryPending && next.has(currentStep)) {
      setBlurryPending(false);
      if (currentStep < photos.length - 1) {
        setCurrentStep(currentStep + 1);
      }
      return;
    }

    if (!next.has(currentStep)) {
      next.add(currentStep);
      setCaptured(next);
      if (currentStep === BLURRY_INDEX && blurryPending) {
        return;
      }
    } else if (currentStep < photos.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setPhase("CUSTOMER_REVIEW");
      return;
    }
    setRequestUrl(null);
    setError(null);
  }

  async function submitLead(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (!isValidEmail(email)) {
      setError("Enter a valid email to create the request.");
      return;
    }
    setSubmitting(true);
    try {
      const selectedPhotos = [...captured]
        .sort((a, b) => a - b)
        .map((i) => photos[i]);
      const payload = {
        session_id: getSessionId(),
        source: "photobrief-marketing-hero",
        workflow_mode: "capture",
        brief: {
          selected_count: captured.size,
          required_count: photos.length,
          readiness: "ready",
          issue: hasFlag ? "Appliance review needed" : null,
          summary: hasFlag
            ? "Brief complete with appliance review needed before quoting."
            : "Brief ready for quote review.",
        },
        photos: selectedPhotos.map(({ id, label, status, note }) => ({
          id,
          label,
          status,
          note,
        })),
        missing: [],
        lead: { email: email.trim(), consented: true },
      };
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok)
        throw new Error(data?.error || "Could not create request.");
      if (!data?.request_url)
        throw new Error("Request was saved, but no request link came back.");
      setRequestUrl(data.request_url);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong creating the request.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  /* ── Determine screen content per phase ── */
  let businessContent: React.ReactNode;
  let customerContent: React.ReactNode;

  switch (phase) {
    case "CUSTOMER_REQUEST":
      businessContent = <BusinessIdleScreen phase={phase} capturedCount={0} />;
      customerContent = <CustomerRequestScreen onSubmit={() => setPhase("ROUTING")} />;
      break;
    case "ROUTING":
      businessContent = <BusinessIdleScreen phase={phase} capturedCount={0} />;
      customerContent = <CustomerRoutingScreen onDone={() => setPhase("QUESTIONS")} />;
      break;
    case "QUESTIONS":
      businessContent = <BusinessIdleScreen phase={phase} capturedCount={0} />;
      customerContent = <CustomerQuestionsScreen onContinue={() => setPhase("CAPTURING")} />;
      break;
    case "CAPTURING":
      businessContent = <BusinessIdleScreen phase={phase} capturedCount={captured.size} />;
      customerContent = (
        <CustomerCaptureScreen
          currentStep={currentStep}
          captured={captured}
          blurryPending={blurryPending}
          onCapture={handleCapture}
        />
      );
      break;
    case "CUSTOMER_REVIEW":
      businessContent = <BusinessIdleScreen phase={phase} capturedCount={captured.size} />;
      customerContent = <CustomerReviewScreen onSubmit={() => setPhase("COMPLETE")} />;
      break;
    case "COMPLETE":
      businessContent = <BriefCompleteScreen />;
      customerContent = <CustomerConfirmationScreen />;
      break;
  }

  return (
    <div className="relative mt-2">
      {/* Section header */}
      <div className="mb-6 text-center sm:mb-8">
        <span className="pb-eyebrow border-white/12 bg-white/[0.03]">
          Interactive demo
        </span>
        <h2 className="mt-3 text-xl font-semibold tracking-tight text-white sm:text-2xl">
          See how a PhotoBrief comes together.
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-sm text-white/45">
          {PHASE_HINTS[phase]}
        </p>
        {/* Play / mute controls */}
        <div className="mt-4 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={togglePlay}
            className="group flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-5 py-2 text-xs font-semibold text-white/70 transition hover:border-[hsl(var(--pb-violet)/0.4)] hover:bg-[hsl(var(--pb-violet)/0.1)] hover:text-white"
          >
            {isPlaying ? (
              <><Pause className="h-3.5 w-3.5" /> Pause narration</>
            ) : (
              <><Play className="h-3.5 w-3.5" /> Watch with narration</>
            )}
          </button>
          {isPlaying && (
            <button
              type="button"
              onClick={toggleMute}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-white/50 transition hover:text-white"
            >
              {isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
            </button>
          )}
        </div>
      </div>

      {/* Dual phone layout */}
      <div className="flex flex-col items-center justify-center gap-6 lg:flex-row lg:items-start lg:gap-4">
        {/* Business phone */}
        <PhoneMockup label="Your phone" sublabel="business side" variant="dark">
          {businessContent}
        </PhoneMockup>

        {/* Connection */}
        <ConnectionLine />

        {/* Mobile separator */}
        <div className="flex items-center gap-3 lg:hidden">
          <div className="h-px w-12 bg-white/10" />
          <div className="flex h-7 w-7 items-center justify-center rounded-full border border-[hsl(var(--pb-violet)/0.3)] bg-[hsl(var(--pb-violet)/0.1)]">
            <ArrowRight className="h-3 w-3 rotate-90 text-[hsl(var(--pb-lavender))]" />
          </div>
          <div className="h-px w-12 bg-white/10" />
        </div>

        {/* Customer phone */}
        <PhoneMockup label="Customer" sublabel="their phone" variant="light">
          {customerContent}
        </PhoneMockup>
      </div>

      {/* Lead capture below phones — only after complete */}
      {phase === "COMPLETE" && (
        <div className="mx-auto mt-8 max-w-md">
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 backdrop-blur-sm">
            <form onSubmit={submitLead}>
              <p className="text-center text-sm font-semibold text-white/80">
                {hasFlag
                  ? "Brief complete — appliance needs review."
                  : "Brief is quote-ready."}
              </p>
              <p className="mt-1 text-center text-xs text-white/40">
                Send yourself the real PhotoBrief link.
              </p>
              <div className="mt-4 flex gap-2">
                <label className="sr-only" htmlFor="pb-live-email">
                  Email address
                </label>
                <input
                  id="pb-live-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  type="email"
                  autoComplete="email"
                  className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm text-white placeholder:text-white/25 focus:border-[hsl(var(--pb-violet)/0.5)] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--pb-violet)/0.3)]"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="shrink-0 rounded-xl bg-[hsl(var(--pb-violet))] px-5 py-2.5 text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-50"
                >
                  {submitting ? "…" : "Send"}
                </button>
              </div>
              <p className="mt-2 text-center text-[10px] text-white/25">
                No spam. This creates a real draft PhotoBrief request.
              </p>
              {error && (
                <p className="mt-2 text-center text-xs font-bold text-red-400">
                  {error}
                </p>
              )}
            </form>
            {requestUrl && (
              <div className="mt-3 text-center">
                <p className="text-xs font-bold text-emerald-400">
                  PhotoBrief created.
                </p>
                <a
                  href={requestUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-block text-xs font-semibold text-[hsl(var(--pb-lavender))] underline underline-offset-2"
                >
                  Open your request →
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
