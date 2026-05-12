import { useRef, useState } from "react";
import { Camera, ImagePlus, Loader2, CheckCircle2, AlertCircle, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { PhotoPolicy } from "@/features/intake/lib/photoPolicy";

interface Props {
  intakeSessionId: string;
  intakeBriefId: string;
  sessionToken: string;
  photoPolicy: Extract<PhotoPolicy, "optional" | "recommended">;
}

interface UploadItem {
  localId: string;
  filename: string;
  status: "uploading" | "ready" | "failed";
  message?: string;
}

const ACCEPT = "image/jpeg,image/png,image/webp,image/heic,image/heif";
const MAX_BYTES = 25 * 1024 * 1024;
const MAX_PHOTOS = 12;

export function IntakeAttachmentUploader({ intakeSessionId, intakeBriefId, sessionToken, photoPolicy }: Props) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const libraryRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<UploadItem[]>([]);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const readyCount = items.filter((i) => i.status === "ready").length;

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || !fileList.length) return;
    setGlobalError(null);
    const files = Array.from(fileList);
    for (const file of files) {
      if (readyCount + items.filter((i) => i.status === "uploading").length >= MAX_PHOTOS) {
        setGlobalError(`You can attach up to ${MAX_PHOTOS} photos.`);
        return;
      }
      void uploadOne(file);
    }
  };

  const uploadOne = async (file: File) => {
    const localId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    if (file.size > MAX_BYTES) {
      setItems((prev) => [...prev, { localId, filename: file.name, status: "failed", message: "Over 25 MB" }]);
      return;
    }
    setItems((prev) => [...prev, { localId, filename: file.name, status: "uploading" }]);
    try {
      const ext = (file.name.split(".").pop() || file.type.split("/")[1] || "jpg").toLowerCase();
      const { data: created, error: createErr } = await supabase.functions.invoke("create-intake-attachment-upload", {
        body: {
          intakeSessionId,
          intakeBriefId,
          sessionToken,
          contentType: file.type || "image/jpeg",
          ext,
          sizeBytes: file.size,
          filename: file.name,
        },
      });
      if (createErr || !created?.uploadUrl || !created?.attachmentId) {
        throw new Error((created as any)?.error ?? createErr?.message ?? "Could not start upload");
      }
      const putRes = await fetch(created.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type || "image/jpeg" },
        body: file,
      });
      if (!putRes.ok) throw new Error(`Upload failed (${putRes.status})`);
      const { data: finalized, error: finErr } = await supabase.functions.invoke("finalize-intake-attachment", {
        body: { attachmentId: created.attachmentId, intakeSessionId, sessionToken },
      });
      if (finErr || !(finalized as any)?.ok) {
        throw new Error((finalized as any)?.error ?? finErr?.message ?? "Could not save photo");
      }
      setItems((prev) => prev.map((i) => (i.localId === localId ? { ...i, status: "ready" } : i)));
    } catch (e: any) {
      setItems((prev) => prev.map((i) => (i.localId === localId ? { ...i, status: "failed", message: e?.message ?? "Upload failed" } : i)));
    }
  };

  const headline = photoPolicy === "recommended" ? "Photos recommended" : "Add photos — optional";
  const subline =
    photoPolicy === "recommended"
      ? "A couple of clear photos will help the team respond accurately and faster."
      : "Photos are not required, but you can attach a few if helpful.";

  return (
    <section className="mx-auto mt-6 max-w-md border border-border bg-background p-4 text-left">
      <p className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground">{headline}</p>
      <p className="mt-1.5 text-sm leading-6 text-foreground">{subline}</p>

      <input
        ref={cameraRef}
        type="file"
        accept={ACCEPT}
        capture="environment"
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <input
        ref={libraryRef}
        type="file"
        accept={ACCEPT}
        multiple
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />

      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => cameraRef.current?.click()}
          className="inline-flex h-12 items-center justify-center gap-2 bg-[hsl(var(--accent-kinetic))] px-3 font-[Geist,Inter,system-ui,sans-serif] text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--primary-foreground))] transition hover:brightness-110"
        >
          <Camera className="h-4 w-4" /> Take photo
        </button>
        <button
          type="button"
          onClick={() => libraryRef.current?.click()}
          className="inline-flex h-12 items-center justify-center gap-2 border border-border bg-background px-3 font-[Geist,Inter,system-ui,sans-serif] text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-foreground transition hover:bg-foreground hover:text-background"
        >
          <ImagePlus className="h-4 w-4" /> Choose
        </button>
      </div>

      {items.length ? (
        <ul className="mt-4 space-y-2">
          {items.map((item) => (
            <li key={item.localId} className="flex items-center gap-2 border border-border bg-card px-3 py-2 text-xs">
              {item.status === "uploading" ? <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-muted-foreground" /> : null}
              {item.status === "ready" ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[hsl(var(--accent-kinetic))]" /> : null}
              {item.status === "failed" ? <AlertCircle className="h-3.5 w-3.5 shrink-0 text-destructive" /> : null}
              <span className="min-w-0 flex-1 truncate text-foreground">{item.filename}</span>
              <span className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-muted-foreground">
                {item.status === "uploading" ? "uploading" : item.status === "ready" ? "saved" : "failed"}
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      {globalError ? (
        <p className="mt-3 flex items-start gap-2 text-xs text-destructive">
          <X className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {globalError}
        </p>
      ) : null}

      {items.some((i) => i.status === "failed") ? (
        <p className="mt-3 text-xs leading-5 text-muted-foreground">
          Some photos didn’t upload. Your request was still received — the business can ask for photos later if needed.
        </p>
      ) : null}
    </section>
  );
}
