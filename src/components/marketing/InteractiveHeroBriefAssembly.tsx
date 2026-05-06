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
  MessageSquare,
  AlertTriangle,
} from "lucide-react";
import wideGarage from "@/assets/junk-removal/wide-garage.jpg";
import pileCloseup from "@/assets/junk-removal/pile-closeup.jpg";
import appliances from "@/assets/junk-removal/appliances.jpg";
import drivewayAccess from "@/assets/junk-removal/driveway-access.jpg";

const API_URL =
  "https://mvlcefiygkzzewcdzsmj.functions.supabase.co/live-preview-submission";
const SESSION_KEY = "pb-session";

/** Index of the photo that will be "blurry" on first capture */
const BLURRY_INDEX = 1;

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

/* ── Phone bezel ── */
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
      <div className="relative w-[260px] rounded-[2.25rem] border-[3px] border-white/[0.08] bg-[#1a1a1f] p-[3px] shadow-[0_8px_40px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.04)] sm:w-[280px] sm:rounded-[2.5rem]">
        <div className="absolute left-1/2 top-[10px] z-20 h-[22px] w-[90px] -translate-x-1/2 rounded-full bg-black" />
        <div
          className={`relative overflow-hidden rounded-[2.25rem] ${bg}`}
          style={{ minHeight: 520 }}
        >
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
          <div className="px-4 pb-6">{children}</div>
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

