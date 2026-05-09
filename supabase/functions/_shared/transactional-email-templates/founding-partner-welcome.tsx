/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'
import { s, BrandHeader, BrandFooter, RmbcBlock, CTAButton } from './brand-styles.ts'

interface Props {
  name?: string
  dashboardUrl?: string
}

const FoundingPartnerWelcomeEmail = ({ name, dashboardUrl }: Props) => {
  const greeting = name ? `Welcome, ${name}.` : 'Welcome to the inner circle.'
  const cta = dashboardUrl || 'https://photobrief.ai/dashboard'
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>Welcome to the PhotoBrief Founding Partner beta.</Preview>
      <Body style={s.main}>
        <Section style={s.outerPad}>
          <Container style={s.container}>
            <BrandHeader />
            <Section style={s.body}>
              <RmbcBlock code="01" label="RESEARCH" first>
                <Text style={s.meta}>STATUS · FOUNDING PARTNER · COHORT 01</Text>
                <Heading style={s.h1}>{greeting}</Heading>
                <Text style={s.text}>
                  You&apos;re one of a small group of businesses with early access
                  to PhotoBrief. This isn&apos;t a mass rollout — every partner
                  gets hands-on setup and a direct line to the team.
                </Text>
              </RmbcBlock>
              <RmbcBlock code="02" label="MECHANISM">
                <Text style={s.listItem}>→&nbsp;&nbsp;HANDS-ON ONBOARDING TAILORED TO YOUR WORKFLOW</Text>
                <Text style={s.listItem}>→&nbsp;&nbsp;DIRECT LINE FOR SUPPORT AND FEEDBACK</Text>
                <Text style={s.listItem}>→&nbsp;&nbsp;EARLY ACCESS TO EVERY NEW FEATURE</Text>
                <Text style={s.listItem}>→&nbsp;&nbsp;TIERED REWARDS UP TO FREE PRO FOR LIFE</Text>
              </RmbcBlock>
              <RmbcBlock code="03" label="BRIEF">
                <Text style={s.text}>
                  Open the dashboard to set up your first guide and send your first
                  request.
                </Text>
                <CTAButton href={cta}>Open PhotoBrief.ai</CTAButton>
              </RmbcBlock>
              <RmbcBlock code="04" label="CLOSE">
                <Text style={s.textSmall}>
                  Reply anytime — every message reaches a real person on the team.
                  We&apos;re here to make this work for your business.
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
  component: FoundingPartnerWelcomeEmail,
  subject: 'Welcome to the PhotoBrief Founding Partner beta',
  displayName: 'Founding Partner welcome',
  previewData: {
    name: 'Alex',
    dashboardUrl: 'https://photobrief.ai/dashboard',
  },
} satisfies TemplateEntry
