/**
 * Design-system schema — the only allowed presentation primitives for
 * every page in the app (marketing, app, admin, auth).
 *
 * Components do not accept className overrides; visual variance is opt-in
 * via fixed enum props. Anything that needs custom layout positioning
 * composes plain divs INSIDE these primitives.
 *
 * See docs/layout-system.md for the migration recipe.
 */

import {
  type ReactNode,
  type ButtonHTMLAttributes,
  type AnchorHTMLAttributes,
  type ElementType,
  forwardRef,
} from "react";
import type { LucideIcon } from "lucide-react";
import { CheckCircle2 } from "lucide-react";

import "./schema.css";

/* ───────────────── Section ───────────────── */

type SectionTone = "paper" | "alt" | "dark";
type SectionSize = "default" | "tight";
type SectionDensity = "marketing" | "page";

interface SectionProps {
  tone?: SectionTone;
  size?: SectionSize;
  /** marketing = airy editorial padding (default). page = compact app padding. */
  density?: SectionDensity;
  id?: string;
  children: ReactNode;
}

export function Section({
  tone = "paper",
  size = "default",
  density = "marketing",
  id,
  children,
}: SectionProps) {
  const cls = [
    "ls-section",
    tone === "alt" && "ls-section--alt",
    tone === "dark" && "ls-section--dark",
    size === "tight" && "ls-section--tight",
    density === "page" && "ls-section--page",
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <section id={id} className={cls}>
      {children}
    </section>
  );
}

/* ───────────────── Container ───────────────── */

type ContainerWidth = "default" | "narrow" | "reading" | "full";

interface ContainerProps {
  width?: ContainerWidth;
  children: ReactNode;
}

export function Container({ width = "default", children }: ContainerProps) {
  const cls =
    width === "narrow"
      ? "ls-container--narrow"
      : width === "reading"
        ? "ls-container--reading"
        : width === "full"
          ? "ls-container--full"
          : "ls-container";
  return <div className={cls}>{children}</div>;
}

/* ───────────────── Stack ───────────────── */

interface StackProps {
  gap?: "compact" | "default" | "relaxed";
  children: ReactNode;
}

/** Vertical rhythm between page modules. */
export function Stack({ gap = "default", children }: StackProps) {
  return <div className={`ls-stack ls-stack--${gap}`}>{children}</div>;
}

/* ───────────────── Type ───────────────── */

export function Eyebrow({ children }: { children: ReactNode }) {
  return <span className="ls-eyebrow">{children}</span>;
}

interface TitleProps {
  level?: 1 | 2 | 3;
  id?: string;
  children: ReactNode;
}

export function Title({ level = 2, id, children }: TitleProps) {
  const Tag = `h${level}` as ElementType;
  return (
    <Tag id={id} className={`ls-h${level}`}>
      {children}
    </Tag>
  );
}

export function Subtitle({ children }: { children: ReactNode }) {
  return <p className="ls-subtitle">{children}</p>;
}

interface BodyProps {
  size?: "sm" | "md" | "lg";
  children: ReactNode;
}

export function Body({ size = "md", children }: BodyProps) {
  return <p className={`ls-body-${size}`}>{children}</p>;
}

/* ───────────────── SectionHeader ───────────────── */

interface SectionHeaderProps {
  eyebrow?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  /** Right-aligned actions (buttons, links). */
  actions?: ReactNode;
  level?: 2 | 3;
  align?: "start" | "center";
}

/**
 * SectionHeader — heading row used at the top of in-app sections, with
 * an optional right-aligned actions slot ("Customers" + "Add customer").
 */
export function SectionHeader({
  eyebrow,
  title,
  description,
  actions,
  level = 2,
  align = "start",
}: SectionHeaderProps) {
  const HeadingTag = `h${level}` as ElementType;
  const headingClass = level === 3 ? "ls-h3" : "ls-h2";
  return (
    <header
      className={`ls-section-header ${align === "center" ? "ls-section-header--center" : ""}`}
    >
      <div className="ls-section-header__text">
        {eyebrow ? <span className="ls-eyebrow">{eyebrow}</span> : null}
        {title ? <HeadingTag className={`${headingClass} mt-3`}>{title}</HeadingTag> : null}
        {description ? <p className="ls-subtitle mt-3">{description}</p> : null}
      </div>
      {actions ? <div className="ls-section-header__actions">{actions}</div> : null}
    </header>
  );
}

/* ───────────────── Card ───────────────── */

type CardVariant = "paper" | "dark" | "muted" | "outline";
type CardPadding = "none" | "sm" | "md" | "lg";

interface CardProps {
  variant?: CardVariant;
  /** Legacy alias for variant="dark" / paper. */
  tone?: "paper" | "dark";
  elevated?: boolean;
  padding?: CardPadding;
  id?: string;
  children: ReactNode;
}

