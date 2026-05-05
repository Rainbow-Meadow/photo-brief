/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Container, Hr, Section, Text } from 'npm:@react-email/components@0.0.22'

// ─── PhotoBrief.ai Email Brand System ───────────────────────────────
// Shared palette, typography, and layout primitives for all emails.

export const BRAND = {
  name: 'PhotoBrief.ai',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  colors: {
    bg: '#F8F7FA',
    surface: '#FFFFFF',
    primary: '#111014',
    secondary: '#625F68',
    border: '#E1DEE7',
    cta: '#7C3AED',
    ctaHover: '#6D28D9',
    accent: '#A78BFA',
    muted: '#94909C',
    darkBg: '#060507',
    darkSurface: '#15131A',
  },
} as const

// ─── Shared inline style objects ────────────────────────────────────

export const s = {
  main: {
    backgroundColor: '#ffffff',
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
  },
  header: {
    padding: '28px 32px 20px',
    borderBottom: `1px solid ${BRAND.colors.border}`,
  },
  wordmark: {
    fontSize: '18px',
    fontWeight: 700,
    color: BRAND.colors.cta,
    letterSpacing: '-0.02em',
    margin: '0',
    lineHeight: '1',
  },
  body: {
    padding: '28px 32px 32px',
  },
  eyebrow: {
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.1em',
    color: BRAND.colors.cta,
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
    color: BRAND.colors.cta,
    textDecoration: 'underline',
    wordBreak: 'break-all' as const,
  },
  card: {
    backgroundColor: BRAND.colors.bg,
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
} as const

// ─── Reusable layout components ─────────────────────────────────────

export const BrandHeader = () =>
  React.createElement(Section, { style: s.header },
    React.createElement(Text, { style: s.wordmark }, BRAND.name),
  )

export const BrandFooter = ({ extra }: { extra?: string }) =>
  React.createElement(Section, { style: s.footer },
    React.createElement(Text, { style: s.footerText },
      extra ? `${extra} · ` : '',
      `Sent via ${BRAND.name}`,
    ),
  )
