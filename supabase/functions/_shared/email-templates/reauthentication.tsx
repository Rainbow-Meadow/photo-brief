/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface ReauthenticationEmailProps {
  token: string
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your verification code</Preview>
    <Body style={main}>
      <Section style={outerPad}>
        <Container style={container}>
          <Section style={header}>
            <Text style={wordmark}>PhotoBrief.ai</Text>
          </Section>
          <Section style={body}>
            <Heading style={h1}>Confirm reauthentication</Heading>
            <Text style={text}>Use the code below to confirm your identity:</Text>
            <Text style={codeStyle}>{token}</Text>
            <Text style={footer}>
              This code will expire shortly. If you didn't request this, you can
              safely ignore this email.
            </Text>
          </Section>
        </Container>
      </Section>
    </Body>
  </Html>
)

export default ReauthenticationEmail

const main = { backgroundColor: '#ffffff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }
const outerPad = { backgroundColor: '#F8F7FA', padding: '40px 0' }
const container = { maxWidth: '560px', margin: '0 auto', backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E1DEE7', overflow: 'hidden' as const }
const header = { padding: '28px 32px 20px', borderBottom: '1px solid #E1DEE7' }
const wordmark = { fontSize: '18px', fontWeight: 700, color: '#7C3AED', letterSpacing: '-0.02em', margin: '0', lineHeight: '1' }
const body = { padding: '28px 32px 32px' }
const h1 = { fontSize: '24px', fontWeight: 600 as const, color: '#111014', margin: '0 0 16px', lineHeight: '1.25' }
const text = { fontSize: '15px', color: '#625F68', lineHeight: '1.6', margin: '0 0 16px' }
const codeStyle = { fontFamily: 'Courier, monospace', fontSize: '28px', fontWeight: 700 as const, color: '#7C3AED', margin: '0 0 30px', letterSpacing: '0.1em' }
const footer = { fontSize: '12px', color: '#94909C', margin: '24px 0 0' }
