/**
 * Landing schema — the only allowed presentation primitives for the
 * landing page. Components do not accept className overrides; visual
 * variance is opt-in via fixed enum props (tone, variant, size, level).
 *
 * Anything that needs custom layout positioning composes plain divs
 * INSIDE these primitives.
 */

import {
  type ReactNode,
  type ButtonHTMLAttributes,
  type AnchorHTMLAttributes,
  type ElementType,
  forwardRef,
} from "react";

import "./schema.css";

type SectionTone = "paper" | "alt" | "dark";
type SectionSize = "default" | "tight";

interface SectionProps {
  tone?: SectionTone;
  size?: SectionSize;
  id?: string;
  children: ReactNode;
}

export function Section({ tone = "paper", size = "default", id, children }: SectionProps) {
  const cls = [
    "ls-section",
    tone === "alt" && "ls-section--alt",
    tone === "dark" && "ls-section--dark",
    size === "tight" && "ls-section--tight",
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <section id={id} className={cls}>
      {children}
    </section>
  );
}

interface ContainerProps {
  width?: "default" | "narrow";
  children: ReactNode;
}

export function Container({ width = "default", children }: ContainerProps) {
  return (
    <div className={width === "narrow" ? "ls-container--narrow" : "ls-container"}>
      {children}
    </div>
  );
}

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
  return <Tag id={id} className={`ls-h${level}`}>{children}</Tag>;
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

interface CardProps {
  tone?: "paper" | "dark";
  elevated?: boolean;
  id?: string;
  children: ReactNode;
}

export function Card({ tone = "paper", elevated, id, children }: CardProps) {
  const cls = [
    "ls-card",
    tone === "dark" && "ls-card--dark",
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

interface GridProps {
  cols?: 1 | 2 | 3 | 4;
  gap?: "sm" | "md" | "lg";
  children: ReactNode;
}

export function Grid({ cols = 3, gap = "md", children }: GridProps) {
  return (
    <div className={`ls-grid ls-grid-${cols} ls-grid--${gap}`}>{children}</div>
  );
}

export function CTAGroup({
  children,
  align = "start",
}: {
  children: ReactNode;
  align?: "start" | "center";
}) {
  return (
    <div
      className={`ls-cta-group ${align === "center" ? "justify-center" : ""}`}
    >
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
