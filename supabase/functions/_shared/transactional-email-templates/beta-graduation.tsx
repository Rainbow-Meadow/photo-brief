/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'
import { s, BrandHeader, BrandFooter, RmbcBlock, CTAButton } from './brand-styles.ts'

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
      detail: 'Pro tier, permanently. No invoice, no strings.',
      subtext: 'Not a trial. Yours for as long as PhotoBrief exists.',
    }
  }
  if (duration === 'perpetuity') {
    return {
      headline: `${discount}% OFF — LOCKED IN PERMANENTLY`,
      detail: `${discount}% off standard pricing for as long as you stay on a paid plan.`,
      subtext: 'No expiration. No bait-and-switch.',
    }
  }
  return {
    headline: `${discount}% OFF YEAR ONE`,
    detail: `${discount}% off standard pricing for the first 12 months after launch.`,
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
    ? `Beta is closing, ${name}.`
    : 'Beta is closing — your founding partner reward is ready.'
  const cta = billingUrl || 'https://photobrief.ai/dashboard/settings/billing'
  const dateStr = transitionDate || 'soon'
  const reward = rewardCopy(discount, discountDuration)
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>Your founding partner reward is ready — here&apos;s what happens next.</Preview>
      <Body style={s.main}>
        <Section style={s.outerPad}>
          <Container style={s.container}>
            <BrandHeader />
            <Section style={s.body}>
              <RmbcBlock code="01" label="RESEARCH" first>
                <Text style={s.meta}>STATUS · BETA → LAUNCH</Text>
                <Heading style={s.h1}>{greeting}</Heading>
                <Text style={s.text}>
                  The PhotoBrief beta is wrapping up. Your input shaped what
                  ships next — thank you.
                </Text>
                <Text style={s.meta}>REQUESTS CREATED · {requestsCreated}</Text>
                <Text style={s.meta}>SUBMISSIONS RECEIVED · {submissionsCompleted}</Text>
                <Text style={s.meta}>GUIDES BUILT · {templatesCreated}</Text>
              </RmbcBlock>
              <RmbcBlock code="02" label="MECHANISM · YOUR REWARD">
                <Text style={s.meta}>{reward.headline}</Text>
                <Text style={s.text}>{reward.detail}</Text>
                <Text style={s.textSmall}>{reward.subtext}</Text>
              </RmbcBlock>
              {discountDuration !== 'free-pro' ? (
                <RmbcBlock code="03" label="BRIEF">
                  <Text style={s.text}>
                    Your account transitions to a paid plan on{' '}
                    <strong>{dateStr}</strong>. Pick the plan that fits your
                    volume — your founding partner discount applies automatically.
                  </Text>
                  <CTAButton href={cta}>Choose your plan</CTAButton>
                </RmbcBlock>
              ) : (
                <RmbcBlock code="03" label="BRIEF">
                  <Text style={s.text}>
                    Your Pro plan is already active. No action needed. Adjust
                    anytime in Settings → Billing.
                  </Text>
                </RmbcBlock>
              )}
              <RmbcBlock code="04" label="CLOSE">
                <Text style={s.textSmall}>
                  Questions on which plan fits? Reply — we&apos;ll walk through
                  it with you.
                </Text>
              </RmbcBlock>
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
  subject: "Beta is closing — your founding partner reward is ready",
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
