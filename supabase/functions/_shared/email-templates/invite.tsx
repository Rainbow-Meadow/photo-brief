/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface InviteEmailProps {
  siteName: string
  siteUrl: string
  confirmationUrl: string
}

const LOGO_URL = 'https://mvlcefiygkzzewcdzsmj.supabase.co/storage/v1/object/public/email-assets/mark-color.png'

export const InviteEmail = ({
  siteName,
  siteUrl,
  confirmationUrl,
}: InviteEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>You've been invited to join {siteName}</Preview>
    <Body style={main}>
      <Section style={outerPad}>
        <Container style={container}>
          <Section style={header}>
            <Img src={LOGO_URL} alt="PhotoBrief.ai" height="40" width="40" style={{ height: '40px', width: '40px' }} />
          </Section>
          <Section style={body}>
            <Heading style={h1}>You've been invited</Heading>
            <Text style={text}>
              You've been invited to join{' '}
              <Link href={siteUrl} style={link}>
                <strong>{siteName}</strong>
              </Link>
              . Click the button below to accept the invitation and create your
              account.
            </Text>
            <Section style={ctaWrap}>
              <Button style={button} href={confirmationUrl}>
                Accept Invitation
              </Button>
            </Section>
            <Text style={footer}>
              If you weren't expecting this invitation, you can safely ignore this
              email.
            </Text>
          </Section>
        </Container>
      </Section>
    </Body>
  </Html>
)

export default InviteEmail

const main = { backgroundColor: '#FAF7F2', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }
const outerPad = { backgroundColor: '#FAF7F2', padding: '40px 0' }
const container = { maxWidth: '560px', margin: '0 auto', backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid rgba(27,42,74,0.10)', overflow: 'hidden' as const, boxShadow: '0 32px 80px -56px rgba(27,42,74,0.30), 0 16px 48px -32px rgba(27,42,74,0.18)' }
const header = { padding: '28px 32px 20px', borderBottom: '1px solid rgba(207,178,255,0.14)' }
const body = { padding: '28px 32px 32px' }
const h1 = { fontSize: '24px', fontWeight: 600 as const, color: '#1B2A4A', margin: '0 0 16px', lineHeight: '1.25' }
const text = { fontSize: '15px', color: '#3F4A66', lineHeight: '1.6', margin: '0 0 16px' }
const link = { color: '#1B2A4A', textDecoration: 'underline' }
const ctaWrap = { margin: '24px 0 20px' }
const button = { backgroundColor: '#F2A33A', color: '#ffffff', fontSize: '15px', fontWeight: 600, borderRadius: '10px', padding: '14px 28px', textDecoration: 'none' }
const footer = { fontSize: '12px', color: '#6B7691', margin: '24px 0 0' }
