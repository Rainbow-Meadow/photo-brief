/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Html, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'
import { s, BrandHeader, BrandFooter, RmbcBlock } from './brand-styles.ts'

interface Props {
  visitorName?: string
  serviceType?: string
  brief?: { title: string; introMessage?: string; steps: { title: string; instruction: string }[] }
  reviewUrl?: string
  ctaUrl?: string
  isFounderCopy?: boolean
}

const DemoBriefDeliveryEmail = ({
  visitorName, serviceType, brief, reviewUrl, ctaUrl, isFounderCopy,
}: Props) => {
  const greet = isFounderCopy
    ? `New PhotoBrief demo: ${serviceType ?? 'unknown service'}`
    : visitorName ? `Here's your sample brief, ${visitorName}.` : `Here's your sample brief.`
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>{isFounderCopy ? `Demo lead — ${serviceType}` : 'Your PhotoBrief sample brief is ready.'}</Preview>
      <Body style={s.main}>
        <Section style={s.outerPad}>
          <Container style={s.container}>
            <BrandHeader />
            <Section style={s.body}>
              <RmbcBlock code="01" label="RESEARCH" first>
                <Heading style={s.h1}>{greet}</Heading>
                <Text style={s.text}>
                  {isFounderCopy
                    ? `A visitor just walked through the demo for "${serviceType}". Their photos and the AI-generated brief are below.`
                    : `Below is the photo brief PhotoBrief built for "${serviceType ?? 'your business'}" — exactly the experience your customers would walk through.`}
                </Text>
              </RmbcBlock>
              {brief ? (
                <RmbcBlock code="02" label="THE BRIEF">
                  <Heading style={{ ...s.h1, fontSize: 18, marginBottom: 8 }}>{brief.title}</Heading>
                  {brief.introMessage ? <Text style={s.text}>{brief.introMessage}</Text> : null}
                  {brief.steps.map((st, i) => (
                    <Text key={i} style={{ ...s.text, marginBottom: 8 }}>
                      <strong>{i + 1}. {st.title}</strong> — {st.instruction}
                    </Text>
                  ))}
                  {reviewUrl ? (
                    <Text style={s.text}>
                      Full submission with photos: <a href={reviewUrl}>{reviewUrl}</a>
                    </Text>
                  ) : null}
                </RmbcBlock>
              ) : null}
              {!isFounderCopy ? (
                <RmbcBlock code="03" label="NEXT STEP">
                  <Text style={s.text}>
                    Want PhotoBrief sending real briefs like this for your customers? Spin up a workspace in 60 seconds.
                  </Text>
                  <Button href={ctaUrl ?? 'https://photobrief.ai/signup'} style={s.button}>
                    Start free
                  </Button>
                </RmbcBlock>
              ) : null}
            </Section>
            <BrandFooter extra={isFounderCopy ? 'Internal demo notification' : undefined} />
          </Container>
        </Section>
      </Body>
    </Html>
  )
}

export const template = {
  component: DemoBriefDeliveryEmail,
  subject: (data: Record<string, any>) =>
    data?.isFounderCopy
      ? `New PhotoBrief demo lead — ${data?.serviceType ?? 'unknown'}`
      : `Your sample PhotoBrief is ready${data?.serviceType ? ` — ${data.serviceType}` : ''}`,
  displayName: 'Demo brief delivery',
  previewData: {
    visitorName: 'Sam',
    serviceType: 'Plumbing',
    brief: {
      title: 'Leaking faucet inspection',
      introMessage: 'A few quick photos of the leak so we can quote accurately.',
      steps: [
        { title: 'Wide shot of the faucet', instruction: 'Stand back and capture the whole faucet area.' },
        { title: 'Close-up of the drip', instruction: 'Get close to where water is coming out.' },
        { title: 'Shut-off valve', instruction: 'Photograph the valve under the sink.' },
      ],
    },
    reviewUrl: 'https://photobrief.ai/submissions/demo',
    ctaUrl: 'https://photobrief.ai/signup',
  },
} satisfies TemplateEntry
