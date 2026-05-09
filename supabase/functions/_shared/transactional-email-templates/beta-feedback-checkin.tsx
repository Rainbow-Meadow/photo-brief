/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'
import { s, BrandHeader, BrandFooter, RmbcBlock } from './brand-styles.ts'

interface Props {
  name?: string
}

const BetaFeedbackCheckinEmail = ({ name }: Props) => {
  const greeting = name ? `Two-week check-in, ${name}.` : 'Two-week check-in.'
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>You&apos;ve been on PhotoBrief for two weeks — three quick questions.</Preview>
      <Body style={s.main}>
        <Section style={s.outerPad}>
          <Container style={s.container}>
            <BrandHeader />
            <Section style={s.body}>
              <RmbcBlock code="01" label="RESEARCH" first>
                <Heading style={s.h1}>{greeting}</Heading>
                <Text style={s.text}>
                  Two weeks in is when patterns start showing up. We want to know
                  what&apos;s working and what&apos;s in the way before we ship the
                  next round of changes.
                </Text>
              </RmbcBlock>
              <RmbcBlock code="02" label="BRIEF">
                <Text style={s.listItem}>→&nbsp;&nbsp;ARE CUSTOMERS COMPLETING THE PHOTO REQUESTS</Text>
                <Text style={s.listItem}>→&nbsp;&nbsp;IS THE AI FEEDBACK HELPFUL OR IN THE WAY</Text>
                <Text style={s.listItem}>→&nbsp;&nbsp;ANYTHING MISSING FOR YOUR DAY-TO-DAY</Text>
                <Text style={s.text}>
                  Reply to this email — it goes to a real person, not a form. Even
                  a one-line answer to one question helps.
                </Text>
              </RmbcBlock>
              <RmbcBlock code="03" label="CLOSE">
                <Text style={s.textSmall}>
                  If something is broken, we especially want to hear about it.
                  Beta is when we fix things.
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
  component: BetaFeedbackCheckinEmail,
  subject: "Quick check-in — how's PhotoBrief working?",
  displayName: 'Beta two-week feedback check-in',
  previewData: { name: 'Alex' },
} satisfies TemplateEntry
