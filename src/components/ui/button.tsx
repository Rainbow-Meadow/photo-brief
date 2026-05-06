import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Button — platform-aware via CSS media queries.
 *
 * Desktop (@media hover:hover): hover lift, refined focus ring, smooth shadow transition.
 * Mobile (@media hover:none): 44px min touch target, active press scale, no hover dependency.
 *
 * Platform behavior is driven by `.pb-btn-platform` in index.css.
 */
const buttonVariants = cva(
  "pb-btn-platform inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        /* ── App-side CTAs ──────────────────────────────────────── */
        default:
          "btn-primary-glass text-primary-foreground",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground",
        link:
          "text-primary underline-offset-4 hover:underline",

        /* ── Glass variants ─────────────────────────────────────── */
        glass:
          "glass text-foreground",
        "glass-onDark":
          "glass-onDark text-white hover:bg-white/15",

        /* ── Marketing / pb-landing CTAs ────────────────────────── */
        /** Primary CTA — hover lift handled by .pb-btn-platform CSS */
        "pb-primary":
          "rounded-full bg-[hsl(var(--pb-violet))] text-[hsl(var(--pb-night))] shadow-[0_8px_20px_-10px_hsl(var(--pb-violet)/0.55)] active:translate-y-0 focus-visible:ring-[hsl(var(--pb-lavender))]",
        /** Secondary CTA — hover lift handled by .pb-btn-platform CSS */
        "pb-secondary":
          "rounded-full border border-white/16 bg-white/[0.03] text-white active:translate-y-0 focus-visible:ring-[hsl(var(--pb-lavender))]",
        /** Tertiary / text link CTA on dark marketing surfaces */
        "pb-ghost":
          "rounded-full text-white/70 hover:bg-white/8 hover:text-white focus-visible:ring-[hsl(var(--pb-lavender))]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-lg px-3 text-[13px]",
        lg: "h-11 rounded-lg px-6",
        xl: "h-12 rounded-full px-7 text-[15px]",
        icon: "h-10 w-10",
        "icon-sm": "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {children}
          </>
        ) : (
          children
        )}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
