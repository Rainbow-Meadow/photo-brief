import { FormEvent, useState } from "react";
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
} from "lucide-react";
import leaningOakWide from "@/assets/tree-care/leaning-oak-wide.jpg";
import oakTrunkCloseup from "@/assets/tree-care/oak-trunk-closeup.jpg";
import houseElevation from "@/assets/tree-care/house-elevation.jpg";
import drivewayAccess from "@/assets/tree-care/driveway-access.jpg";

const SESSION_KEY = "pb-session";

/** Index of the photo that will be "blurry" on first capture */
const BLURRY_INDEX = 1;

/* ── Fake brand ── */
const BRAND = {
  name: "Cedar & Sons Tree Care",
  short: "Cedar & Sons",
  tagline: "Tree care done right.",
  color: "#15803d",        // green-700
  colorLight: "#dcfce7",   // green-100
  colorMid: "#86efac",     // green-300
  colorRing: "rgba(21,128,61,0.25)",
};

const photos = [
  {
    id: "leaning-oak",
    src: leaningOakWide,
    label: "Wide shot",
    prompt: "Stand back and capture the whole tree with the house",
    status: "Verified",
    note: "Lean angle and house context visible",
    good: true,
  },
  {
    id: "trunk",
    src: oakTrunkCloseup,
    label: "Trunk base",
    prompt: "Get a closeup of the trunk base and any exposed roots",
    status: "Verified",
    note: "Trunk diameter and root flare visible",
    good: true,
  },
  {
    id: "house",
    src: houseElevation,
    label: "Over the roof",
    prompt: "Show branches that hang over the roofline",
    status: "Needs review",
    note: "Branches close to roof — confirm clearance",
    good: false,
  },
  {
    id: "access",
    src: drivewayAccess,
    label: "Access",
    prompt: "Show the driveway so we can bring the truck and chipper",
    status: "Verified",
    note: "Ground-level driveway access shown",
    good: true,
  },
];

/** Customer answers (used in questions + final brief) */
const CUSTOMER_ANSWERS = [
  { q: "What's the issue?", a: "Leaning oak after storm" },
  { q: "Tree height (approx)?", a: "40–50 ft" },
  { q: "Stump grinding needed?", a: "Yes" },
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
const AMBER = "#F2A33A";
const CREAM = "#F4F1EA";
const INK = "#0E0E0C";

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
  const bg = variant === "dark" ? "bg-[#0E0E0C]" : "bg-[#F4F1EA]";
  const statusColor = variant === "dark" ? "text-[#F4F1EA]/40" : "text-[#0E0E0C]/40";
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="text-center font-mono">
        <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-foreground/55">
          {label}
        </span>
        {sublabel && (
          <span className="ml-2 text-[10px] uppercase tracking-[0.22em] text-foreground/35">// {sublabel}</span>
        )}
      </div>
      <div aria-hidden="true" className="relative w-[260px] rounded-[2.25rem] border border-foreground/15 bg-[#0E0E0C] p-[3px] sm:w-[280px] sm:rounded-[2.5rem]">
        {/* Notch */}
        <div className="absolute left-1/2 top-[10px] z-20 h-[22px] w-[90px] -translate-x-1/2 rounded-full bg-black" />
        <div
          className={`relative overflow-hidden rounded-[2.1rem] ${bg}`}
          style={{ height: PHONE_CONTENT_H + 52 }}
        >
          {/* Status bar */}
          <div
            className={`flex items-center justify-between px-6 pb-1 pt-[38px] font-mono text-[10px] font-semibold ${statusColor}`}
          >
            <span>09:41</span>
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
        <div className="h-20 w-px bg-foreground/20" />
        <div className="flex h-8 w-8 items-center justify-center rounded-none border border-[#F2A33A]">
          <ArrowRight className="h-3.5 w-3.5 text-[#F2A33A]" />
        </div>
        <span className="font-mono text-[9px] font-bold uppercase tracking-[0.32em] text-foreground/55">
          LIVE&nbsp;SYNC
        </span>
        <div className="h-20 w-px bg-foreground/20" />
      </div>
    </div>
  );
}

