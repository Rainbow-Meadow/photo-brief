export type PhotoPolicy = "not_needed" | "optional" | "recommended" | "required";

/** Short label, recipient-facing. */
export function photoPolicyShort(policy?: string | null): string {
  switch (policy) {
    case "not_needed": return "Not needed";
    case "optional": return "Optional";
    case "recommended": return "Recommended";
    case "required": return "Required";
    default: return "Conditional";
  }
}

/** Full sentence used in confirmation / route description. */
export function photoPolicySentence(policy?: string | null): string {
  switch (policy) {
    case "not_needed": return "no photos needed";
    case "optional": return "optional — add them if it helps";
    case "recommended": return "strongly recommended, but not required";
    case "required": return "required to finish your request";
    default: return "decided after we review your details";
  }
}

/** Tone hint for status badges. */
export function photoPolicyTone(policy?: string | null): "muted" | "info" | "warning" | "success" {
  switch (policy) {
    case "not_needed": return "muted";
    case "optional": return "info";
    case "recommended": return "info";
    case "required": return "warning";
    default: return "muted";
  }
}
