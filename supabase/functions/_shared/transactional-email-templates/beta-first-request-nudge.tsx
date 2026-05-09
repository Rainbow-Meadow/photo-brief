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

const BetaFirstRequestNudgeEmail = ({ name, dashboardUrl }: Props) => {
  const greeting = name ? `Ready for your first send, ${name}?` : 'Ready for your first send?'
  const cta = dashboardUrl || 'https://photobrief.ai/dashboard/requests/new'
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>Your account is set up — here&apos;s the fastest way to send your first request.</Preview>
      <Body style={s.main}>
        <Section style={s.outerPad}>
          <Container style={s.container}>
            <BrandHeader />
            <Section style={s.body}>
              <RmbcBlock code="01" label="RESEARCH" first>
                <Heading style={s.h1}>{greeting}</Heading>
                <Text style={s.text}>
                  Your workspace has been live for a few days, but no PhotoBrief
                  has gone out yet. The value clicks the moment a real customer
                  sends photos back.
                </Text>
              </RmbcBlock>
              <RmbcBlock code="02" label="MECHANISM">
                <Text style={s.listItem}>[ 01 ]&nbsp;&nbsp;REQUESTS → NEW REQUEST</Text>
                <Text style={s.listItem}>[ 02 ]&nbsp;&nbsp;PICK A GUIDE OR LET AI BUILD ONE</Text>
                <Text style={s.listItem}>[ 03 ]&nbsp;&nbsp;ENTER CUSTOMER NAME + EMAIL OR PHONE</Text>
                <Text style={s.listItem}>[ 04 ]&nbsp;&nbsp;SEND</Text>
              </RmbcBlock>
              <RmbcBlock code="03" label="BRIEF">
                <Text style={s.text}>
                  Try it on a live job if you can — that&apos;s where the loop
                  pays off. The whole flow takes about two minutes.
                </Text>
                <CTAButton href={cta}>Create your first request</CTAButton>
              </RmbcBlock>
              <RmbcBlock code="04" label="CLOSE">
                <Text style={s.textSmall}>
                  Stuck picking a guide? Reply and we&apos;ll set one up with you.
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
  component: BetaFirstRequestNudgeEmail,
  subject: 'Ready to send your first PhotoBrief?',
  displayName: 'Beta first request nudge',
  previewData: {
    name: 'Alex',
    dashboardUrl: 'https://photobrief.ai/dashboard/requests/new',
  },
} satisfies TemplateEntry
