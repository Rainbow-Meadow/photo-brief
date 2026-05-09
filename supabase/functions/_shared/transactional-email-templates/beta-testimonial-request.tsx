/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'
import { BRAND, s, BrandHeader, BrandFooter, RmbcBlock } from './brand-styles.ts'

interface Props {
  name?: string
}

const BetaTestimonialRequestEmail = ({ name }: Props) => {
  const greeting = name ? `Would you share a quick word, ${name}?` : 'Would you share a quick word?'
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>You&apos;ve been using PhotoBrief on real workflows — a short testimonial would mean a lot.</Preview>
      <Body style={s.main}>
        <Section style={s.outerPad}>
          <Container style={s.container}>
            <BrandHeader />
            <Section style={s.body}>
              <RmbcBlock code="01" label="RESEARCH" first>
                <Text style={s.meta}>STATUS · FOUNDING PARTNER</Text>
                <Heading style={s.h1}>{greeting}</Heading>
                <Text style={s.text}>
                  PhotoBrief has been running on real jobs in your workspace, and
                  the numbers say it&apos;s working. We&apos;re opening to more
                  businesses soon, and a sentence from someone who actually used
                  it carries more weight than anything we can say.
                </Text>
              </RmbcBlock>
              <RmbcBlock code="02" label="BRIEF">
                <Text style={s.listItem}>→&nbsp;&nbsp;WHAT PROBLEM PHOTOBRIEF SOLVED FOR YOU</Text>
                <Text style={s.listItem}>→&nbsp;&nbsp;HOW IT COMPARED TO HOW YOU HANDLED PHOTOS BEFORE</Text>
                <Text style={{ ...s.text, fontStyle: 'italic', color: BRAND.colors.muted }}>
                  Example: &ldquo;We used to chase customers for photos over text.
                  Now we send a PhotoBrief link and get exactly what we need back,
                  organized and reviewed.&rdquo;
                </Text>
                <Text style={s.text}>
                  Reply with a quote, or we can draft something from your usage
                  for you to approve.
                </Text>
              </RmbcBlock>
              <RmbcBlock code="03" label="CLOSE">
                <Text style={s.textSmall}>
                  With your permission, we&apos;d love to feature your business
                  name at launch. No obligation either way.
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
  component: BetaTestimonialRequestEmail,
  subject: 'Would you share a quick word about PhotoBrief?',
  displayName: 'Beta testimonial request',
  previewData: { name: 'Alex' },
} satisfies TemplateEntry
