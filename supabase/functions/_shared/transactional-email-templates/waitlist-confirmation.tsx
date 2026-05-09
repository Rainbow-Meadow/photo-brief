/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'
import { s, BrandHeader, BrandFooter, RmbcBlock } from './brand-styles.ts'

interface Props { name?: string }

const WaitlistConfirmationEmail = ({ name }: Props) => {
  const firstName = name ? name.trim().split(/\s+/)[0] : ''
  const greeting = firstName ? `You're on the list, ${firstName}.` : `You're on the list.`
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>Thanks for joining the PhotoBrief waitlist — here&apos;s what happens next.</Preview>
      <Body style={s.main}>
        <Section style={s.outerPad}>
          <Container style={s.container}>
            <BrandHeader />
            <Section style={s.body}>
              <RmbcBlock code="01" label="RESEARCH" first>
                <Text style={s.meta}>STATUS · WAITLIST · ACCEPTED</Text>
                <Heading style={s.h1}>{greeting}</Heading>
                <Text style={s.text}>
                  PhotoBrief is invite-only right now so every new business gets
                  hands-on onboarding. No spam, no auto-drip — just a personal
                  note when your seat opens.
                </Text>
              </RmbcBlock>
              <RmbcBlock code="02" label="MECHANISM">
                <Text style={s.listItem}>[ 01 ]&nbsp;&nbsp;WE REVIEW YOUR SIGNUP — USUALLY WITHIN A FEW BUSINESS DAYS</Text>
                <Text style={s.listItem}>[ 02 ]&nbsp;&nbsp;YOU GET A PERSONAL INVITE WITH A ONE-CLICK ACCESS LINK</Text>
                <Text style={s.listItem}>[ 03 ]&nbsp;&nbsp;WE WALK YOU THROUGH YOUR FIRST PHOTO REQUEST</Text>
              </RmbcBlock>
              <RmbcBlock code="03" label="CLOSE">
                <Text style={s.textSmall}>
                  Questions or want to jump the line? Reply to this email — it
                  reaches the team directly.
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
  component: WaitlistConfirmationEmail,
  subject: "You're on the PhotoBrief waitlist",
  displayName: 'Waitlist confirmation',
  previewData: { name: 'Alex Morgan' },
} satisfies TemplateEntry
