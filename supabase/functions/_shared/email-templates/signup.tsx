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

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
}

export const SignupEmail = ({
  siteName,
  siteUrl,
  recipient,
  confirmationUrl,
}: SignupEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Confirm your email for {siteName}</Preview>
    <Body style={main}>
      <Section style={outerPad}>
        <Container style={container}>
          <Section style={header}>
            <Text style={wordmark}>PhotoBrief.ai</Text>
          </Section>
          <Section style={body}>
            <Heading style={h1}>Confirm your email</Heading>
            <Text style={text}>
              Thanks for signing up for{' '}
              <Link href={siteUrl} style={link}>
                <strong>{siteName}</strong>
              </Link>
              !
            </Text>
            <Text style={text}>
              Please confirm your email address (
              <Link href={`mailto:${recipient}`} style={link}>
                {recipient}
              </Link>
              ) by clicking the button below:
            </Text>
            <Section style={ctaWrap}>
              <Button style={button} href={confirmationUrl}>
                Verify Email
              </Button>
            </Section>
            <Text style={footer}>
              If you didn't create an account, you can safely ignore this email.
            </Text>
          </Section>
        </Container>
      </Section>
    </Body>
  </Html>
)

export default SignupEmail

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
