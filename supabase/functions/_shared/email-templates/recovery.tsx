/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Text } from 'npm:@react-email/components@0.0.22'
import { s } from '../transactional-email-templates/brand-styles.ts'
import { AuthShell } from './_auth-shell.tsx'

interface RecoveryEmailProps {
  siteName: string
  confirmationUrl: string
}

export const RecoveryEmail = ({ siteName, confirmationUrl }: RecoveryEmailProps) => (
  <AuthShell
    preview={`Reset your password for ${siteName}`}
    eyebrow="RESEARCH · PASSWORD RESET"
    heading="Reset your password"
    research={
      <Text style={s.text}>
        We received a request to reset your password for {siteName}. Use the
        button below to choose a new one.
      </Text>
    }
    ctaHref={confirmationUrl}
    ctaLabel="Reset password"
    fallbackUrl={confirmationUrl}
    closeNote="If you didn't request a password reset, you can ignore this email — your password won't change."
  />
)

export default RecoveryEmail
