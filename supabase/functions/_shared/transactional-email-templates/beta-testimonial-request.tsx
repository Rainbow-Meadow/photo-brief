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

const BetaTestimonialRequestEmail = ({ name }: Props) => {
  const greeting = name ? `Would you share a quick word, ${name}?` : 'Would you share a quick word about PhotoBrief?'
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>You've been using PhotoBrief on real workflows — a short testimonial would mean a lot.</Preview>
      <Body style={s.main}>
        <Section style={s.outerPad}>
          <Container style={s.container}>
            <BrandHeader />
            <Section style={s.body}>
              <Text style={s.eyebrow}>FOUNDING PARTNER</Text>
              <Heading style={s.h1}>{greeting}</Heading>
              <Text style={s.text}>
                You've been using PhotoBrief on real workflows for a while now, and it
                looks like it's working well for your team. That's great to hear.
              </Text>
              <Text style={s.text}>
                We're getting ready to open up to more businesses, and a short
                testimonial from someone who's actually used it would mean a lot.
                Nothing fancy — just a sentence or two about:
              </Text>
              <Section style={s.card}>
                <Text style={{ ...s.text, fontSize: '14px', margin: '0 0 8px' }}>
                  <span style={{ color: BRAND.colors.cta, fontWeight: 700 }}>→</span> What problem PhotoBrief solved for you
                </Text>
                <Text style={{ ...s.text, fontSize: '14px', margin: '0' }}>
                  <span style={{ color: BRAND.colors.cta, fontWeight: 700 }}>→</span> How it compared to however you handled photos before
                </Text>
              </Section>
              <Text style={{ ...s.text, fontStyle: 'italic', color: BRAND.colors.muted }}>
                Example: "We used to chase customers for photos over text. Now we send
                a PhotoBrief link and get exactly what we need back, organized and
                reviewed."
              </Text>
              <Text style={s.text}>
                If you're open to it, you can reply to this email with a quote, or we
                can draft something based on your usage and you can approve or edit it.
              </Text>
              <Text style={s.text}>
                As a founding beta partner, we'd also love to feature your business
                name (with your permission) when we launch. No obligation.
              </Text>
              <Hr style={s.hr} />
              <Text style={s.textSmall}>
                Thanks for considering it.
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
  component: BetaTestimonialRequestEmail,
  subject: 'Would you share a quick word about PhotoBrief?',
  displayName: 'Beta testimonial request',
  previewData: { name: 'Alex' },
} satisfies TemplateEntry