/* ── Customer Phone Screen ── */
function CustomerScreen({
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
          <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-black/35">
            PhotoBrief
          </span>
          <span className="rounded-full bg-[hsl(var(--pb-violet)/0.12)] px-2 py-0.5 text-[10px] font-bold text-[hsl(var(--pb-violet))]">
            {capturedCount}/{photos.length}
          </span>
        </div>
        <h3 className="mt-1 text-[15px] font-bold tracking-tight text-black/85">
          Garage cleanout quote
        </h3>
      </div>

      {/* Progress dots */}
      <div className="mb-3 flex items-center gap-1.5">
        {photos.map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              captured.has(i)
                ? "bg-[hsl(var(--pb-violet))]"
                : i === currentStep
                  ? "bg-[hsl(var(--pb-violet)/0.35)]"
                  : "bg-black/[0.06]"
            }`}
          />
        ))}
      </div>

      {/* Photo viewfinder */}
      <div className="relative overflow-hidden rounded-2xl bg-black/[0.03]">
        {isBlurryShot ? (
          /* Blurry first-attempt state */
          <div className="relative">
            <img
              src={photo.src}
              alt={photo.label}
              className="h-[200px] w-full object-cover blur-[3px]"
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

      {/* Normal prompt (hidden when blurry feedback is showing) */}
      {!isBlurryShot && (
        <div className="mt-3 rounded-xl bg-black/[0.04] p-3">
          <p className="flex items-center gap-2 text-[13px] font-semibold text-black/70">
            <Camera className="h-3.5 w-3.5 shrink-0 text-[hsl(var(--pb-violet))]" />
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
          isBlurryShot
            ? "bg-amber-500"
            : "bg-[hsl(var(--pb-violet))]"
        }`}
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
                ? "ring-2 ring-[hsl(var(--pb-violet))]"
                : "ring-1 ring-black/[0.06]"
            }`}
          >
            {i === BLURRY_INDEX && blurryPending && captured.has(i) ? (
              /* Blurry thumbnail */
              <>
                <img
                  src={p.src}
                  alt={p.label}
                  className="h-full w-full object-cover blur-[2px]"
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

/* ── Business Phone: Link Sent State ── */
function LinkSentScreen() {
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center">
      {/* Header */}
      <div className="mb-6 text-center">
        <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/35">
          Dashboard
        </span>
      </div>

      {/* Sent confirmation card */}
      <div className="w-full rounded-2xl bg-white/[0.04] p-5">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15">
            <Send className="h-6 w-6 text-emerald-400" />
          </div>
          <h3 className="mt-3 text-[15px] font-bold text-white/90">
            Request sent
          </h3>
          <p className="mt-1 text-[12px] text-white/45">
            Garage cleanout quote
          </p>
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between rounded-lg bg-white/[0.03] px-3 py-2">
            <span className="flex items-center gap-2 text-[11px] text-white/50">
              <MessageSquare className="h-3 w-3" /> Sent via
            </span>
            <span className="text-[11px] font-semibold text-white/70">SMS</span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-white/[0.03] px-3 py-2">
            <span className="flex items-center gap-2 text-[11px] text-white/50">
              <Clock className="h-3 w-3" /> Sent
            </span>
            <span className="text-[11px] font-semibold text-white/70">Just now</span>
          </div>
        </div>

        {/* Waiting indicator */}
        <div className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-white/[0.03] py-3">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-400" />
          </span>
          <span className="text-[11px] font-semibold text-amber-400/80">
            Waiting for customer…
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── Business Phone: Brief Complete State ── */
function BriefCompleteScreen() {
  return (
    <>
      <div className="mb-3 mt-1 flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/35">
            Dashboard
          </span>
          <h3 className="mt-0.5 text-[15px] font-bold tracking-tight text-white/90">
            Brief complete
          </h3>
        </div>
        <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
          Ready
        </span>
      </div>

      {/* All photos grid with green badges */}
      <div className="grid grid-cols-2 gap-1.5">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="relative overflow-hidden rounded-xl ring-1 ring-white/[0.08]"
          >
            <img
              src={photo.src}
              alt={photo.label}
              className="h-[72px] w-full object-cover"
            />
            <div className="flex items-center justify-between bg-black/50 px-2 py-1.5">
              <span className="text-[10px] font-semibold text-white/70">
                {photo.label}
              </span>
              <span className="flex items-center gap-0.5 text-[9px] font-bold text-emerald-400">
                <ShieldCheck className="h-2.5 w-2.5" />
                {photo.good ? "OK" : "OK"}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* AI check — all passed */}
      <div className="mt-3 rounded-xl bg-white/[0.04] p-3">
        <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white/35">
          <ScanLine className="h-3 w-3" /> AI check
        </p>
        <div className="mt-2 space-y-1.5">
          {photos.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between rounded-lg bg-white/[0.03] px-2.5 py-1.5"
            >
              <span className="text-[11px] text-white/60">{p.label}</span>
              <span className="text-[10px] font-bold text-emerald-400">
                Verified
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="mt-3 rounded-xl bg-white/[0.04] p-3">
        <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white/35">
          <ClipboardList className="h-3 w-3" /> Brief summary
        </p>
        <p className="mt-2 text-[12px] leading-[1.6] text-white/60">
          Garage cleanout — all shots verified. Ground-level access. Ready to quote.
        </p>
      </div>

      {/* Decorative CTA */}
      <button
        type="button"
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500/20 px-4 py-3 text-[13px] font-bold text-emerald-400 transition-all"
        disabled
      >
        <CheckCircle2 className="h-4 w-4" /> Quote now
      </button>
    </>
  );
}

/* ── Business Phone: In-Progress Screen ── */
function BusinessInProgressScreen({
  captured,
  blurryPending,
}: {
  captured: Set<number>;
  blurryPending: boolean;
}) {
  const capturedCount = captured.size;

  return (
    <>
      <div className="mb-3 mt-1 flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/35">
            Dashboard
          </span>
          <h3 className="mt-0.5 text-[15px] font-bold tracking-tight text-white/90">
            Incoming brief
          </h3>
        </div>
        <span className="rounded-full bg-white/[0.06] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white/40">
          {capturedCount}/4
        </span>
      </div>

      {/* Photo grid */}
      <div className="grid grid-cols-2 gap-1.5">
        {photos.map((photo, i) => {
          const isCaptured = captured.has(i);
          const isBlurry = i === BLURRY_INDEX && blurryPending && isCaptured;
          return (
            <div
              key={photo.id}
              className={`relative overflow-hidden rounded-xl transition-all duration-500 ${
                isCaptured
                  ? "ring-1 ring-white/[0.08]"
                  : "ring-1 ring-white/[0.04]"
              }`}
            >
              {isCaptured ? (
                <>
                  <img
                    src={photo.src}
                    alt={photo.label}
                    className={`h-[72px] w-full object-cover ${isBlurry ? "blur-[2px]" : ""}`}
                  />
                  <div className="flex items-center justify-between bg-black/50 px-2 py-1.5">
                    <span className="text-[10px] font-semibold text-white/70">
                      {photo.label}
                    </span>
                    <span
                      className={`flex items-center gap-0.5 text-[9px] font-bold ${
                        isBlurry
                          ? "text-amber-400"
                          : photo.good
                            ? "text-emerald-400"
                            : "text-amber-400"
                      }`}
                    >
                      {isBlurry ? (
                        <>
                          <AlertTriangle className="h-2.5 w-2.5" />
                          Blurry
                        </>
                      ) : photo.good ? (
                        <>
                          <ShieldCheck className="h-2.5 w-2.5" />
                          OK
                        </>
                      ) : (
                        <>
                          <ScanLine className="h-2.5 w-2.5" />
                          Flag
                        </>
                      )}
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex h-[96px] flex-col items-center justify-center bg-white/[0.02]">
                  <div className="h-5 w-5 rounded-full border border-dashed border-white/10" />
                  <span className="mt-1 text-[9px] text-white/20">
                    Waiting…
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* AI check results */}
      {capturedCount > 0 && (
        <div className="mt-3 rounded-xl bg-white/[0.04] p-3">
          <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white/35">
            <ScanLine className="h-3 w-3" /> AI check
          </p>
          <div className="mt-2 space-y-1.5">
            {[...captured]
              .sort((a, b) => a - b)
              .map((i) => {
                const p = photos[i];
                const isBlurry = i === BLURRY_INDEX && blurryPending;
                return (
                  <div
                    key={p.id}
                    className="flex items-center justify-between rounded-lg bg-white/[0.03] px-2.5 py-1.5"
                  >
                    <span className="text-[11px] text-white/60">{p.label}</span>
                    <span
                      className={`text-[10px] font-bold ${
                        isBlurry
                          ? "text-amber-400"
                          : p.good
                            ? "text-emerald-400"
                            : "text-amber-400"
                      }`}
                    >
                      {isBlurry ? "Blurry — retake" : p.status}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Brief summary */}
      <div className="mt-3 rounded-xl bg-white/[0.04] p-3">
        <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white/35">
          <ClipboardList className="h-3 w-3" /> Brief summary
        </p>
        <p className="mt-2 text-[12px] italic text-white/25">
          Waiting for {photos.length - capturedCount} more photo
          {photos.length - capturedCount !== 1 ? "s" : ""}…
        </p>
      </div>
    </>
  );
}

/* ── Main component ── */
export function InteractiveHeroBriefAssembly() {
  const [currentStep, setCurrentStep] = useState(0);
  const [captured, setCaptured] = useState<Set<number>>(() => new Set());
  const [blurryPending, setBlurryPending] = useState(true);
  const [email, setEmail] = useState("");
  const [requestUrl, setRequestUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allCaptured = captured.size === photos.length;
  const ready = allCaptured && !blurryPending;
  const hasFlag = [...captured].some((i) => !photos[i].good);

  function handleCapture() {
    const next = new Set(captured);

    // If blurry photo is showing and user taps retake
    if (currentStep === BLURRY_INDEX && blurryPending && next.has(currentStep)) {
      setBlurryPending(false);
      // Move to next step
      if (currentStep < photos.length - 1) {
        setCurrentStep(currentStep + 1);
      }
      return;
    }

    if (!next.has(currentStep)) {
      next.add(currentStep);
      setCaptured(next);
      // For the blurry photo, don't auto-advance — stay to show retake prompt
      if (currentStep === BLURRY_INDEX && blurryPending) {
        return;
      }
    } else if (currentStep < photos.length - 1) {
      setCurrentStep(currentStep + 1);
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
    if (!ready) {
      setError("Capture all four shots first.");
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

  // Determine which business screen to show
  const businessPhoneContent =
    captured.size === 0 ? (
      <LinkSentScreen />
    ) : ready ? (
      <BriefCompleteScreen />
    ) : (
      <BusinessInProgressScreen captured={captured} blurryPending={blurryPending} />
    );

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
          Tap through the customer phone to capture photos — watch the business
          dashboard update in real time.
        </p>
      </div>

      {/* Dual phone layout */}
      <div className="flex flex-col items-center justify-center gap-6 lg:flex-row lg:items-start lg:gap-4">
        {/* Customer phone */}
        <PhoneMockup label="Customer" sublabel="their phone" variant="light">
          <CustomerScreen
            currentStep={currentStep}
            captured={captured}
            blurryPending={blurryPending}
            onCapture={handleCapture}
          />
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

        {/* Business phone */}
        <PhoneMockup label="Your dashboard" sublabel="real-time" variant="dark">
          {businessPhoneContent}
        </PhoneMockup>
      </div>

      {/* Lead capture below phones */}
      {ready && (
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
