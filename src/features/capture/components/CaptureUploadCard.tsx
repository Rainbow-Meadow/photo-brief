import { useRef } from "react";
import { Camera, ImagePlus, Loader2 } from "lucide-react";
import type { GuideStep } from "@/types/photobrief";

interface CaptureUploadCardProps {
  step: GuideStep;
  pending: boolean;
  onCapture: (previewUrl: string, file: File | null) => void;
  onSkip?: () => void;
}

export function CaptureUploadCard({ step, pending, onCapture, onSkip }: CaptureUploadCardProps) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const uploadRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result);
      onCapture(url, file);
    };
    reader.readAsDataURL(file);
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
