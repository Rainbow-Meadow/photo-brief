/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Link, Text } from 'npm:@react-email/components@0.0.22'
import { s } from '../transactional-email-templates/brand-styles.ts'
import { AuthShell } from './_auth-shell.tsx'

interface EmailChangeEmailProps {
  siteName: string
  email: string
  newEmail: string
  confirmationUrl: string
}

export const EmailChangeEmail = ({
  siteName, email, newEmail, confirmationUrl,
}: EmailChangeEmailProps) => (
  <AuthShell
    preview={`Confirm your email change for ${siteName}`}
    eyebrow="RESEARCH · EMAIL CHANGE"
    heading="Confirm your email change"
    research={
      <Text style={s.text}>
        You requested to change the email on your {siteName} account from{' '}
        <Link href={`mailto:${email}`} style={s.link}>{email}</Link> to{' '}
        <Link href={`mailto:${newEmail}`} style={s.link}>{newEmail}</Link>.
      </Text>
    }
    ctaHref={confirmationUrl}
    ctaLabel="Confirm email change"
    fallbackUrl={confirmationUrl}
    closeNote="If you didn't request this change, secure your account immediately."
  />
)

export default EmailChangeEmail
