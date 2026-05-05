/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Html, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'
import { BRAND, s, BrandHeader, BrandFooter } from './brand-styles.ts'

interface Props {
  name?: string
  dashboardUrl?: string
}

const WorkspaceWelcomeEmail = ({ name, dashboardUrl }: Props) => {
  const greeting = name ? `Welcome, ${name}!` : 'Welcome to PhotoBrief!'
  const cta = dashboardUrl || 'https://photobrief.ai/dashboard'
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>Your PhotoBrief workspace is ready.</Preview>
      <Body style={s.main}>
        <Section style={s.outerPad}>
          <Container style={s.container}>
            <BrandHeader />
            <Section style={s.body}>
              <Heading style={s.h1}>{greeting}</Heading>
              <Text style={s.text}>
                Your workspace is ready. PhotoBrief helps you collect customer photos
                without the back-and-forth — send a guided link, recipients capture
                the right shots, and you get organized submissions in your inbox.
              </Text>
              <Text style={s.text}>
                Start by creating your first photo request or browsing the guide
                library to find a template that fits your workflow.
              </Text>
              <Section style={s.ctaWrap}>
                <Button href={cta} style={s.button}>Open your dashboard</Button>
              </Section>
              <Text style={s.textSmall}>
                Questions? Just reply to this email — we read every message.
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
  component: WorkspaceWelcomeEmail,
  subject: 'Welcome to PhotoBrief',
  displayName: 'Workspace welcome',
  previewData: {
    name: 'Alex',
    dashboardUrl: 'https://photobrief.ai/dashboard',
  },
} satisfies TemplateEntry
