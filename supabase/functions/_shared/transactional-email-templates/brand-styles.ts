/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Container, Hr, Img, Section, Text } from 'npm:@react-email/components@0.0.22'

// ─── PhotoBrief.ai Email Brand System ───────────────────────────────
// Cream + navy + amber palette matching the new logo identity.

const LOGO_URL = 'https://mvlcefiygkzzewcdzsmj.supabase.co/storage/v1/object/public/email-assets/mark-color.png'

export const BRAND = {
  name: 'PhotoBrief.ai',
  tagline: 'Guide · Capture · Close',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  logoUrl: LOGO_URL,
  colors: {
    bg: '#FAF7F2',           // cream
    surface: '#FFFFFF',
    primary: '#1B2A4A',      // navy text
    secondary: '#3F4A66',    // softer navy body text
    border: 'rgba(27,42,74,0.10)',
    cta: '#F2A33A',          // amber CTA
    ctaHover: '#D88A20',
    accent: '#F2A33A',
    muted: '#6B7691',
    darkBg: '#10172A',
    darkSurface: '#FAF7F2',
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
    border: `1px solid ${BRAND.colors.border}`,
    overflow: 'hidden' as const,
    boxShadow: '0 32px 80px -56px rgba(27,42,74,0.30), 0 16px 48px -32px rgba(27,42,74,0.18)',
  },
  header: {
    padding: '28px 32px 20px',
    borderBottom: `1px solid ${BRAND.colors.border}`,
  },
  wordmark: {
    fontSize: '18px',
    fontWeight: 700,
    color: BRAND.colors.primary,
    letterSpacing: '-0.02em',
    margin: '0',
    lineHeight: '1',
  },
  logo: {
    height: '40px',
    width: '40px',
  },
  body: {
    padding: '28px 32px 32px',
  },
  eyebrow: {
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.16em',
    color: BRAND.colors.cta,
    textTransform: 'uppercase' as const,
    margin: '0 0 14px',
  },
  h1: {
    fontSize: '24px',
    fontWeight: 700,
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
    fontWeight: 700,
    textDecoration: 'none',
    display: 'inline-block',
    textAlign: 'center' as const,
  },
  ctaWrap: {
    margin: '24px 0 20px',
  },
  link: {
    color: BRAND.colors.primary,
    textDecoration: 'underline',
    wordBreak: 'break-all' as const,
  },
  card: {
    backgroundColor: '#FBF6EC',
    border: `1px solid ${BRAND.colors.border}`,
    borderRadius: '12px',
    padding: '20px 22px',
    margin: '8px 0 20px',
  },
  hr: {
    borderColor: BRAND.colors.border,
    margin: '24px 0 20px',
  },
  footer: {
    padding: '20px 32px 28px',
    borderTop: `1px solid ${BRAND.colors.border}`,
  },
  footerText: {
    fontSize: '12px',
    color: BRAND.colors.muted,
    lineHeight: '1.5',
    margin: '0',
  },
  tagline: {
    fontSize: '10px',
    color: BRAND.colors.muted,
    letterSpacing: '0.22em',
    textTransform: 'uppercase' as const,
    margin: '4px 0 0',
  },
} as const

// ─── Reusable layout components ─────────────────────────────────────

export const BrandHeader = () =>
  React.createElement(Section, { style: s.header },
    React.createElement(Img, {
      src: BRAND.logoUrl,
      alt: BRAND.name,
      height: '40',
      width: '40',
      style: { height: '40px', width: '40px' },
    }),
  )

export const BrandFooter = ({ extra }: { extra?: string }) =>
  React.createElement(Section, { style: s.footer },
    React.createElement(Text, { style: s.footerText },
      extra ? `${extra} · ` : '',
      `Sent via ${BRAND.name}`,
    ),
    React.createElement(Text, { style: s.tagline }, BRAND.tagline),
  )
