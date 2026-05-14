/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Html, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'
import { s, BrandHeader, BrandFooter, RmbcBlock } from './brand-styles.ts'

interface Props {
  name?: string
  daysLeft?: number
  billingUrl?: string
}

const TrialEndingEmail = ({ name, daysLeft = 3, billingUrl = 'https://photobrief.ai/settings/billing' }: Props) => {
  const greeting = name ? `${name}, your trial ends ${daysLeft === 1 ? 'tomorrow' : `in ${daysLeft} days`}.` : `Your trial ends ${daysLeft === 1 ? 'tomorrow' : `in ${daysLeft} days`}.`
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>{greeting} Add a card to keep your intake link live.</Preview>
      <Body style={s.main}>
        <Section style={s.outerPad}>
          <Container style={s.container}>
            <BrandHeader />
            <Section style={s.body}>
              <RmbcBlock code="01" label="HEADS UP" first>
                <Heading style={s.h1}>{greeting}</Heading>
                <Text style={s.text}>
                  When your 14-day trial ends, your public intake link stops accepting new submissions until you pick a plan. Existing briefs stay safe.
                </Text>
              </RmbcBlock>
              <RmbcBlock code="02" label="KEEP GOING">
                <Text style={s.text}>
                  Add a card now and stay on Smart Intake — $79/mo, or $59/mo if you grab a founding-partner seat.
                </Text>
                <Section style={{ marginTop: 16 }}>
                  <Button href={billingUrl} style={s.button}>Choose a plan</Button>
                </Section>
              </RmbcBlock>
              <RmbcBlock code="03" label="QUESTIONS">
                <Text style={s.textSmall}>
                  Reply to this email — it goes to a real person. We'll help you pick the right tier.
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
  component: TrialEndingEmail,
  subject: (data: Record<string, any>) =>
    data?.daysLeft === 1
      ? 'Your PhotoBrief trial ends tomorrow'
      : `Your PhotoBrief trial ends in ${data?.daysLeft ?? 3} days`,
  displayName: 'Trial ending nudge',
  previewData: { name: 'Alex', daysLeft: 3, billingUrl: 'https://photobrief.ai/settings/billing' },
} satisfies TemplateEntry
