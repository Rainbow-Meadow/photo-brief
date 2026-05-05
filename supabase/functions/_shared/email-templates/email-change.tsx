/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface EmailChangeEmailProps {
  siteName: string
  email: string
  newEmail: string
  confirmationUrl: string
}

export const EmailChangeEmail = ({
  siteName,
  email,
  newEmail,
  confirmationUrl,
}: EmailChangeEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Confirm your email change for {siteName}</Preview>
    <Body style={main}>
      <Section style={outerPad}>
        <Container style={container}>
          <Section style={header}>
            <Text style={wordmark}>PhotoBrief.ai</Text>
          </Section>
          <Section style={body}>
            <Heading style={h1}>Confirm your email change</Heading>
            <Text style={text}>
              You requested to change your email address for {siteName} from{' '}
              <Link href={`mailto:${email}`} style={link}>
                {email}
              </Link>{' '}
              to{' '}
              <Link href={`mailto:${newEmail}`} style={link}>
                {newEmail}
              </Link>
              .
            </Text>
            <Text style={text}>
              Click the button below to confirm this change:
            </Text>
            <Section style={ctaWrap}>
              <Button style={button} href={confirmationUrl}>
                Confirm Email Change
              </Button>
            </Section>
            <Text style={footer}>
              If you didn't request this change, please secure your account
              immediately.
            </Text>
          </Section>
        </Container>
      </Section>
    </Body>
  </Html>
)

export default EmailChangeEmail

const main = { backgroundColor: '#ffffff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }
const outerPad = { backgroundColor: '#F8F7FA', padding: '40px 0' }
const container = { maxWidth: '560px', margin: '0 auto', backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E1DEE7', overflow: 'hidden' as const }
const header = { padding: '28px 32px 20px', borderBottom: '1px solid #E1DEE7' }
const wordmark = { fontSize: '18px', fontWeight: 700, color: '#7C3AED', letterSpacing: '-0.02em', margin: '0', lineHeight: '1' }
const body = { padding: '28px 32px 32px' }
const h1 = { fontSize: '24px', fontWeight: 600 as const, color: '#111014', margin: '0 0 16px', lineHeight: '1.25' }
const text = { fontSize: '15px', color: '#625F68', lineHeight: '1.6', margin: '0 0 16px' }
const link = { color: '#7C3AED', textDecoration: 'underline' }
const ctaWrap = { margin: '24px 0 20px' }
const button = { backgroundColor: '#7C3AED', color: '#ffffff', fontSize: '15px', fontWeight: 600, borderRadius: '10px', padding: '14px 28px', textDecoration: 'none' }
const footer = { fontSize: '12px', color: '#94909C', margin: '24px 0 0' }
