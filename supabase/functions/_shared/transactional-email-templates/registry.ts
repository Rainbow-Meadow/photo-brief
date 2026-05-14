/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'

export interface TemplateEntry {
  component: React.ComponentType<any>
  subject: string | ((data: Record<string, any>) => string)
  to?: string
  displayName?: string
  previewData?: Record<string, any>
}

import { template as recipientRequestLink } from './recipient-request-link.tsx'
import { template as recipientReminder } from './recipient-reminder.tsx'
import { template as submissionReceived } from './submission-received.tsx'
import { template as workspaceWelcome } from './workspace-welcome.tsx'
import { template as waitlistConfirmation } from './waitlist-confirmation.tsx'
import { template as waitlistAdminNotification } from './waitlist-admin-notification.tsx'
import { template as customerSubmissionConfirmation } from './customer-submission-confirmation.tsx'
import { template as businessRequestReady } from './business-request-ready.tsx'
import { template as foundingPartnerWelcome } from './founding-partner-welcome.tsx'
import { template as betaFirstRequestNudge } from './beta-first-request-nudge.tsx'
import { template as betaFeedbackCheckin } from './beta-feedback-checkin.tsx'
import { template as betaStalledCheckin } from './beta-stalled-checkin.tsx'
import { template as betaTestimonialRequest } from './beta-testimonial-request.tsx'
import { template as betaGraduation } from './beta-graduation.tsx'
import { template as demoBriefDelivery } from './demo-brief-delivery.tsx'
import { template as trialEnding } from './trial-ending.tsx'

export const TEMPLATES: Record<string, TemplateEntry> = {
  'recipient-request-link': recipientRequestLink,
  'recipient-reminder': recipientReminder,
  'submission-received': submissionReceived,
  'workspace-welcome': workspaceWelcome,
  'waitlist-confirmation': waitlistConfirmation,
  'waitlist-admin-notification': waitlistAdminNotification,
  'customer-submission-confirmation': customerSubmissionConfirmation,
  'business-request-ready': businessRequestReady,
  'founding-partner-welcome': foundingPartnerWelcome,
  'beta-first-request-nudge': betaFirstRequestNudge,
  'beta-feedback-checkin': betaFeedbackCheckin,
  'beta-stalled-checkin': betaStalledCheckin,
  'beta-testimonial-request': betaTestimonialRequest,
  'beta-graduation': betaGraduation,
  'demo-brief-delivery': demoBriefDelivery,
}
