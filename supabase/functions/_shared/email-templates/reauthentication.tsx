/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface ReauthenticationEmailProps {
  token: string
}

const LOGO_URL = 'https://mvlcefiygkzzewcdzsmj.supabase.co/storage/v1/object/public/email-assets/horizontal-light.png'

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your verification code</Preview>
    <Body style={main}>
      <Section style={outerPad}>
        <Container style={container}>
          <Section style={header}>
            <Img src={LOGO_URL} alt="PhotoBrief.ai" height="36" style={{ height: '36px', width: 'auto' }} />
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

const main = { backgroundColor: '#0c0915', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }
const outerPad = { backgroundColor: '#0c0915', padding: '40px 0' }
const container = { maxWidth: '560px', margin: '0 auto', backgroundColor: '#15121f', borderRadius: '16px', border: '1px solid rgba(207,178,255,0.14)', overflow: 'hidden' as const, boxShadow: '0 36px 92px -70px rgba(143,99,255,0.50), 0 20px 64px -48px rgba(0,0,0,0.82)' }
const header = { padding: '28px 32px 20px', borderBottom: '1px solid rgba(207,178,255,0.14)' }
const body = { padding: '28px 32px 32px' }
const h1 = { fontSize: '24px', fontWeight: 600 as const, color: '#f8f5ff', margin: '0 0 16px', lineHeight: '1.25' }
const text = { fontSize: '15px', color: 'rgba(255,255,255,0.68)', lineHeight: '1.6', margin: '0 0 16px' }
const codeStyle = { fontFamily: 'Courier, monospace', fontSize: '28px', fontWeight: 700 as const, color: '#b98cff', margin: '0 0 30px', letterSpacing: '0.1em' }
const footer = { fontSize: '12px', color: 'rgba(255,255,255,0.50)', margin: '24px 0 0' }