export function Card({
  variant,
  tone,
  elevated,
  padding = "md",
  id,
  children,
}: CardProps) {
  const resolved: CardVariant = variant ?? tone ?? "paper";
  const cls = [
    "ls-card",
    `ls-card--${resolved}`,
    `ls-card--p-${padding}`,
    elevated && "ls-card--elevated",
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <div id={id} className={cls}>
      {children}
    </div>
  );
}

/* ───────────────── Grid ───────────────── */

type GridCols = 1 | 2 | 3 | 4 | "sidebar" | "aside";

interface GridProps {
  cols?: GridCols;
  gap?: "sm" | "md" | "lg";
  children: ReactNode;
}

export function Grid({ cols = 3, gap = "md", children }: GridProps) {
  const colsClass =
    cols === "sidebar"
      ? "ls-grid-sidebar"
      : cols === "aside"
        ? "ls-grid-aside"
        : `ls-grid-${cols}`;
  return <div className={`ls-grid ${colsClass} ls-grid--${gap}`}>{children}</div>;
}

/* ───────────────── Prose ───────────────── */

/** Single-column reading container for legal/help/long-form copy. */
export function Prose({ children }: { children: ReactNode }) {
  return <div className="ls-prose">{children}</div>;
}

/* ───────────────── CTAs ───────────────── */

export function CTAGroup({
  children,
  align = "start",
}: {
  children: ReactNode;
  align?: "start" | "center";
}) {
  return (
    <div className={`ls-cta-group ${align === "center" ? "justify-center" : ""}`}>
      {children}
    </div>
  );
}

type CTAVariant = "primary" | "secondary" | "quiet";
type CTASize = "md" | "lg";

interface CTABaseProps {
  variant?: CTAVariant;
  size?: CTASize;
  children: ReactNode;
}

type CTAButtonProps = CTABaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className"> & { href?: undefined };

type CTALinkProps = CTABaseProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "className"> & { href: string };

export type CTAProps = CTAButtonProps | CTALinkProps;

function ctaClasses(variant: CTAVariant, size: CTASize) {
  return ["ls-cta", `ls-cta--${size}`, `ls-cta-${variant}`].join(" ");
}

export const CTA = forwardRef<HTMLButtonElement | HTMLAnchorElement, CTAProps>(
  ({ variant = "primary", size = "md", children, ...rest }, ref) => {
    const className = ctaClasses(variant, size);
    if ("href" in rest && rest.href !== undefined) {
      const { href, ...anchor } = rest as CTALinkProps;
      return (
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          className={className}
          {...anchor}
        >
          {children}
        </a>
      );
    }
    const buttonProps = rest as CTAButtonProps;
    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type={buttonProps.type ?? "button"}
        className={className}
        {...buttonProps}
      >
        {children}
      </button>
    );
  },
);
CTA.displayName = "CTA";

/* ───────────────── Wizard ───────────────── */

export interface WizardStep {
  id: string;
  shortTitle: string;
  title?: string;
  icon?: LucideIcon;
}

interface WizardProps {
  steps: WizardStep[];
  currentIndex: number;
  onStepChange?: (index: number) => void;
  intro?: ReactNode;
  railTitle?: ReactNode;
  railDescription?: ReactNode;
  footer?: ReactNode;
  header?: ReactNode;
  children: ReactNode;
}

/**
 * Wizard — guided multi-step setup scaffold. Desktop: left rail
 * stepper + right content panel. Mobile: stacked.
 */
export function Wizard({
  steps,
  currentIndex,
  onStepChange,
  intro,
  railTitle,
  railDescription,
  footer,
  header,
  children,
}: WizardProps) {
  const progress = Math.round(((currentIndex + 1) / steps.length) * 100);
  return (
    <div className="ls-wizard">
      {intro}
      <div className="ls-wizard__shell">
        <aside className="ls-wizard__rail">
          {railTitle ? <h2 className="ls-wizard__rail-title">{railTitle}</h2> : null}
          {railDescription ? (
            <p className="ls-wizard__rail-description">{railDescription}</p>
          ) : null}
          <div className="ls-wizard__progress">
            <div className="ls-wizard__progress-bar" style={{ width: `${progress}%` }} />
          </div>
          <nav className="ls-wizard__steps" aria-label="Wizard steps">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentIndex;
              const isDone = index < currentIndex;
              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => onStepChange?.(index)}
                  className={`ls-wizard__step ${isActive ? "is-active" : ""} ${isDone ? "is-done" : ""}`}
                >
                  <span className="ls-wizard__step-marker">
                    {isDone ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : Icon ? (
                      <Icon className="h-4 w-4" />
                    ) : (
                      index + 1
                    )}
                  </span>
                  <span className="ls-wizard__step-text">
                    <span className="ls-wizard__step-title">{step.shortTitle}</span>
                    <span className="ls-wizard__step-meta">Step {index + 1}</span>
                  </span>
                </button>
              );
            })}
          </nav>
        </aside>
        <div className="ls-wizard__content">
          {header ? <div className="ls-wizard__header">{header}</div> : null}
          <div>{children}</div>
          {footer ? <div className="ls-wizard__footer">{footer}</div> : null}
        </div>
      </div>
    </div>
  );
}
