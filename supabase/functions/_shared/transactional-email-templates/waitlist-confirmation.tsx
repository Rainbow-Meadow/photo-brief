/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Hr, Html, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'
import { BRAND, s, BrandHeader, BrandFooter } from './brand-styles.ts'

interface Props { name?: string }

const WaitlistConfirmationEmail = ({ name }: Props) => {
  const firstName = name ? name.trim().split(/\s+/)[0] : ''
  const greeting = firstName ? `You're on the list, ${firstName}.` : `You're on the list.`
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>Thanks for joining PhotoBrief — here's what happens next.</Preview>
      <Body style={s.main}>
        <Section style={s.outerPad}>
          <Container style={s.container}>
            <BrandHeader />
            <Section style={s.body}>
              <Text style={s.eyebrow}>WAITLIST</Text>
              <Heading style={s.h1}>{greeting}</Heading>
              <Text style={s.text}>
                Thanks for requesting access. PhotoBrief is invite-only right
                now so we can give every new business hands-on onboarding — no
                spam, no auto-drip, just a personal note when your seat is ready.
              </Text>
              <Section style={s.card}>
                <Text style={{ ...s.text, margin: '0 0 8px', fontWeight: 600, color: BRAND.colors.primary, fontSize: '13px' }}>
                  What happens next
                </Text>
                <Text style={{ ...s.text, fontSize: '14px', margin: '0 0 6px' }}>
                  <span style={{ color: BRAND.colors.cta, fontWeight: 700 }}>1.</span> We review your signup (usually within a couple of business days).
                </Text>
                <Text style={{ ...s.text, fontSize: '14px', margin: '0 0 6px' }}>
                  <span style={{ color: BRAND.colors.cta, fontWeight: 700 }}>2.</span> You'll get a personal invite email with a one-click access link.
                </Text>
                <Text style={{ ...s.text, fontSize: '14px', margin: '0' }}>
                  <span style={{ color: BRAND.colors.cta, fontWeight: 700 }}>3.</span> We'll walk you through setting up your first photo request.
                </Text>
              </Section>
              <Section style={s.ctaWrap}>
                <Button href="https://photobrief.ai" style={s.button}>Visit photobrief.ai</Button>
              </Section>
              <Hr style={s.hr} />
              <Text style={s.textSmall}>
                Questions or want to jump the line? Just reply — it goes straight to the team.
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
  component: WaitlistConfirmationEmail,
  subject: "You're on the PhotoBrief waitlist",
  displayName: 'Waitlist confirmation',
  previewData: { name: 'Alex Morgan' },
} satisfies TemplateEntry
