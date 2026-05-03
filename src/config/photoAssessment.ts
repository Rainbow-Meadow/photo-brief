import type { AICheckSeverity, AICheckType } from "@/types/photobrief";

export const STANDARD_PHOTO_ISSUES: Array<{
  type: AICheckType;
  label: string;
  customerCopy: string;
  defaultSeverity: Exclude<AICheckSeverity, "unavailable">;
}> = [
  {
    type: "wrong_subject",
    label: "Requested subject not visible",
    customerCopy: "Make sure the requested item or area is clearly in the photo.",
    defaultSeverity: "fail",
  },
  {
    type: "too_dark",
    label: "Too dark",
    customerCopy: "Try taking it somewhere brighter or turn on a light.",
    defaultSeverity: "fail",
  },
  {
    type: "blurry",
    label: "Blurry",
    customerCopy: "Hold the camera steady and retake it if the details are hard to see.",
    defaultSeverity: "warn",
  },
  {
    type: "label_unreadable",
    label: "Label unreadable",
    customerCopy: "Move closer so the label or text can be read.",
    defaultSeverity: "fail",
  },
  {
    type: "glare",
    label: "Glare",
    customerCopy: "Tilt the camera slightly to avoid glare or reflections.",
    defaultSeverity: "warn",
  },
  {
    type: "too_close_or_cropped",
    label: "Too close or cropped",
    customerCopy: "Back up a little so the full requested subject is visible.",
    defaultSeverity: "warn",
  },
] as const;

export const STANDARD_PHOTO_ISSUE_TYPES = STANDARD_PHOTO_ISSUES.map((issue) => issue.type);

export function getPhotoIssue(type: AICheckType) {
  return STANDARD_PHOTO_ISSUES.find((issue) => issue.type === type);
}

export function photoIssueLabel(type: AICheckType): string {
  return getPhotoIssue(type)?.label ?? type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function photoIssueCustomerCopy(type: AICheckType): string | undefined {
  return getPhotoIssue(type)?.customerCopy;
}
