export interface WebpVariant {
  blob: Blob;
  width: number;
  height: number;
}

export interface WebpConversionResult {
  full: WebpVariant;
  preview: WebpVariant;
  thumb: WebpVariant;
  checksumSha256: string;
}

function scaleToFit(width: number, height: number, maxDimension: number) {
  const max = Math.max(width, height);
  if (max <= maxDimension) return { width, height };
  const scale = maxDimension / max;
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

async function decodeImage(blob: Blob): Promise<ImageBitmap> {
  if ("createImageBitmap" in window) {
    return createImageBitmap(blob, { imageOrientation: "from-image" });
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Could not create canvas context"));
        return;
      }
      ctx.drawImage(img, 0, 0);
      createImageBitmap(canvas).then(resolve, reject);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not decode image"));
    };
    img.src = url;
  });
}

async function renderVariant(bitmap: ImageBitmap, maxDimension: number, quality: number): Promise<WebpVariant> {
  const size = scaleToFit(bitmap.width, bitmap.height, maxDimension);
  const canvas = document.createElement("canvas");
  canvas.width = size.width;
  canvas.height = size.height;
  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) throw new Error("Could not create canvas context");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, 0, 0, size.width, size.height);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (out) => out ? resolve(out) : reject(new Error("WebP conversion failed")),
      "image/webp",
      quality,
    );
  });

  return { blob, width: size.width, height: size.height };
}

export async function sha256Hex(blob: Blob): Promise<string> {
  const buffer = await blob.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function convertImageToWebpVariants(blob: Blob): Promise<WebpConversionResult> {
  const bitmap = await decodeImage(blob);
  try {
    const [full, preview, thumb] = await Promise.all([
      renderVariant(bitmap, 2400, 0.86),
      renderVariant(bitmap, 1200, 0.82),
      renderVariant(bitmap, 480, 0.76),
    ]);
    return {
      full,
      preview,
      thumb,
      checksumSha256: await sha256Hex(full.blob),
    };
  } finally {
    bitmap.close?.();
  }
}
