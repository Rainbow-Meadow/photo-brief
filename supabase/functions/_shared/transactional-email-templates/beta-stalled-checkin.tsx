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

const BetaStalledCheckinEmail = ({ name }: Props) => {
  const greeting = name ? `Still there, ${name}?` : 'Still there?'
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>It's been a little while — just checking in on your PhotoBrief account.</Preview>
      <Body style={s.main}>
        <Section style={s.outerPad}>
          <Container style={s.container}>
            <BrandHeader />
            <Section style={s.body}>
              <Text style={s.eyebrow}>CHECK-IN</Text>
              <Heading style={s.h1}>{greeting}</Heading>
              <Text style={s.text}>
                We noticed it's been a little while since your last activity on
                PhotoBrief. No pressure — we know things get busy.
              </Text>
              <Text style={s.text}>
                Just wanted to check:
              </Text>
              <Section style={s.card}>
                <Text style={{ ...s.text, fontSize: '14px', margin: '0 0 8px', fontWeight: 600, color: BRAND.colors.primary }}>
                  Did you hit a snag?
                </Text>
                <Text style={{ ...s.text, fontSize: '14px', margin: '0 0 16px' }}>
                  If something didn't work or felt confusing, let us know. That's
                  exactly what beta is for.
                </Text>
                <Text style={{ ...s.text, fontSize: '14px', margin: '0 0 8px', fontWeight: 600, color: BRAND.colors.primary }}>
                  Timing not right?
                </Text>
                <Text style={{ ...s.text, fontSize: '14px', margin: '0 0 16px' }}>
                  If your workflow is seasonal or you're between jobs, totally fine.
                  Your account isn't going anywhere.
                </Text>
                <Text style={{ ...s.text, fontSize: '14px', margin: '0 0 8px', fontWeight: 600, color: BRAND.colors.primary }}>
                  Need a different template?
                </Text>
                <Text style={{ ...s.text, fontSize: '14px', margin: '0' }}>
                  If the current setup doesn't match your workflow, we can help you
                  build one that does.
                </Text>
              </Section>
              <Text style={s.text}>
                If PhotoBrief isn't the right fit for your business, that's useful
                feedback too — just let us know and we'll close things out cleanly.
              </Text>
              <Hr style={s.hr} />
              <Text style={s.textSmall}>
                Either way, a quick reply helps us understand where things stand.
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
  component: BetaStalledCheckinEmail,
  subject: 'Checking in on your PhotoBrief account',
  displayName: 'Beta stalled user check-in',
  previewData: { name: 'Alex' },
} satisfies TemplateEntry
