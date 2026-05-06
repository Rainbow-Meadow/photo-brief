/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Hr, Html, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'
import { BRAND, s, BrandHeader, BrandFooter } from './brand-styles.ts'

type DiscountDuration = 'perpetuity' | 'first-year' | 'free-pro'

interface Props {
  name?: string
  discount?: string
  discountDuration?: DiscountDuration
  requestsCreated?: string
  submissionsCompleted?: string
  templatesCreated?: string
  transitionDate?: string
  billingUrl?: string
}

function rewardCopy(discount: string, duration: DiscountDuration) {
  if (duration === 'free-pro') {
    return {
      headline: 'FREE PRO FOR LIFE',
      detail: "You've earned free Pro — permanently. No invoice, no strings.",
      subtext: "This isn't a trial. It's yours for as long as PhotoBrief exists.",
    }
  }
  if (duration === 'perpetuity') {
    return {
      headline: `${discount}% OFF — LOCKED IN PERMANENTLY`,
      detail: `${discount}% off standard pricing — for as long as you stay on a paid plan`,
      subtext: 'No expiration. No bait-and-switch.',
    }
  }
  // first-year
  return {
    headline: `${discount}% OFF YOUR FIRST YEAR`,
    detail: `${discount}% off standard pricing for your first 12 months after launch`,
    subtext: 'Applies automatically when you choose a plan.',
  }
}

const BetaGraduationEmail = ({
  name,
  discount = '50',
  discountDuration = 'first-year',
  requestsCreated = '0',
  submissionsCompleted = '0',
  templatesCreated = '0',
  transitionDate,
  billingUrl,
}: Props) => {
  const greeting = name
    ? `Beta's wrapping up, ${name}.`
    : "Beta's wrapping up — here's your founding partner reward."
  const cta = billingUrl || 'https://photobrief.ai/dashboard/settings/billing'
  const dateStr = transitionDate || 'soon'
  const reward = rewardCopy(discount, discountDuration)
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>Your founding partner reward is ready — here's what happens next.</Preview>
      <Body style={s.main}>
        <Section style={s.outerPad}>
          <Container style={s.container}>
            <BrandHeader />
            <Section style={s.body}>
              <Text style={s.eyebrow}>FOUNDING PARTNER</Text>
              <Heading style={s.h1}>{greeting}</Heading>
              <Text style={s.text}>
                The PhotoBrief beta is coming to a close, and your input has been a
                real part of shaping this product. Thank you.
              </Text>
              <Section style={s.card}>
                <Text style={{ ...s.text, margin: '0 0 8px', fontWeight: 600, color: BRAND.colors.primary, fontSize: '13px' }}>
                  {reward.headline}
                </Text>
                <Text style={{ ...s.text, fontSize: '14px', margin: '0 0 6px' }}>
                  <span style={{ color: BRAND.colors.cta, fontWeight: 700 }}>{reward.detail}</span>
                </Text>
                <Text style={{ ...s.text, fontSize: '13px', margin: '0', color: BRAND.colors.muted }}>
                  {reward.subtext}
                </Text>
              </Section>
              <Section style={s.card}>
                <Text style={{ ...s.text, margin: '0 0 8px', fontWeight: 600, color: BRAND.colors.primary, fontSize: '13px' }}>
                  YOUR USAGE DURING BETA
                </Text>
                <Text style={{ ...s.text, fontSize: '14px', margin: '0 0 4px' }}>
                  <span style={{ color: BRAND.colors.cta, fontWeight: 700 }}>→</span> {requestsCreated} requests created
                </Text>
                <Text style={{ ...s.text, fontSize: '14px', margin: '0 0 4px' }}>
                  <span style={{ color: BRAND.colors.cta, fontWeight: 700 }}>→</span> {submissionsCompleted} submissions received
                </Text>
                <Text style={{ ...s.text, fontSize: '14px', margin: '0' }}>
                  <span style={{ color: BRAND.colors.cta, fontWeight: 700 }}>→</span> {templatesCreated} templates built
                </Text>
              </Section>
              {discountDuration !== 'free-pro' && (
                <>
                  <Text style={s.text}>
                    Your account will transition to a paid plan on <strong style={{ color: BRAND.colors.primary }}>{dateStr}</strong>.
                    You can pick the plan that fits your volume in Settings → Billing.
                    Your founding partner discount applies automatically.
                  </Text>
                  <Section style={s.ctaWrap}>
                    <Button href={cta} style={s.button}>Choose Your Plan</Button>
                  </Section>
                </>
              )}
              {discountDuration === 'free-pro' && (
                <Text style={s.text}>
                  Your Pro plan is already active — no action needed. If you ever want to
                  adjust your plan, you can do that in Settings → Billing.
                </Text>
              )}
              <Hr style={s.hr} />
              <Text style={s.textSmall}>
                If you have questions about which plan makes sense, just reply — we'll
                walk through it with you.
              </Text>
            </Section>
            <BrandFooter />
          </Container>
        </Section>
      </Body>
    </Html>
  )
}

export const template = {
  component: BetaGraduationEmail,
  subject: "Beta's wrapping up — here's your founding partner reward",
  displayName: 'Beta graduation / launch pricing',
  previewData: {
    name: 'Alex',
    discount: '75',
    discountDuration: 'perpetuity',
    requestsCreated: '24',
    submissionsCompleted: '18',
    templatesCreated: '3',
    transitionDate: 'July 15, 2026',
    billingUrl: 'https://photobrief.ai/dashboard/settings/billing',
  },
} satisfies TemplateEntry
