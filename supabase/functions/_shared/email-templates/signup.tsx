/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Link, Text } from 'npm:@react-email/components@0.0.22'
import { s } from '../transactional-email-templates/brand-styles.ts'
import { AuthShell } from './_auth-shell.tsx'

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
}

export const SignupEmail = ({ siteName, siteUrl, recipient, confirmationUrl }: SignupEmailProps) => (
  <AuthShell
    preview={`Confirm your email for ${siteName}`}
    eyebrow="RESEARCH · NEW ACCOUNT"
    heading="Confirm your email"
    research={
      <Text style={s.text}>
        Thanks for signing up for{' '}
        <Link href={siteUrl} style={s.link}><strong>{siteName}</strong></Link>.
        Please confirm the address{' '}
        <Link href={`mailto:${recipient}`} style={s.link}>{recipient}</Link>{' '}
        so we can finish provisioning your workspace.
      </Text>
    }
    ctaHref={confirmationUrl}
    ctaLabel="Verify email"
    fallbackUrl={confirmationUrl}
    closeNote="If you didn't create an account, you can safely ignore this email."
  />
)

export default SignupEmail
