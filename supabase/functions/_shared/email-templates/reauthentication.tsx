/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Text } from 'npm:@react-email/components@0.0.22'
import { BRAND, s } from '../transactional-email-templates/brand-styles.ts'
import { AuthShell } from './_auth-shell.tsx'

interface ReauthenticationEmailProps {
  token: string
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <AuthShell
    preview="Your verification code"
    eyebrow="RESEARCH · REAUTHENTICATION"
    heading="Confirm reauthentication"
    research={<Text style={s.text}>Use the code below to confirm your identity.</Text>}
    briefSlot={<Text style={codeStyle}>{token}</Text>}
    closeNote="This code expires shortly. If you didn't request it, you can safely ignore this email."
  />
)

export default ReauthenticationEmail

const codeStyle = {
  fontFamily: BRAND.monoFamily,
  fontSize: '30px',
  fontWeight: 700 as const,
  color: BRAND.colors.ink,
  margin: '8px 0 18px',
  letterSpacing: '0.18em',
  padding: '14px 18px',
  border: `1px solid ${BRAND.colors.rule}`,
  borderRadius: '2px',
  display: 'inline-block' as const,
  background: BRAND.colors.surface,
}
