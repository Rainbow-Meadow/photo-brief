import { useEffect, useRef, useState } from "react";
import { Camera, ImagePlus, Loader2, FlaskConical } from "lucide-react";
import type { GuideStep } from "@/types/photobrief";
import { isE2EMode } from "@/lib/preview-host";

interface CaptureUploadCardProps {
  step: GuideStep;
  pending: boolean;
  onCapture: (previewUrl: string, file: File | null) => void;
  onSkip?: () => void;
  /** Zero-based index of this step within the guide. Used to pick a sample fixture in E2E mode. */
  stepIndex?: number;
}

const E2E_FIXTURES = [
  "/e2e/leaning-oak-wide.jpg",
  "/e2e/oak-trunk-closeup.jpg",
  "/e2e/house-elevation.jpg",
  "/e2e/driveway-access.jpg",
];

export function CaptureUploadCard({ step, pending, onCapture, onSkip, stepIndex = 0 }: CaptureUploadCardProps) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const uploadRef = useRef<HTMLInputElement>(null);
  const [e2eEnabled, setE2eEnabled] = useState(false);
  const [loadingSample, setLoadingSample] = useState(false);

  useEffect(() => {
    setE2eEnabled(isE2EMode());
  }, []);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result);
      onCapture(url, file);
    };
    reader.readAsDataURL(file);
  };

  const handleSample = async () => {
    if (pending || loadingSample) return;
    setLoadingSample(true);
    try {
      const url = E2E_FIXTURES[stepIndex % E2E_FIXTURES.length];
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Sample not found: ${url}`);
      const blob = await res.blob();
      const filename = url.split("/").pop() || "sample.jpg";
      handleFile(new File([blob], filename, { type: blob.type || "image/jpeg" }));
    } catch (err) {
      console.error("[e2e] sample photo load failed", err);
    } finally {
      setLoadingSample(false);
    }
  };

  return (
    <div className="space-y-3">
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
      <input
        ref={uploadRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />

      <button
        type="button"
        disabled={pending}
        onClick={() => cameraRef.current?.click()}
        className="inline-flex h-14 w-full items-center justify-center gap-2 bg-[hsl(var(--accent-kinetic))] px-5 font-[Geist,Inter,system-ui,sans-serif] text-[0.85rem] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--primary-foreground))] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--ring))]"
      >
        {pending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Camera className="h-5 w-5" />}
        {pending ? "Checking photo…" : "Take photo"}
      </button>

      <button
        type="button"
        disabled={pending}
        onClick={() => uploadRef.current?.click()}
        className="inline-flex h-12 w-full items-center justify-center gap-2 border border-border bg-background px-5 font-[Geist,Inter,system-ui,sans-serif] text-[0.78rem] font-semibold uppercase tracking-[0.14em] text-foreground transition hover:bg-foreground hover:text-background disabled:cursor-not-allowed disabled:opacity-50"
      >
        <ImagePlus className="h-4 w-4" /> Choose from library
      </button>

      {e2eEnabled ? (
        <button
          type="button"
          data-testid="e2e-use-sample-photo"
          disabled={pending || loadingSample}
          onClick={handleSample}
          className="inline-flex h-10 w-full items-center justify-center gap-2 border border-dashed border-border bg-background/50 px-4 font-mono text-[0.7rem] uppercase tracking-[0.16em] text-muted-foreground transition hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loadingSample ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FlaskConical className="h-3.5 w-3.5" />}
          Use sample photo · E2E
        </button>
      ) : null}

      {!step.required && onSkip ? (
        <button
          type="button"
          onClick={onSkip}
          disabled={pending}
          className="mx-auto block min-h-[44px] px-4 py-2.5 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted-foreground transition hover:text-[hsl(var(--accent-kinetic))]"
        >
          [ Skip this photo ]
        </button>
      ) : null}
    </div>
  );
}
