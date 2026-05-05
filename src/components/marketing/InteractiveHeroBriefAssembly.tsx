import { FormEvent, KeyboardEvent, useMemo, useState } from "react";
import { ScanLine } from "lucide-react";
import wideGarage from "@/assets/junk-removal/wide-garage.jpg";
import pileCloseup from "@/assets/junk-removal/pile-closeup.jpg";
import appliances from "@/assets/junk-removal/appliances.jpg";
import drivewayAccess from "@/assets/junk-removal/driveway-access.jpg";

const API_URL = "https://mvlcefiygkzzewcdzsmj.functions.supabase.co/live-preview-submission";
const SESSION_KEY = "pb-session";

type Mode = "capture" | "check" | "brief";
type Readiness = "incomplete" | "ready";

const photos = [
  { id: "wide-area", src: wideGarage, label: "Wide area", status: "Verified", note: "Room context captured", good: true },
  { id: "main-pile", src: pileCloseup, label: "Main pile", status: "Verified", note: "Amount and scale visible", good: true },
  { id: "appliance", src: appliances, label: "Appliance", status: "Needs review", note: "Appliance handling likely needed", good: false },
  { id: "access", src: drivewayAccess, label: "Access", status: "Verified", note: "Ground-level access shown", good: true },
];

function getSessionId() {
  if (typeof window === "undefined") return "server";
  const existing = window.localStorage.getItem(SESSION_KEY);
  if (existing) return existing;
  const next = window.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  window.localStorage.setItem(SESSION_KEY, next);
  return next;
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function BriefMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-black/[0.055] p-3">
      <span className="block text-[10px] font-black uppercase tracking-[0.16em] text-black/38">{label}</span>
      <span className="mt-1 block font-black text-black/78">{value}</span>
    </div>
  );
}

