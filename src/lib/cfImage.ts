/**
 * Cloudflare Image Resizing URL helper.
 *
 * Wraps any URL with `/cdn-cgi/image/{options}/{url}` so Cloudflare can
 * resize, re-encode (AVIF/WebP/auto), and edge-cache the result. Works for
 * any image served through the photobrief.ai zone — including R2 signed
 * URLs proxied via a worker route.
 *
 * Docs: https://developers.cloudflare.com/images/transform-images/
 *
 * Usage:
 *   <img src={cfImage(submission.publicUrl, { width: 480, quality: 80 })} />
 *
 * Falls back to the original URL when the input is empty, a data: URI,
 * or already a /cdn-cgi/image/ URL.
 */

export type CfImageFit = "scale-down" | "contain" | "cover" | "crop" | "pad";
export type CfImageFormat = "auto" | "avif" | "webp" | "json" | "jpeg" | "png";

export interface CfImageOptions {
  width?: number;
  height?: number;
  /** 1-100. Defaults to Cloudflare's auto. */
  quality?: number;
  fit?: CfImageFit;
  format?: CfImageFormat;
  /** Device pixel ratio (1, 2, 3). */
  dpr?: number;
  /** When true, request a blurred low-res placeholder. */
  blur?: number;
  /** Strip EXIF metadata. Defaults to true. */
  metadata?: "keep" | "copyright" | "none";
  /** Background color when fit=pad. */
  background?: string;
  /** Sharpen output (0-10). */
  sharpen?: number;
}

const DEFAULT_HOST = "photobrief.ai";

function buildOptions(opts: CfImageOptions): string {
  const parts: string[] = [];
  if (opts.width) parts.push(`width=${Math.round(opts.width)}`);
  if (opts.height) parts.push(`height=${Math.round(opts.height)}`);
  if (opts.quality) parts.push(`quality=${opts.quality}`);
  if (opts.fit) parts.push(`fit=${opts.fit}`);
  parts.push(`format=${opts.format ?? "auto"}`);
  if (opts.dpr && opts.dpr !== 1) parts.push(`dpr=${opts.dpr}`);
  if (opts.blur) parts.push(`blur=${opts.blur}`);
  if (opts.sharpen) parts.push(`sharpen=${opts.sharpen}`);
  if (opts.background) parts.push(`background=${opts.background}`);
  parts.push(`metadata=${opts.metadata ?? "none"}`);
  return parts.join(",");
}

/**
 * Returns a Cloudflare-resized version of the given URL. If the URL is
 * absolute and on a different host, the transform is still applied via the
 * photobrief.ai zone (Cloudflare fetches the source). If the URL is empty
 * or already wrapped, it is returned unchanged.
 */
/**
 * True when the current page is served from a host that has Cloudflare
 * Image Resizing enabled. Off the photobrief.ai zone (e.g. the
 * `*.lovable.app` preview, localhost, custom subdomains) we must NOT
 * route through `/cdn-cgi/image/` because Cloudflare would try to fetch
 * a hashed Vite asset that only exists in the *production* bundle on
 * photobrief.ai. In that case we serve the original URL untouched.
 */
function cfResizingAvailable(): boolean {
  // Build-time opt-in: production builds (and the Puppeteer prerender that
  // reads them) see this as "true", so the emitted HTML already contains
  // /cdn-cgi/image/... URLs. Without this, prerender ran against
  // http://127.0.0.1:4173 and shipped raw /assets/*.png URLs to Lighthouse.
  if (import.meta.env.VITE_CF_IMAGES === "true") return true;
  // Runtime safety net for any deploy that forgot the env var.
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  return host === DEFAULT_HOST || host === `www.${DEFAULT_HOST}`;
}

/** True for URLs that should NEVER be routed through Cloudflare Image Resizing. */
export function cfImageBypass(url: string | null | undefined): boolean {
  if (!url) return true;
  if (url.startsWith("data:")) return true;
  if (url.startsWith("blob:")) return true;
  if (url.includes("/cdn-cgi/image/")) return true;
  // SVGs and animated GIFs gain nothing from CF resizing and SVG can break.
  const path = url.split("?")[0].toLowerCase();
  if (path.endsWith(".svg") || path.endsWith(".gif")) return true;
  return false;
}

export function cfImage(url: string | null | undefined, options: CfImageOptions): string {
  if (!url) return "";
  if (cfImageBypass(url)) return url;
  if (!cfResizingAvailable()) return url;
  const opts = buildOptions(options);
  // Cloudflare expects: https://<zone>/cdn-cgi/image/<options>/<source-url>
  // For absolute URLs, append verbatim. For same-origin paths, strip the
  // leading slash so we don't emit `…/<opts>//assets/…` (which CF rejects
  // with err=9404 / 403).
  const isAbsolute = /^https?:\/\//i.test(url);
  const source = isAbsolute ? url : url.replace(/^\/+/, "");
  return `https://${DEFAULT_HOST}/cdn-cgi/image/${opts}/${source}`;
}

/**
 * Build a responsive `srcset` attribute at common widths.
 *
 *   <img
 *     src={cfImage(url, { width: 640 })}
 *     srcSet={cfImageSrcSet(url, [320, 640, 960, 1280])}
 *     sizes="(max-width: 768px) 100vw, 640px"
 *   />
 */
export function cfImageSrcSet(
  url: string | null | undefined,
  widths: number[],
  options: Omit<CfImageOptions, "width"> = {},
): string {
  if (!url) return "";
  if (cfImageBypass(url)) return "";
  // Without Cloudflare Image Resizing each width would resolve to the same
  // raw URL, so a srcset is pointless — return empty and let `src` win.
  if (!cfResizingAvailable()) return "";
  return widths
    .map((w) => `${cfImage(url, { ...options, width: w })} ${w}w`)
    .join(", ");
}

/** Tiny blurred placeholder for progressive loading. */
export function cfImageBlur(url: string | null | undefined, width = 32): string {
  return cfImage(url, { width, quality: 30, blur: 30, format: "webp" });
}
