// User-friendly error codes for support / debugging.
// Each code maps to a short tag, headline, and body that's safe to show to
// recipients. The `code` is also surfaced in the diagnostics panel so support
// can grep logs quickly.

export type RecipientErrorCode =
  | "PB-404" // token not found
  | "PB-425" // request not ready (no guide attached / guide missing)
  | "PB-410" // link revoked / expired
  | "PB-NET" // network failure during submit
  | "PB-PERM" // RLS / permission denied during submit
  | "PB-503" // backend down / 5xx during submit
  | "PB-500"; // unexpected

export interface RecipientErrorDescriptor {
  code: RecipientErrorCode;
  tag: string;
  headline: string;
  body: string;
}

export const RECIPIENT_ERRORS: Record<RecipientErrorCode, RecipientErrorDescriptor> = {
  "PB-404": {
    code: "PB-404",
    tag: "Link unavailable",
    headline: "This link is not available",
    body: "This request link is no longer available. Please reach out to the sender for an updated link.",
  },
  "PB-425": {
    code: "PB-425",
    tag: "Almost ready",
    headline: "We're not quite ready",
    body: "The sender is still finishing this request. Please ask them to send you a fresh link once it's ready.",
  },
  "PB-410": {
    code: "PB-410",
    tag: "Link expired",
    headline: "This link has expired",
    body: "This request is no longer accepting submissions. Reach out to the sender for a new link.",
  },
  "PB-NET": {
    code: "PB-NET",
    tag: "Connection issue",
    headline: "We couldn't reach the server",
    body: "Check your internet connection and tap Try again. Your photos and answers are still saved on this device.",
  },
  "PB-PERM": {
    code: "PB-PERM",
    tag: "Link permission",
    headline: "This link can't accept your submission",
    body: "Your link may have been revoked or replaced. Ask the sender for a fresh link, then try again.",
  },
  "PB-503": {
    code: "PB-503",
    tag: "Service busy",
    headline: "Our service is temporarily unavailable",
    body: "Give it a moment and tap Try again. If it keeps failing, let the sender know.",
  },
  "PB-500": {
    code: "PB-500",
    tag: "Something broke",
    headline: "We hit an unexpected problem",
    body: "Try again. If it keeps happening, share the diagnostics below with the sender.",
  },
};

const LEGACY_MAP: Record<string, RecipientErrorCode> = {
  LINK_NOT_FOUND: "PB-404",
  LINK_NOT_READY: "PB-425",
  LINK_EXPIRED: "PB-410",
};

export function resolveRecipientError(message?: string | null): RecipientErrorDescriptor {
  if (!message) return RECIPIENT_ERRORS["PB-500"];
  if (message in RECIPIENT_ERRORS) return RECIPIENT_ERRORS[message as RecipientErrorCode];
  const mapped = LEGACY_MAP[message];
  if (mapped) return RECIPIENT_ERRORS[mapped];
  return RECIPIENT_ERRORS["PB-500"];
}