/* ── Powered by PhotoBrief mini-badge (for customer screens — cream paper) ── */
function MiniPoweredBy() {
  return (
    <p className="mt-3 flex items-center justify-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.28em] text-black/40">
      <Camera className="h-2.5 w-2.5" />
      Powered by PhotoBrief
    </p>
  );
}

/* ── Cedar & Sons brand header (for customer screens) ── */
function ClearPathHeader({ compact }: { compact?: boolean }) {
  return (
    <div className={`flex items-center gap-2 ${compact ? "" : "mb-3"}`}>
      <div
        className="flex h-8 w-8 items-center justify-center rounded-lg"
        style={{ backgroundColor: BRAND.colorLight }}
      >
        <TreePine className="h-4 w-4" style={{ color: BRAND.color }} />
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
    <div className="flex min-h-[420px] flex-col text-[#F4F1EA]">
      {/* ClearPath dashboard header */}
      <div className="mb-4 mt-1">
        <div className="flex items-center gap-2">
          <div
            className="flex h-9 w-9 items-center justify-center border border-[#F4F1EA]/15"
            style={{ backgroundColor: "rgba(21,128,61,0.16)" }}
          >
            <TreePine className="h-4 w-4" style={{ color: BRAND.colorMid }} />
          </div>
          <div>
            <p className="text-[13px] font-bold text-[#F4F1EA]/85">{BRAND.short}</p>
            <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#F4F1EA]/35">{BRAND.tagline}</p>
          </div>
        </div>
      </div>

      {/* Requests section */}
      <div className="border border-[#F4F1EA]/10 p-3">
        <p className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-[#F4F1EA]/45">
          <LayoutList className="h-3 w-3" /> Recent requests
        </p>

        {!showNotif ? (
          <div className="mt-4 flex flex-col items-center py-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center border border-[#F4F1EA]/15">
              <ClipboardList className="h-5 w-5 text-[#F4F1EA]/25" />
            </div>
            <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[#F4F1EA]/35">No new requests</p>
            <p className="mt-0.5 text-[9px] text-[#F4F1EA]/25">
              Requests from your website will appear here
            </p>
          </div>
        ) : (
          <div className="mt-2 space-y-2">
            {/* New lead notification */}
            <div className="border border-[#F4F1EA]/15 p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Bell className="h-3.5 w-3.5 text-[#F4F1EA]/55" />
                    <span className="absolute -right-0.5 -top-0.5 h-2 w-2 bg-[#F2A33A]" />
                  </div>
                  <span className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-[#F4F1EA]/75">
                    New lead
                  </span>
                </div>
                <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#F4F1EA]/35">Just now</span>
              </div>
              <div className="mt-2 space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] text-[#F4F1EA]/55">
                  <User className="h-2.5 w-2.5" /> Jamie Smith
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-[#F4F1EA]/55">
                  <TreePine className="h-2.5 w-2.5" /> Leaning oak — 23 Maple St
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-[#F4F1EA]/55">
                  <Globe className="h-2.5 w-2.5" /> Website intake
                </div>
              </div>

              {/* Progress indicator */}
              {showProgress && (
                <div className="mt-3 flex items-center gap-2 border border-[#F2A33A]/40 px-2.5 py-2">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping bg-[#F2A33A] opacity-75" />
                    <span className="relative inline-flex h-2 w-2 bg-[#F2A33A]" />
                  </span>
                  <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#F2A33A]">
                    {phase === "QUESTIONS"
                      ? "Answering questions…"
                      : phase === "CUSTOMER_REVIEW"
                        ? "Reviewing photos…"
                        : `Capturing… ${capturedCount}/${photos.length}`}
                  </span>
                </div>
              )}

              {phase === "ROUTING" && (
                <div className="mt-3 flex items-center gap-2 border border-[#F4F1EA]/15 px-2.5 py-2">
                  <Loader2 className="h-3 w-3 animate-spin text-[#F4F1EA]/55" />
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#F4F1EA]/55">
                    Routing to template…
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* No action needed hint */}
      <div className="mt-3 border border-[#F4F1EA]/10 p-3 text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#F4F1EA]/35">
          {showNotif
            ? "No action needed — customer is completing their brief"
            : "Website intake live · awaiting leads"}
        </p>
      </div>

      {/* Website intake status */}
      <div className="mt-3 flex items-center justify-between border border-[#F4F1EA]/10 px-3 py-2.5">
        <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[#F4F1EA]/55">
          <Globe className="h-3 w-3" /> Website intake
        </span>
        <span className="flex items-center gap-1 border border-[#F2A33A]/50 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.22em] text-[#F2A33A]">
          <span className="h-1.5 w-1.5 bg-[#F2A33A]" />
          Active
        </span>
      </div>
    </div>
  );
}

/** Business phone — completed brief (phase COMPLETE) */
function BriefCompleteScreen() {
  return (
    <div className="text-[#F4F1EA]">
      <div className="mb-3 mt-1 flex items-center justify-between">
        <div>
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-[#F4F1EA]/45">
            {BRAND.short}
          </span>
          <h3 className="mt-0.5 text-[15px] font-bold tracking-tight text-[#F4F1EA]/90">
            Brief complete
          </h3>
        </div>
        <span className="border border-[#F2A33A]/60 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-[#F2A33A]">
          Ready
        </span>
      </div>

      {/* Customer info */}
      <div className="mb-2 border border-[#F4F1EA]/10 p-2.5">
        <div className="flex items-center gap-2">
          <User className="h-3 w-3 text-[#F4F1EA]/45" />
          <span className="text-[11px] font-semibold text-[#F4F1EA]/70">Jamie Smith · 23 Maple St</span>
          <span className="ml-auto font-mono text-[9px] uppercase tracking-[0.2em] text-[#F4F1EA]/35">via website</span>
        </div>
      </div>

      {/* Customer answers */}
      <div className="mb-2 border border-[#F4F1EA]/10 p-3">
        <p className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-[#F4F1EA]/45">
          <MessageSquareText className="h-3 w-3" /> Answers
        </p>
        <div className="mt-2 space-y-1.5">
          {CUSTOMER_ANSWERS.map((qa) => (
            <div key={qa.q} className="flex items-start justify-between gap-2 border border-[#F4F1EA]/8 px-2.5 py-1.5">
              <span className="text-[10px] text-[#F4F1EA]/45">{qa.q}</span>
              <span className="text-[10px] font-semibold text-[#F4F1EA]/75 text-right shrink-0">{qa.a}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Photo grid */}
      <div className="grid grid-cols-2 gap-1.5">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="relative overflow-hidden border border-[#F4F1EA]/15"
          >
            <img
              src={photo.src}
              alt={photo.label}
              className="h-[60px] w-full object-cover"
              width={300} height={300} loading="lazy" sizes="150px"
            />
            <div className="flex items-center justify-between bg-black/55 px-2 py-1">
              <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-[#F4F1EA]/75">
                {photo.label}
              </span>
              <span className="font-mono text-[9px] font-bold uppercase tracking-[0.22em] text-[#F4F1EA]/70">
                OK
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* AI Summary */}
      <div className="mt-2 border border-[#F4F1EA]/10 p-3">
        <p className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-[#F4F1EA]/45">
          <ScanLine className="h-3 w-3" /> AI summary
        </p>
        <p className="mt-2 text-[11px] leading-[1.6] text-[#F4F1EA]/65">
          Leaning oak at 23 Maple St — removal + stump grind. ~40 ft, ground-level driveway access. All photos verified. Confirm proximity to roofline before crew dispatch.
        </p>
      </div>

      {/* Suggested quote */}
      <div className="mt-2 border border-[#F4F1EA]/10 p-3">
        <p className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-[#F4F1EA]/45">
          <ClipboardList className="h-3 w-3" /> Suggested quote
        </p>
        <div className="mt-2 space-y-1">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-[#F4F1EA]/60">Tree removal</span>
            <span className="font-semibold text-[#F4F1EA]/85">$1,450</span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-[#F4F1EA]/60">Stump grinding</span>
            <span className="font-semibold text-[#F4F1EA]/85">$390</span>
          </div>
          <div className="mt-1 flex items-center justify-between border-t border-[#F4F1EA]/10 pt-1.5 text-[11px]">
            <span className="font-mono uppercase tracking-[0.18em] text-[#F2A33A]">Total</span>
            <span className="font-bold text-[#F2A33A]">$1,840</span>
          </div>
        </div>
        <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.2em] text-[#F4F1EA]/40">
          Available Thursday 8am
        </p>
      </div>

      <button
        type="button"
        className="mt-2 flex w-full items-center justify-center gap-2 border border-[#F2A33A] bg-[#F2A33A] px-4 py-2.5 font-mono text-[11px] font-bold uppercase tracking-[0.24em] text-[#0E0E0C]"
        disabled
      >
        <CheckCircle2 className="h-3.5 w-3.5" /> Send quote
      </button>
    </div>
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
        <div className="flex items-center gap-2 border border-black/15 px-3 py-2.5">
          <User className="h-3.5 w-3.5 shrink-0 text-black/25" />
          <span className="text-[12px] text-black/55">Sarah Johnson</span>
        </div>
        <div className="flex items-center gap-2 border border-black/15 px-3 py-2.5">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-black/25" />
          <span className="text-[12px] text-black/55">742 Evergreen Terrace</span>
        </div>
        <div className="flex items-center justify-between border border-black/15 px-3 py-2.5">
          <span className="flex items-center gap-2 text-[12px] text-black/55">
            <Package className="h-3.5 w-3.5 shrink-0 text-black/25" />
            Garage cleanout
          </span>
          <ChevronRight className="h-3.5 w-3.5 text-black/20" />
        </div>
        <div className="border border-black/15 px-3 py-2.5">
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
        <div className="mt-5 flex items-center gap-2 rounded-full border border-black/15 px-3 py-1.5">
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
                    : "border border-black/15 text-black/55"
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
                  : "border border-black/15 text-black/55"
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
                  : "border border-black/15 text-black/55"
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
      <div className="relative overflow-hidden border border-black/15">
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
                <CheckCircle2 className="h-6 w-6 text-[#0d9488]" />
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
        <div className="mt-3 border border-black/15 p-3">
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
                : "border border-black/15"
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
                <span className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#0d9488]">
                  <CheckCircle2 className="h-2.5 w-2.5 text-white" />
                </span>
              </>
            ) : (
              <div className="flex h-full w-full items-center justify-center border border-black/10">
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
          <span className="rounded-full border border-[#0d9488]/40 px-2 py-0.5 text-[10px] font-bold text-[#0d9488]">
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
      <div className="mb-2 border border-black/15 p-2.5">
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
          <div key={p.id} className="overflow-hidden rounded-xl border border-black/15">
            <img
              src={p.src}
              alt={p.label}
              className="h-[72px] w-full object-cover"
              width={300} height={300} loading="lazy" sizes="150px"
            />
            <div className="flex items-center justify-between px-2 py-1.5 border-t border-black/10">
              <span className="text-[10px] font-semibold text-black/50">{p.label}</span>
              <span className="flex items-center gap-0.5 text-[9px] font-bold text-[#0d9488]">
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
      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#0d9488]/40">
        <CheckCircle2 className="h-8 w-8 text-[#0d9488]" />
      </div>
      <h3 className="mt-4 text-[16px] font-bold tracking-tight text-black/85">
        Photos sent!
      </h3>
      <p className="mt-2 text-[12px] leading-[1.6] text-black/45 px-4">
        {BRAND.name} has your photos and will follow up with a quote.
      </p>
      <div className="mt-5 border border-black/15 px-4 py-3">
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
export function InteractiveHeroBriefAssembly() {
  const [phase, setPhase] = useState<Phase>("CUSTOMER_REQUEST");
  const [currentStep, setCurrentStep] = useState(0);
  const [captured, setCaptured] = useState<Set<number>>(() => new Set());
  const [blurryPending, setBlurryPending] = useState(true);
  const [email, setEmail] = useState("");
  const [requestUrl, setRequestUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    // Lead capture backend was retired; the hero now runs as a pure
    // demo. Acknowledge the email locally and clear the form.
    try {
      void getSessionId();
      setRequestUrl(null);
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
        <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-foreground/40">
          PLT.D.01 / FIELD-MANUAL
        </p>
        <span className="mt-2 inline-block border border-[#F2A33A]/60 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-[#F2A33A]">
          Interactive demo
        </span>
        <h2 className="mt-3 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          See how a PhotoBrief comes together.
        </h2>
        <p className="mx-auto mt-2 max-w-lg font-mono text-[11px] uppercase tracking-[0.18em] text-foreground/55">
          {PHASE_HINTS[phase]}
        </p>
      </div>

      {/* Dual phone layout */}
      <div className="flex flex-col-reverse items-center justify-center gap-6 lg:flex-row lg:items-start lg:gap-4">
        {/* Business phone */}
        <PhoneMockup label="Your phone" sublabel="business side" variant="dark">
          {businessContent}
        </PhoneMockup>

        {/* Connection */}
        <ConnectionLine />

        {/* Mobile separator */}
        <div className="flex items-center gap-3 lg:hidden">
          <div className="h-px w-12 bg-foreground/20" />
          <div className="flex h-7 w-7 items-center justify-center border border-[#F2A33A]">
            <ArrowRight className="h-3 w-3 rotate-90 text-[#F2A33A]" />
          </div>
          <div className="h-px w-12 bg-foreground/20" />
        </div>

        {/* Customer phone */}
        <PhoneMockup label="Customer" sublabel="their phone" variant="light">
          {customerContent}
        </PhoneMockup>
      </div>

      {/* Lead capture below phones — only after complete */}
      {phase === "COMPLETE" && (
        <div className="mx-auto mt-8 max-w-md">
          <div className="border border-foreground/15 p-5">
            <form onSubmit={submitLead}>
              <p className="text-center font-mono text-[11px] font-bold uppercase tracking-[0.24em] text-foreground/80">
                {hasFlag
                  ? "Brief complete — appliance needs review"
                  : "Brief is quote-ready"}
              </p>
              <p className="mt-1 text-center text-xs text-foreground/45">
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
                  className="min-w-0 flex-1 border border-foreground/15 bg-transparent px-4 py-2.5 text-sm text-foreground placeholder:text-foreground/30 focus:border-[#F2A33A] focus:outline-none focus:ring-1 focus:ring-[#F2A33A]/40"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="shrink-0 border border-[#F2A33A] bg-[#F2A33A] px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-[0.24em] text-[#0E0E0C] disabled:opacity-50"
                >
                  {submitting ? "…" : "Send"}
                </button>
              </div>
              <p className="mt-2 text-center font-mono text-[9px] uppercase tracking-[0.22em] text-foreground/30">
                No spam · creates a real draft PhotoBrief request
              </p>
              {error && (
                <p className="mt-2 text-center text-xs font-bold text-red-400">
                  {error}
                </p>
              )}
            </form>
            {requestUrl && (
              <div className="mt-3 text-center">
                <p className="font-mono text-xs font-bold uppercase tracking-[0.24em] text-[#F2A33A]">
                  PhotoBrief created
                </p>
                <a
                  href={requestUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-block text-xs font-semibold text-[#F2A33A] underline underline-offset-2"
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
