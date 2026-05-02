import { useMemo } from "react";
import { SEOHead } from "@/components/seo/SEOHead";

/**
 * PageMeta — single per-page entry point for everything search and answer
 * engines need: title, meta description, robots, canonical, OG/Twitter, JSON-LD,
 * and breadcrumbs. It builds on SEOHead so the prerender pipeline keeps one
 * DOM-mutation path.
 */
export interface Breadcrumb {
  name: string;
  /** Path-only, e.g. "/pricing". Origin is added automatically. */
  path: string;
}

export interface PageMetaOptions {
  title: string;
  description: string;
  canonicalPath: string;
  ogImage?: string;
  ogType?: "website" | "article" | "product";
  twitterCard?: "summary" | "summary_large_image";
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  breadcrumbs?: Breadcrumb[];
  noindex?: boolean;
}

const ORIGIN = "https://photobrief.ai";

function buildBreadcrumbJsonLd(crumbs: Breadcrumb[]): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: `${ORIGIN}${c.path === "/" ? "" : c.path}`,
    })),
  };
}

export function PageMeta(opts: PageMetaOptions) {
  const {
    title,
    description,
    canonicalPath,
    ogImage,
    ogType = "website",
    twitterCard = "summary_large_image",
    jsonLd,
    breadcrumbs,
    noindex = false,
  } = opts;

  if (import.meta.env.DEV) {
    if (title.length > 65) {
      // eslint-disable-next-line no-console
      console.warn(`[PageMeta] title is ${title.length} chars (> 65): "${title}"`);
    }
    if (description.length > 170) {
      // eslint-disable-next-line no-console
      console.warn(
        `[PageMeta] description is ${description.length} chars (> 170): "${description.slice(0, 80)}…"`,
      );
    }
  }

  const merged = useMemo<Record<string, unknown>[]>(() => {
    const base = jsonLd
      ? Array.isArray(jsonLd)
        ? [...jsonLd]
        : [jsonLd]
      : [];
    if (breadcrumbs && breadcrumbs.length > 1) {
      base.push(buildBreadcrumbJsonLd(breadcrumbs));
    }
    return base;
  }, [jsonLd, breadcrumbs]);

  return (
    <SEOHead
      title={title}
      description={description}
      canonicalPath={canonicalPath}
      jsonLd={merged.length > 0 ? merged : undefined}
      noindex={noindex}
      ogImage={ogImage}
      ogType={ogType}
      twitterCard={twitterCard}
    />
  );
}

/** Hook variant for callers that prefer hook ergonomics. */
export function usePageMeta(opts: PageMetaOptions) {
  return PageMeta(opts);
}
