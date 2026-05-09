/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Button, Container, Hr, Link, Section, Text } from 'npm:@react-email/components@0.0.22'

// ─── PhotoBrief.ai Email Brand System — Field Manual (white canvas) ──
// Inbox-safe translation of the editorial system used in the app.
// White body, 1px hairlines, monospace plate codes, amber-only accent.

export const BRAND = {
  name: 'PhotoBrief.ai',
  tagline: 'GUIDE · CAPTURE · CLOSE',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  monoFamily: 'ui-monospace, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
  colors: {
    canvas: '#FFFFFF',
    surface: '#FFFFFF',
    ink: '#141412',
    body: '#3A3A36',
    muted: '#7A7A72',
    rule: 'rgba(20,20,18,0.12)',
    accent: '#F2A33A',
    accentInk: '#1A1208',
    accentSoft: '#FBE6BD',
    // ─── Legacy aliases (kept so templates can keep importing the old keys) ─
    bg: '#FFFFFF',
    primary: '#141412',
    secondary: '#3A3A36',
    border: 'rgba(20,20,18,0.12)',
    cta: '#F2A33A',
    ctaHover: '#D88A20',
    darkBg: '#141412',
    darkSurface: '#FFFFFF',
  },
} as const

// ─── Shared inline style objects ─────────────────────────────────────

export const s = {
  main: {
    backgroundColor: BRAND.colors.canvas,
    fontFamily: BRAND.fontFamily,
    margin: 0,
    padding: 0,
  },
  outerPad: {
    backgroundColor: BRAND.colors.canvas,
    padding: '32px 16px',
  },
  container: {
    maxWidth: '600px',
    margin: '0 auto',
    backgroundColor: BRAND.colors.surface,
    border: `1px solid ${BRAND.colors.rule}`,
    borderRadius: '2px',
  },
  header: {
    padding: '20px 28px 16px',
    borderBottom: `1px solid ${BRAND.colors.rule}`,
  },
  wordmarkRow: {
    margin: 0,
    fontSize: '20px',
    fontWeight: 700,
    color: BRAND.colors.ink,
    letterSpacing: '-0.01em',
    lineHeight: '1',
  },
  wordmarkAccent: {
    color: BRAND.colors.accent,
  },
  tagline: {
    margin: '8px 0 0',
    fontFamily: BRAND.monoFamily,
    fontSize: '10px',
    color: BRAND.colors.muted,
    letterSpacing: '0.22em',
    textTransform: 'uppercase' as const,
  },
  body: {
    padding: '4px 28px 8px',
  },
  block: {
    padding: '24px 0 8px',
    borderTop: `1px solid ${BRAND.colors.rule}`,
  },
  blockFirst: {
    padding: '24px 0 8px',
  },
  plate: {
    fontFamily: BRAND.monoFamily,
    fontSize: '11px',
    letterSpacing: '0.18em',
    textTransform: 'uppercase' as const,
    color: BRAND.colors.muted,
    margin: '0 0 14px',
    lineHeight: '1',
  },
  plateCode: {
    color: BRAND.colors.accent,
    fontWeight: 700,
  },
  // ── Legacy: eyebrow used in older templates ──
  eyebrow: {
    fontFamily: BRAND.monoFamily,
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.18em',
    color: BRAND.colors.accent,
    textTransform: 'uppercase' as const,
    margin: '0 0 14px',
  },
  h1: {
    fontSize: '22px',
    fontWeight: 600,
    color: BRAND.colors.ink,
    margin: '0 0 14px',
    lineHeight: '1.25',
    letterSpacing: '-0.01em',
  },
  text: {
    fontSize: '15px',
    color: BRAND.colors.body,
    lineHeight: '1.6',
    margin: '0 0 14px',
  },
  textSmall: {
    fontSize: '13px',
    color: BRAND.colors.muted,
    lineHeight: '1.55',
    margin: '0 0 10px',
  },
  meta: {
    fontFamily: BRAND.monoFamily,
    fontSize: '11px',
    letterSpacing: '0.12em',
    textTransform: 'uppercase' as const,
    color: BRAND.colors.muted,
    margin: '0 0 10px',
  },
  ctaWrap: {
    margin: '18px 0 22px',
  },
  button: {
    backgroundColor: BRAND.colors.accent,
    color: BRAND.colors.accentInk,
    borderRadius: '2px',
    padding: '14px 24px',
    fontFamily: BRAND.monoFamily,
    fontSize: '13px',
    fontWeight: 700,
    letterSpacing: '0.14em',
    textTransform: 'uppercase' as const,
    textDecoration: 'none',
    display: 'inline-block',
    border: `1px solid ${BRAND.colors.accent}`,
  },
  link: {
    color: BRAND.colors.ink,
    textDecoration: 'underline',
    textDecorationColor: BRAND.colors.accent,
    wordBreak: 'break-all' as const,
  },
  monoLink: {
    fontFamily: BRAND.monoFamily,
    fontSize: '12px',
    color: BRAND.colors.body,
    textDecoration: 'underline',
    textDecorationColor: BRAND.colors.accent,
    wordBreak: 'break-all' as const,
  },
  // ── Legacy "card" maps to a hairline box now ──
  card: {
    border: `1px solid ${BRAND.colors.rule}`,
    backgroundColor: BRAND.colors.surface,
    padding: '16px 18px',
    margin: '6px 0 18px',
    borderRadius: '2px',
  },
  list: {
    margin: '4px 0 16px',
  },
  listItem: {
    fontFamily: BRAND.monoFamily,
    fontSize: '13px',
    color: BRAND.colors.body,
    lineHeight: '1.6',
    margin: '0 0 6px',
  },
  hr: {
    border: 'none',
    borderTop: `1px solid ${BRAND.colors.rule}`,
    margin: '20px 0 16px',
  },
  footer: {
    padding: '18px 28px 22px',
    borderTop: `1px solid ${BRAND.colors.rule}`,
  },
  footerText: {
    fontFamily: BRAND.monoFamily,
    fontSize: '11px',
    color: BRAND.colors.muted,
    letterSpacing: '0.08em',
    margin: '0',
    textTransform: 'uppercase' as const,
  },
  footerTagline: {
    fontFamily: BRAND.monoFamily,
    fontSize: '10px',
    color: BRAND.colors.muted,
    letterSpacing: '0.22em',
    textTransform: 'uppercase' as const,
    margin: '6px 0 0',
  },
} as const