export function InteractiveHeroBriefAssembly() {
  const [mode, setMode] = useState<Mode>("capture");
  const [selected, setSelected] = useState<Set<number>>(() => new Set([0, 1]));
  const [email, setEmail] = useState("");
  const [requestUrl, setRequestUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedPhotos = useMemo(() => [...selected].sort((a, b) => a - b).map((index) => photos[index]), [selected]);
  const hasFlag = selectedPhotos.some((photo) => !photo.good);
  const readiness: Readiness = selected.size === photos.length ? "ready" : "incomplete";
  const summary = readiness === "ready"
    ? hasFlag
      ? "Brief complete with appliance review needed before quoting."
      : "Brief ready for quote review."
    : `Brief includes ${selectedPhotos.map((photo) => photo.label.toLowerCase()).join(", ") || "no photos yet"}. Add the remaining shots to make it quote-ready.`;
  const featured = selectedPhotos[selectedPhotos.length - 1] ?? photos[0];

  function togglePhoto(index: number) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(index) && next.size > 1) next.delete(index);
      else next.add(index);
      return next;
    });
    setRequestUrl(null);
    setError(null);
  }

  function onPhotoKeyDown(event: KeyboardEvent<HTMLElement>, index: number) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      togglePhoto(index);
    }
  }

  async function submitLead(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (!isValidEmail(email)) {
      setError("Enter a valid email to create the request.");
      return;
    }
    if (readiness !== "ready") {
      setError("Add all four shots first.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        session_id: getSessionId(),
        source: "photobrief-marketing-hero",
        workflow_mode: mode,
        brief: {
          selected_count: selected.size,
          required_count: photos.length,
          readiness,
          issue: hasFlag ? "Appliance review needed" : null,
          summary,
        },
        photos: selectedPhotos.map(({ id, label, status, note }) => ({ id, label, status, note })),
        missing: photos.filter((_, index) => !selected.has(index)).map(({ id, label }) => ({ id, label })),
        lead: { email: email.trim(), consented: true },
      };

      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || "Could not create request.");
      if (!data?.request_url) throw new Error("Request was saved, but no request link came back.");
      setRequestUrl(data.request_url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong creating the request.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={`pb-command-panel pb-focus-corners pb-scanlines pb-live-tool relative min-h-[560px] p-4 sm:p-6 lg:p-7 ${readiness === "ready" ? "is-complete" : ""} ${hasFlag ? "has-flag" : ""}`}>
      <div className="pb-tool-console relative z-10">
        <div className="pb-tool-tabs" role="group" aria-label="PhotoBrief live preview mode">
          {(["capture", "check", "brief"] as Mode[]).map((item) => (
            <button key={item} type="button" className={mode === item ? "is-active" : ""} onClick={() => setMode(item)}>
              {item[0].toUpperCase() + item.slice(1)}
            </button>
          ))}
        </div>
        <div className="pb-tool-status" aria-live="polite"><span>{readiness === "ready" ? (hasFlag ? "Review" : "Ready") : `${selected.size}/4`}</span> {readiness === "ready" ? "Live request can be created" : "Build the brief"}</div>
      </div>

      <div className="relative z-10 flex items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <p className="pb-eyebrow border-white/12 bg-white/[0.03]">Intake command view</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">Build a live PhotoBrief.</h2>
        </div>
        <div className="hidden rounded-full border border-[hsl(var(--pb-mint)/0.5)] px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-[hsl(var(--pb-mint))] sm:block">{readiness === "ready" ? "Ready" : `${selected.size}/4`}</div>
      </div>

      <div className="relative z-10 mt-6 grid gap-5 lg:grid-cols-[0.78fr_1fr]">
        <div className="rounded-[1.4rem] border border-white/12 bg-black/24 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-[0.16em] text-white/48">Customer phone</span>
            <span className="rounded-full bg-[hsl(var(--pb-violet)/0.18)] px-2.5 py-1 text-xs font-bold text-[hsl(var(--pb-lavender))]">{selected.size} / 4</span>
          </div>
          <div className="mt-4 overflow-hidden rounded-[1.25rem] border border-white/12 bg-[hsl(var(--pb-ink))]">
            <img src={featured.src} alt={`${featured.label} customer photo preview`} className="h-56 w-full object-cover" loading="eager" />
          </div>
          <div className={`mt-4 rounded-2xl border p-3 ${featured.good ? "border-[hsl(var(--pb-mint)/0.35)] bg-[hsl(var(--pb-mint)/0.07)]" : "border-[hsl(var(--pb-lavender)/0.42)] bg-[hsl(var(--pb-lavender)/0.08)]"}`}>
            <p className="flex items-center gap-2 text-sm font-bold text-white"><ScanLine className="h-4 w-4 text-[hsl(var(--pb-mint))]" /> {featured.label}</p>
            <p className="mt-1 text-sm text-white/58">{featured.note}</p>
            <p className="mt-3 inline-flex rounded-full bg-white/10 px-2.5 py-1 text-xs font-bold text-white/80">{featured.status}</p>
          </div>
        </div>

        <div className="relative">
          <div className="pb-route-line hidden lg:block" />
          <div className="grid grid-cols-2 gap-3">
            {photos.map((photo, index) => {
              const active = selected.has(index);
              return (
                <figure
                  key={photo.label}
                  role="button"
                  tabIndex={0}
                  aria-pressed={active}
                  onClick={() => togglePhoto(index)}
                  onKeyDown={(event) => onPhotoKeyDown(event, index)}
                  className={`pb-photo-frame relative cursor-pointer ${active ? "is-selected" : "is-dimmed"}`}
                  data-status={photo.good ? "ok" : "warn"}
                >
                  <img src={photo.src} alt={`${photo.label} submission example`} className="h-28 w-full object-cover sm:h-32" loading={index === 0 ? "eager" : "lazy"} />
                  <figcaption className="flex items-center justify-between gap-2 bg-black/58 px-3 py-2 text-xs font-semibold text-white/78">
                    <span>{photo.label}</span>
                    <span className={photo.good ? "text-[hsl(var(--pb-mint))]" : "text-[hsl(var(--pb-lavender))]"}>{active ? photo.status : "Tap to add"}</span>
                  </figcaption>
                </figure>
              );
            })}
          </div>

          <div className="pb-brief-paper mt-4 rounded-[1.4rem] p-4 sm:p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-black/44">Brief packet</p>
                <h3 className="mt-1 text-xl font-black tracking-tight">Garage cleanout quote</h3>
              </div>
              <span className="pb-stamp rounded-full px-3 py-1">{readiness === "ready" ? (hasFlag ? "Review" : "Quote-ready") : "In progress"}</span>
            </div>

            <div className="pb-live-brief-strip" aria-label="Selected photos in the live brief">
              {photos.map((photo, index) => {
                const active = selected.has(index);
                return (
                  <button key={photo.id} type="button" className={`pb-live-slot ${active ? "is-filled" : ""} ${active && !photo.good ? "needs-review" : ""}`} onClick={() => togglePhoto(index)}>
                    <span>{index + 1}</span>{active && <strong>{photo.label}</strong>}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 grid gap-2 text-sm text-black/68 sm:grid-cols-3">
              <BriefMetric label="Shots" value={`${selected.size}/4`} />
              <BriefMetric label="Issue" value={hasFlag ? "Review" : "None"} />
              <BriefMetric label="Access" value={selected.has(3) ? "Ground" : "Missing"} />
            </div>
            <p className="mt-4 rounded-2xl bg-black/[0.055] p-3 text-sm font-medium leading-6 text-black/72">{summary}</p>

            {readiness === "ready" && (
              <form onSubmit={submitLead} className="pb-lead-capture is-visible">
                <div>
                  <strong>Your brief is ready.</strong>
                  <p>Send yourself the real PhotoBrief link.</p>
                </div>
                <label className="sr-only" htmlFor="pb-live-email">Email address</label>
                <input id="pb-live-email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@company.com" type="email" autoComplete="email" />
                <button type="submit" disabled={submitting}>{submitting ? "Creating…" : "Send link"}</button>
                <p className="pb-lead-note">No spam. This creates a real draft PhotoBrief request.</p>
                {error && <p className="mt-2 text-xs font-bold text-red-700">{error}</p>}
              </form>
            )}

            {requestUrl && (
              <div className="pb-success is-visible">
                <p>PhotoBrief created.</p>
                <a href={requestUrl} target="_blank" rel="noreferrer">Open your request →</a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
