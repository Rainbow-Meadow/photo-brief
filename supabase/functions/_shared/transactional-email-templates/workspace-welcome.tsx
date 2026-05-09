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

const WorkspaceWelcomeEmail = ({ name, dashboardUrl }: Props) => {
  const greeting = name ? `Welcome, ${name}.` : 'Welcome to PhotoBrief.'
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
              <RmbcBlock code="01" label="RESEARCH" first>
                <Heading style={s.h1}>{greeting}</Heading>
                <Text style={s.text}>
                  Your workspace is provisioned. PhotoBrief replaces the
                  back-and-forth photo chase with a guided capture link your
                  customers can finish in two minutes.
                </Text>
              </RmbcBlock>
              <RmbcBlock code="02" label="MECHANISM">
                <Text style={s.listItem}>[ 01 ]&nbsp;&nbsp;PICK A GUIDE OR BUILD ONE WITH AI</Text>
                <Text style={s.listItem}>[ 02 ]&nbsp;&nbsp;ENTER A CUSTOMER NAME + EMAIL OR PHONE</Text>
                <Text style={s.listItem}>[ 03 ]&nbsp;&nbsp;SEND — REVIEWED PHOTOS LAND IN YOUR DASHBOARD</Text>
              </RmbcBlock>
              <RmbcBlock code="03" label="BRIEF">
                <Text style={s.text}>
                  Open the dashboard to send your first request.
                </Text>
                <CTAButton href={cta}>Open dashboard</CTAButton>
              </RmbcBlock>
              <RmbcBlock code="04" label="CLOSE">
                <Text style={s.textSmall}>
                  Reply to this email anytime — it goes straight to the team.
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
  component: WorkspaceWelcomeEmail,
  subject: 'Welcome to PhotoBrief',
  displayName: 'Workspace welcome',
  previewData: {
    name: 'Alex',
    dashboardUrl: 'https://photobrief.ai/dashboard',
  },
} satisfies TemplateEntry
