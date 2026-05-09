import { useRef, type ReactNode, type CSSProperties } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

interface RevealTextProps {
  children: ReactNode;
  delay?: number;
  as?: "div" | "span" | "p" | "h1" | "h2" | "h3";
  className?: string;
  style?: CSSProperties;
}

/**
 * RevealText — masked typographic reveal triggered when the element
 * scrolls into view. Falls back to instant render under reduced motion.
 */
export function RevealText({ children, delay = 0, as = "span", className, style }: RevealTextProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const reduced = useReducedMotion();
  const Tag = motion[as];

  if (reduced) {
    const Static = as as keyof JSX.IntrinsicElements;
    return <Static className={className} style={style}>{children}</Static>;
  }

  return (
    <span
      ref={ref}
      className="inline-block overflow-hidden align-baseline"
      style={{ paddingBottom: "0.12em" }}
    >
      <Tag
        className={className}
        style={style}
        initial={{ y: "120%" }}
        animate={inView ? { y: "0%" } : { y: "120%" }}
        transition={{
          duration: 0.9,
          delay,
          ease: [0.215, 0.61, 0.355, 1],
        }}
      >
        {children}
      </Tag>
    </span>
  );
}
