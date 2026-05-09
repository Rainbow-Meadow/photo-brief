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

const BetaStalledCheckinEmail = ({ name }: Props) => {
  const greeting = name ? `Still there, ${name}?` : 'Still there?'
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>It&apos;s been a little while — checking in on your PhotoBrief account.</Preview>
      <Body style={s.main}>
        <Section style={s.outerPad}>
          <Container style={s.container}>
            <BrandHeader />
            <Section style={s.body}>
              <RmbcBlock code="01" label="RESEARCH" first>
                <Heading style={s.h1}>{greeting}</Heading>
                <Text style={s.text}>
                  Your account has been quiet for a stretch. No pressure — we know
                  the work cycles. We just want to know which of these is true.
                </Text>
              </RmbcBlock>
              <RmbcBlock code="02" label="BRIEF">
                <Text style={s.listItem}>→&nbsp;&nbsp;HIT A SNAG — TELL US WHAT BROKE</Text>
                <Text style={s.listItem}>→&nbsp;&nbsp;TIMING IS OFF — SEASON OR BACKLOG</Text>
                <Text style={s.listItem}>→&nbsp;&nbsp;NEED A DIFFERENT GUIDE FOR YOUR WORKFLOW</Text>
                <Text style={s.listItem}>→&nbsp;&nbsp;NOT THE RIGHT FIT — WE&apos;LL CLOSE THINGS OUT CLEANLY</Text>
                <Text style={s.text}>
                  A one-line reply tells us where you stand. That&apos;s all we
                  need.
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
  component: BetaStalledCheckinEmail,
  subject: 'Checking in on your PhotoBrief account',
  displayName: 'Beta stalled user check-in',
  previewData: { name: 'Alex' },
} satisfies TemplateEntry