// ─── Reusable layout components ──────────────────────────────────────

export const BrandHeader = () =>
  React.createElement(Section, { style: s.header },
    React.createElement(Text, { style: s.wordmarkRow },
      'Photo',
      React.createElement('span', { style: s.wordmarkAccent }, 'Brief'),
    ),
    React.createElement(Text, { style: s.tagline }, BRAND.tagline),
  )

export const BrandFooter = ({ extra }: { extra?: string } = {}) =>
  React.createElement(Section, { style: s.footer },
    React.createElement(Text, { style: s.footerText },
      extra ? `${extra}  ·  ` : '',
      `Sent via ${BRAND.name}`,
    ),
    React.createElement(Text, { style: s.footerTagline }, BRAND.tagline),
  )

// Plate-code header for an RMBC block — `[ 02 ]  RESEARCH`
export const PlateCode = ({ code, label }: { code: string; label: string }) =>
  React.createElement(Text, { style: s.plate },
    React.createElement('span', { style: s.plateCode }, `[ ${code} ]`),
    `\u00A0\u00A0${label}`,
  )

// Wrap an RMBC block with top-hairline + plate code, then children.
export const RmbcBlock = ({
  code,
  label,
  first,
  children,
}: {
  code: string
  label: string
  first?: boolean
  children: React.ReactNode
}) =>
  React.createElement(Section, { style: first ? s.blockFirst : s.block },
    React.createElement(PlateCode, { code, label }),
    children,
  )

export const CTAButton = ({ href, children }: { href: string; children: React.ReactNode }) =>
  React.createElement(Section, { style: s.ctaWrap },
    React.createElement(Button, { href, style: s.button }, children as any),
  )

export const Divider = () =>
  React.createElement(Hr, { style: s.hr })

export const MonoLink = ({ href, children }: { href: string; children?: React.ReactNode }) =>
  React.createElement(Link, { href, style: s.monoLink }, (children ?? href) as any)
