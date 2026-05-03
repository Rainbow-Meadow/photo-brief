// Standard AI photo assessment catalog.
//
// Keep this intentionally small. The customer only needs simple, actionable
// feedback, and the business only needs to know whether the photo is usable.
import { STANDARD_PHOTO_ISSUES } from "@/config/photoAssessment";
import type { AICheckSeverity, AICheckType } from "@/types/photobrief";

export interface AICheckDefinition {
  id: AICheckType;
  label: string;
  /** Whether this issue tends to block submission or just inform. */
  defaultSeverity: AICheckSeverity;
  /** Coaching message shown to recipients when this issue is present. */
  failMessage: string;
  /** Optional positive confirmation. */
  passMessage?: string;
}

export const aiChecks: Record<AICheckType, AICheckDefinition> = Object.fromEntries(
  STANDARD_PHOTO_ISSUES.map((issue) => [
    issue.type,
    {
      id: issue.type,
      label: issue.label,
      defaultSeverity: issue.defaultSeverity,
      failMessage: issue.customerCopy,
    },
  ]),
) as Record<AICheckType, AICheckDefinition>;
