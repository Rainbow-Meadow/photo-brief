import { forwardRef, type ImgHTMLAttributes } from "react";
import { cfImage, cfImageBypass, cfImageSrcSet, type CfImageFit } from "@/lib/cfImage";

export interface CfImgProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "srcSet"> {
  /** Source URL. Pass through unchanged for data:, blob:, .svg, .gif, or preview-host requests. */
  src?: string | null;
  /** Default rendered width passed to Cloudflare. Defaults to 1024 (or `width` if numeric). */
  cfWidth?: number;
  /** Optional explicit responsive widths. When omitted, a sensible default ladder is used. */
  widths?: number[];
  /** JPEG/WebP/AVIF quality (1-100). */
  quality?: number;
  /** Cloudflare fit mode. */
  fit?: CfImageFit;
  /** Override the auto srcSet ladder entirely (set to false to disable srcSet). */
  responsive?: boolean;
}

const DEFAULT_WIDTHS = [320, 480, 720, 1080, 1440, 1920];

/**
 * Drop-in `<img>` replacement that automatically routes raster sources through
 * Cloudflare Image Resizing on the production domain and falls back to the
 * raw URL on previews / localhost / SVG / blob: / data: URIs.
 */
export const CfImg = forwardRef<HTMLImageElement, CfImgProps>(function CfImg(
  {
    src,
    cfWidth,
    widths,
    quality,
    fit,
    responsive = true,
    sizes,
    width,
    height,
    ...rest
  },
  ref,
) {
  const numericWidth =
    typeof cfWidth === "number"
      ? cfWidth
      : typeof width === "number"
      ? width
      : typeof width === "string" && /^\d+$/.test(width)
      ? Number(width)
      : 1024;

  const bypass = cfImageBypass(src);

  const finalSrc = bypass
    ? src ?? ""
    : cfImage(src, { width: numericWidth, quality, fit, format: "auto" });

  const ladder = widths ?? DEFAULT_WIDTHS.filter((w) => w <= numericWidth * 2);
  const srcSet =
    !bypass && responsive ? cfImageSrcSet(src, ladder, { quality, fit, format: "auto" }) : "";

  return (
    <img
      ref={ref}
      src={finalSrc}
      srcSet={srcSet || undefined}
      sizes={srcSet ? sizes ?? "100vw" : sizes}
      width={width}
      height={height}
      {...rest}
    />
  );
});
