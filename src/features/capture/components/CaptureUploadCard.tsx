import { useRef } from "react";
import { Camera, ImagePlus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { GuideStep } from "@/types/photobrief";

interface CaptureUploadCardProps {
  step: GuideStep;
  pending: boolean;
  /** Called when the recipient picks a file. */
  onCapture: (previewUrl: string, file: File | null) => void;
  onSkip?: () => void;
}

/** Mobile-first capture action. No simulation path in the real recipient flow. */
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

      <Button
        size="lg"
        className="h-14 w-full rounded-2xl text-base shadow-glow"
        disabled={pending}
        onClick={() => cameraRef.current?.click()}
      >
        {pending ? (
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        ) : (
          <Camera className="mr-2 h-5 w-5" />
        )}
        {pending ? "Checking photo…" : "Take photo"}
      </Button>

      <Button
        variant="outline"
        size="lg"
        className="h-12 w-full rounded-2xl bg-background/70"
        disabled={pending}
        onClick={() => uploadRef.current?.click()}
      >
        <ImagePlus className="mr-2 h-4 w-4" /> Choose from library
      </Button>

      {!step.required && onSkip ? (
        <button
          type="button"
          onClick={onSkip}
          className="mx-auto block rounded-full px-4 py-2 text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          disabled={pending}
        >
          Skip this photo
        </button>
      ) : null}
    </div>
  );
}
