/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'
import { BRAND, s, BrandHeader, BrandFooter, RmbcBlock } from './brand-styles.ts'

interface Props {
  name?: string
  email?: string
  business_name?: string | null
  business_type?: string | null
  website?: string | null
  use_case?: string | null
  estimated_monthly_requests?: string | null
  notes?: string | null
  source?: string | null
  created_at?: string
}

const Row = ({ label, value }: { label: string; value?: string | null }) => {
  if (!value) return null
  return React.createElement(Text, { style: rowStyle },
    React.createElement('span', { style: labelStyle }, label),
    React.createElement('span', { style: valueStyle }, value),
  )
}

const WaitlistAdminEmail = (props: Props) => {
  const {
    name, email, business_name, business_type, website,
    use_case, estimated_monthly_requests, notes, source, created_at,
  } = props
  const headline = business_name || name || email || 'New signup'
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>New PhotoBrief waitlist signup: {headline}</Preview>
      <Body style={s.main}>
        <Section style={s.outerPad}>
          <Container style={s.container}>
            <BrandHeader />
            <Section style={s.body}>
              <RmbcBlock code="01" label="RESEARCH · NEW SIGNUP" first>
                <Heading style={s.h1}>{headline}</Heading>
                <Row label="NAME" value={name} />
                <Row label="EMAIL" value={email} />
                <Row label="BUSINESS TYPE" value={business_type} />
                <Row label="WEBSITE" value={website} />
                <Row label="EST. MONTHLY REQUESTS" value={estimated_monthly_requests} />
                <Row label="SOURCE" value={source} />
                <Row label="SIGNED UP" value={created_at} />
              </RmbcBlock>
              {use_case ? (
                <RmbcBlock code="02" label="USE CASE">
                  <Text style={blockText}>{use_case}</Text>
                </RmbcBlock>
              ) : null}
              {notes ? (
                <RmbcBlock code="03" label="NOTES">
                  <Text style={blockText}>{notes}</Text>
                </RmbcBlock>
              ) : null}
            </Section>
            <BrandFooter />
          </Container>
        </Section>
      </Body>
    </Html>
  )
}

export const template = {
  component: WaitlistAdminEmail,
  subject: (data: Record<string, any>) => {
    const who = data?.business_name || data?.name || data?.email || 'unknown'
    return `New waitlist signup: ${who}`
  },
  displayName: 'Waitlist admin notification',
  previewData: {
    name: 'Alex Morgan',
    email: 'alex@acme.com',
    business_name: 'Acme Roofing',
    business_type: 'Roofing',
    website: 'https://acme.com',
    use_case: 'Collect post-install photos from crews on the road.',
    estimated_monthly_requests: '50-100',
    notes: 'Heard about us via Twitter.',
    source: 'web',
    created_at: new Date().toISOString(),
  },
} satisfies TemplateEntry

const rowStyle = { fontSize: '13px', color: BRAND.colors.ink, margin: '0 0 6px', display: 'block' as const }
const labelStyle = { display: 'inline-block', minWidth: '180px', color: BRAND.colors.muted, fontWeight: 700, fontSize: '11px', textTransform: 'uppercase' as const, letterSpacing: '0.14em', fontFamily: BRAND.monoFamily }
const valueStyle = { color: BRAND.colors.ink, fontSize: '14px' }
const blockText = { fontSize: '14px', color: BRAND.colors.ink, lineHeight: '1.55', whiteSpace: 'pre-wrap' as const, margin: '0 0 8px' }
