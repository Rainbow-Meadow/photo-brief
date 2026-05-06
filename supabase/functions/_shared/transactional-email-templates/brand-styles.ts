/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Container, Hr, Img, Section, Text } from 'npm:@react-email/components@0.0.22'

// ─── PhotoBrief.ai Email Brand System ───────────────────────────────
// Dark navy + purple/lavender palette matching the landing page.

const LOGO_URL = 'https://mvlcefiygkzzewcdzsmj.supabase.co/storage/v1/object/public/email-assets/horizontal-light.png'

export const BRAND = {
  name: 'PhotoBrief.ai',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  logoUrl: LOGO_URL,
  colors: {
    bg: '#0c0915',
    surface: '#15121f',
    primary: '#f8f5ff',
    secondary: '#ffffffad',       // rgba(255,255,255,0.68)
    border: '#cfb2ff24',          // rgba(207,178,255,0.14)
    cta: '#8f63ff',
    ctaHover: '#b98cff',
    accent: '#b98cff',
    muted: '#ffffff80',           // rgba(255,255,255,0.50)
    darkBg: '#07050d',
    darkSurface: '#0c0915',
  },
} as const

// ─── Shared inline style objects ────────────────────────────────────

export const s = {
  main: {
    backgroundColor: BRAND.colors.bg,
    fontFamily: BRAND.fontFamily,
  },
  outerPad: {
    backgroundColor: BRAND.colors.bg,
    padding: '40px 0',
  },
  container: {
    maxWidth: '560px',
    margin: '0 auto',
    backgroundColor: BRAND.colors.surface,
    borderRadius: '16px',
    border: `1px solid rgba(207,178,255,0.14)`,
    overflow: 'hidden' as const,
    boxShadow: '0 36px 92px -70px rgba(143,99,255,0.50), 0 20px 64px -48px rgba(0,0,0,0.82)',
  },
  header: {
    padding: '28px 32px 20px',
    borderBottom: '1px solid rgba(207,178,255,0.14)',
  },
  wordmark: {
    fontSize: '18px',
    fontWeight: 700,
    color: BRAND.colors.cta,
    letterSpacing: '-0.02em',
    margin: '0',
    lineHeight: '1',
  },
  logo: {
    height: '36px',
    width: 'auto',
  },
  body: {
    padding: '28px 32px 32px',
  },
  eyebrow: {
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.1em',
    color: BRAND.colors.accent,
    textTransform: 'uppercase' as const,
    margin: '0 0 14px',
  },
  h1: {
    fontSize: '24px',
    fontWeight: 600,
    color: BRAND.colors.primary,
    margin: '0 0 16px',
    lineHeight: '1.25',
  },
  text: {
    fontSize: '15px',
    color: BRAND.colors.secondary,
    lineHeight: '1.6',
    margin: '0 0 16px',
  },
  textSmall: {
    fontSize: '13px',
    color: BRAND.colors.muted,
    lineHeight: '1.5',
    margin: '0 0 12px',
  },
  button: {
    backgroundColor: BRAND.colors.cta,
    color: '#ffffff',
    borderRadius: '10px',
    padding: '14px 28px',
    fontSize: '15px',
    fontWeight: 600,
    textDecoration: 'none',
    display: 'inline-block',
    textAlign: 'center' as const,
  },
  ctaWrap: {
    margin: '24px 0 20px',
  },
  link: {
    color: BRAND.colors.accent,
    textDecoration: 'underline',
    wordBreak: 'break-all' as const,
  },
  card: {
    backgroundColor: '#1b1726',
    border: '1px solid rgba(207,178,255,0.12)',
    borderRadius: '12px',
    padding: '20px 22px',
    margin: '8px 0 20px',
  },
  hr: {
    borderColor: 'rgba(207,178,255,0.14)',
    margin: '24px 0 20px',
  },
  footer: {
    padding: '20px 32px 28px',
    borderTop: '1px solid rgba(207,178,255,0.14)',
  },
  footerText: {
    fontSize: '12px',
    color: BRAND.colors.muted,
    lineHeight: '1.5',
    margin: '0',
  },
} as const

// ─── Reusable layout components ─────────────────────────────────────

export const BrandHeader = () =>
  React.createElement(Section, { style: s.header },
    React.createElement(Img, {
      src: BRAND.logoUrl,
      alt: BRAND.name,
      height: '36',
      style: s.logo,
    }),
  )

export const BrandFooter = ({ extra }: { extra?: string }) =>
  React.createElement(Section, { style: s.footer },
    React.createElement(Text, { style: s.footerText },
      extra ? `${extra} · ` : '',
      `Sent via ${BRAND.name}`,
    ),
  )
