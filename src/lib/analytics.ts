// GA4 analytics helpers. Safe no-ops when analytics is unavailable
// (SSR, ad blockers, consent blocking, or dev where the script failed to load).
//
// Deployment:
// - Preferred: set VITE_GA4_MEASUREMENT_ID in Lovable/deploy settings.
// - Fallback: uses the tag/property value provided during setup.
//
// SPA page views are sent manually by RouteTracker so tokenized recipient URLs
// can be sanitized before they reach GA4.

const FALLBACK_GA4_ID = "535045746";

export const GA_MEASUREMENT_ID =
  (import.meta.env.VITE_GA4_MEASUREMENT_ID as string | undefined)?.trim() ||
  FALLBACK_GA4_ID;

export const GA4_ENABLED =
  GA_MEASUREMENT_ID.length > 0 &&
  GA_MEASUREMENT_ID !== "%VITE_GA4_MEASUREMENT_ID%" &&
  import.meta.env.VITE_DISABLE_GA4 !== "true";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
    __photobriefGa4Loaded?: boolean;
    __photobriefGa4Initialized?: boolean;
  }
}

type EventParams = Record<string, string | number | boolean | undefined | null>;

type ConversionParams = EventParams & {
  value?: number;
  currency?: string;
};

function setupDataLayer() {
  if (typeof window === "undefined" || !GA4_ENABLED) return;
  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag !== "function") {
    window.gtag = (...args: unknown[]) => {
      window.dataLayer?.push(args);
    };
  }
}

function gtagSafe(...args: unknown[]) {
  if (typeof window === "undefined") return;
  if (!GA4_ENABLED) return;
  setupDataLayer();
  if (typeof window.gtag !== "function") return;
  try {
    window.gtag(...args);
  } catch {
    // Analytics must never break the app.
  }
}

function loadGoogleTag() {
  if (typeof window === "undefined" || !GA4_ENABLED) return;
  if (window.__photobriefGa4Loaded) return;
  window.__photobriefGa4Loaded = true;

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_MEASUREMENT_ID)}`;
  document.head.appendChild(script);
}

export function initAnalytics() {
  if (typeof window === "undefined" || !GA4_ENABLED) return;
  if (window.__photobriefGa4Initialized) return;
  window.__photobriefGa4Initialized = true;

  setupDataLayer();
  gtagSafe("js", new Date());
  gtagSafe("config", GA_MEASUREMENT_ID, {
    send_page_view: false,
    anonymize_ip: true,
  });

  const events = ["pointerdown", "keydown", "touchstart", "scroll"] as const;
  const removeListeners = () => {
    events.forEach((eventName) => window.removeEventListener(eventName, loadGoogleTag));
  };
  const loadAndCleanup = () => {
    loadGoogleTag();
    removeListeners();
  };

  events.forEach((eventName) => {
    window.addEventListener(eventName, loadAndCleanup, { passive: true, once: true });
  });

  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(loadAndCleanup, { timeout: 5000 });
  } else {
    window.setTimeout(loadAndCleanup, 5000);
  }
}

/**
 * Sanitize a path so we never leak high-entropy tokens / IDs into GA reports.
 * Replaces UUIDs and the recipient public token segment with placeholders.
 */
export function sanitizePath(pathname: string): string {
  return pathname
    // /r/<token>(/done)? -> /r/:token(/done)?
    .replace(/^\/r\/[^/]+/, "/r/:token")
    // /invite/<token> -> /invite/:token
    .replace(/^\/invite\/[^/]+/, "/invite/:token")
    // /beta-invite/<token> -> /beta-invite/:token
    .replace(/^\/beta-invite\/[^/]+/, "/beta-invite/:token")
    // UUIDs -> :id
    .replace(
      /\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,
      "/:id",
    );
}

export function trackPageView(path: string, title?: string) {
  initAnalytics();
  const cleanPath = sanitizePath(path);
  gtagSafe("event", "page_view", {
    page_path: cleanPath,
    page_title: title ?? (typeof document !== "undefined" ? document.title : undefined),
    page_location:
      typeof window !== "undefined"
        ? `${window.location.origin}${cleanPath}`
        : undefined,
  });
}

export function trackEvent(name: string, params?: EventParams) {
  initAnalytics();
  gtagSafe("event", name, params ?? {});
}

/**
 * Sends a GA4 event and marks it as a conversion candidate. The actual
 * conversion toggle still happens in GA4 Admin, but this keeps naming and
 * parameters consistent across the app.
 */
export function trackConversion(name: string, params: ConversionParams = {}) {
  trackEvent(name, {
    currency: params.currency ?? "USD",
    ...params,
    conversion: true,
  });
}

export const conversions = {
  waitlistSubmitted(params?: ConversionParams) {
    trackConversion("generate_lead", {
      lead_type: "waitlist",
      ...params,
    });
  },
  signupStarted(params?: ConversionParams) {
    trackConversion("sign_up_started", params);
  },
  signupCompleted(params?: ConversionParams) {
    trackConversion("sign_up", params);
  },
  onboardingCompleted(params?: ConversionParams) {
    trackConversion("onboarding_completed", params);
  },
  pricingPlanSelected(params?: ConversionParams) {
    trackConversion("select_item", {
      item_list_name: "pricing_plans",
      ...params,
    });
  },
  checkoutStarted(params?: ConversionParams) {
    trackConversion("begin_checkout", params);
  },
  requestCreated(params?: ConversionParams) {
    trackConversion("request_created", params);
  },
  recipientSubmissionCompleted(params?: ConversionParams) {
    trackConversion("recipient_submission_completed", params);
  },
};
