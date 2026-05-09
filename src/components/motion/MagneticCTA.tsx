import { useRef, type ButtonHTMLAttributes, type AnchorHTMLAttributes, type ReactNode } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";

interface MagneticProps {
  children: ReactNode;
  className?: string;
  strength?: number;
}

type MagneticButtonProps = MagneticProps & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className">;
type MagneticLinkProps = MagneticProps & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "className"> & { href: string };

/**
 * MagneticCTA — pointer-following micro-magnet for hero buttons.
 * Disabled on touch + reduced motion. Defaults to a button; pass
 * `href` to render an anchor.
 */
export function MagneticCTA(props: MagneticButtonProps | MagneticLinkProps) {
  const { children, className, strength = 18, ...rest } = props as MagneticProps & {
    href?: string;
    [k: string]: unknown;
  };
  const ref = useRef<HTMLElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 18, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 18, mass: 0.4 });
  const reduced = useReducedMotion();

  const isTouch = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
  const enabled = !reduced && !isTouch;

  const handleMove = (e: React.PointerEvent) => {
    if (!enabled || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set(((e.clientX - (r.left + r.width / 2)) / r.width) * strength);
    y.set(((e.clientY - (r.top + r.height / 2)) / r.height) * strength);
  };
  const handleLeave = () => {
    x.set(0);
    y.set(0);
  };

  if ("href" in rest && rest.href) {
    const { href, ...anchor } = rest as MagneticLinkProps;
    return (
      <motion.a
        ref={ref as React.RefObject<HTMLAnchorElement>}
        href={href}
        className={className}
        style={{ x: sx, y: sy }}
        onPointerMove={handleMove}
        onPointerLeave={handleLeave}
        {...(anchor as Record<string, unknown>)}
      >
        {children}
      </motion.a>
    );
  }
  return (
    <motion.button
      ref={ref as React.RefObject<HTMLButtonElement>}
      className={className}
      style={{ x: sx, y: sy }}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      {...(rest as Record<string, unknown>)}
    >
      {children}
    </motion.button>
  );
}
