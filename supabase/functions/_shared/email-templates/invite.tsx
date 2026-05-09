/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Link, Text } from 'npm:@react-email/components@0.0.22'
import { s } from '../transactional-email-templates/brand-styles.ts'
import { AuthShell } from './_auth-shell.tsx'

interface InviteEmailProps {
  siteName: string
  siteUrl: string
  confirmationUrl: string
}

export const InviteEmail = ({ siteName, siteUrl, confirmationUrl }: InviteEmailProps) => (
  <AuthShell
    preview={`You've been invited to join ${siteName}`}
    eyebrow="RESEARCH · INVITATION"
    heading="You've been invited"
    research={
      <Text style={s.text}>
        Someone invited you to join{' '}
        <Link href={siteUrl} style={s.link}><strong>{siteName}</strong></Link>.
        Accept below to create your account and finish onboarding.
      </Text>
    }
    ctaHref={confirmationUrl}
    ctaLabel="Accept invitation"
    fallbackUrl={confirmationUrl}
    closeNote="If you weren't expecting this invitation, you can safely ignore this email."
  />
)

export default InviteEmail
