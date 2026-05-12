// Shared Smart Intake domain types.
// Additive contract for the brief-first intake model. Existing PhotoBrief
// request, guide, submission, and capture types remain unchanged.

export type PhotoPolicy = "not_needed" | "optional" | "recommended" | "required";

export type IntakeQuestionType =
  | "short_text"
  | "long_text"
  | "single_select"
  | "multi_select"
  | "number"
  | "yes_no"
  | "date"
  | "phone"
  | "email"
  | "address"
  | "photo_upload";

export type IntakeReadinessStatus =
  | "ready_to_quote"
  | "ready_to_dispatch"
  | "ready_for_callback"
  | "needs_review"
  | "needs_more_info"
  | "needs_photos"
  | "out_of_service_area"
  | "low_intent"
  | "spam";

export type IntakeSessionStatus = "started" | "in_progress" | "submitted" | "abandoned" | "expired" | "error";

export type IntakeBriefStatus =
  | "new"
  | "reviewing"
  | "ready_to_quote"
  | "ready_to_dispatch"
  | "needs_more_info"
  | "closed"
  | "archived";

export interface IntakeQuestionOption {
  label: string;
  value: string;
  description?: string | null;
}

export interface IntakeQuestion {
  id: string;
  prompt: string;
  type: IntakeQuestionType;
  required: boolean;
  helperText?: string | null;
  options?: IntakeQuestionOption[];
  placeholder?: string | null;
  sortOrder?: number;
  metadata?: Record<string, unknown>;
}

export interface IntakeRoute {
  id: string;
  label: string;
  customerDescription?: string | null;
  serviceName?: string | null;
  serviceCategory?: string | null;
  matchKeywords?: string[];
  photoPolicy: PhotoPolicy;
  photoPolicyReason?: string | null;
  readinessGoal: IntakeReadinessStatus;
  questions: IntakeQuestion[];
  sortOrder?: number;
  isFallback?: boolean;
  metadata?: Record<string, unknown>;
}

export interface IntakeBlueprintSummary {
  id: string;
  workspaceId: string;
  intakeSourceId?: string | null;
  status: "draft" | "reviewing" | "approved" | "active" | "superseded" | "archived";
  routingQuestion: string;
  summary?: string | null;
  routes: IntakeRoute[];
  createdAt: string;
  approvedAt?: string | null;
}

export interface IntakeCustomerContact {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  preferredContactMethod?: "email" | "sms" | "phone" | "either" | "unknown";
}

export interface IntakeSession {
  id: string;
  workspaceId: string;
  intakeSourceId?: string | null;
  blueprintId?: string | null;
  routingRuleId?: string | null;
  customerId?: string | null;
  linkedPhotoBriefRequestId?: string | null;
  publicSessionToken: string;
  selectedRouteLabel?: string | null;
  selectedService?: string | null;
  customer: IntakeCustomerContact;
  answers: Record<string, unknown>;
  rawPayload: Record<string, unknown>;
  photoPolicy: PhotoPolicy;
  readinessStatus: IntakeReadinessStatus;
  status: IntakeSessionStatus;
  metadata: Record<string, unknown>;
  startedAt: string;
  submittedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IntakeBrief {
  id: string;
  workspaceId: string;
  intakeSessionId: string;
  intakeSourceId?: string | null;
  blueprintId?: string | null;
  routingRuleId?: string | null;
  customerId?: string | null;
  linkedPhotoBriefRequestId?: string | null;
  title: string;
  summary?: string | null;
  routeLabel?: string | null;
  serviceLabel?: string | null;
  customer: IntakeCustomerContact;
  answers: Record<string, unknown>;
  brief: Record<string, unknown>;
  photoPolicy: PhotoPolicy;
  photosProvided: boolean;
  photoCount: number;
  readinessStatus: IntakeReadinessStatus;
  readinessScore?: number | null;
  nextAction?: string | null;
  missingItems: string[];
  status: IntakeBriefStatus;
  createdAt: string;
  updatedAt: string;
}

export interface IntakeSubmitResult {
  success: boolean;
  briefId?: string;
  sessionId?: string;
  readinessStatus?: IntakeReadinessStatus;
  photoPolicy?: PhotoPolicy;
  nextAction?: string | null;
  photoRequestToken?: string | null;
  error?: string;
}
