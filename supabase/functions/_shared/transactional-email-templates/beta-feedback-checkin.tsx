/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Hr, Html, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'
import { BRAND, s, BrandHeader, BrandFooter } from './brand-styles.ts'

interface Props {
  name?: string
}

const BetaFeedbackCheckinEmail = ({ name }: Props) => {
  const greeting = name ? `Quick check-in, ${name}.` : 'Quick check-in.'
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>You've been using PhotoBrief for two weeks — we'd love to hear how it's going.</Preview>
      <Body style={s.main}>
        <Section style={s.outerPad}>
          <Container style={s.container}>
            <BrandHeader />
            <Section style={s.body}>
              <Text style={s.eyebrow}>FEEDBACK</Text>
              <Heading style={s.h1}>{greeting}</Heading>
              <Text style={s.text}>
                You've been using PhotoBrief for a couple of weeks now, and we'd love
                to hear how it's going.
              </Text>
              <Text style={s.text}>
                A few things we're curious about:
              </Text>
              <Section style={s.card}>
                <Text style={{ ...s.text, fontSize: '14px', margin: '0 0 8px' }}>
                  <span style={{ color: BRAND.colors.cta, fontWeight: 700 }}>→</span> Are your customers actually completing the photo requests?
                </Text>
                <Text style={{ ...s.text, fontSize: '14px', margin: '0 0 8px' }}>
                  <span style={{ color: BRAND.colors.cta, fontWeight: 700 }}>→</span> Is the AI feedback on photos helpful, or is it getting in the way?
                </Text>
                <Text style={{ ...s.text, fontSize: '14px', margin: '0' }}>
                  <span style={{ color: BRAND.colors.cta, fontWeight: 700 }}>→</span> Anything missing that would make this more useful day-to-day?
                </Text>
              </Section>
              <Text style={s.text}>
                You can reply directly to this email — it goes to a real person, not a
                form. Even a one-line answer helps.
              </Text>
              <Text style={s.text}>
                If you've hit a wall or something isn't working, we especially want to
                hear about that. Beta is when we fix things.
              </Text>
              <Hr style={s.hr} />
              <Text style={s.textSmall}>
                Thanks for being part of this.
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
  component: BetaFeedbackCheckinEmail,
  subject: "Quick check-in — how's PhotoBrief working?",
  displayName: 'Beta two-week feedback check-in',
  previewData: { name: 'Alex' },
} satisfies TemplateEntry
