import { getPaddleEnvironment } from "@/lib/paddle";

export function PaymentTestModeBanner() {
  if (getPaddleEnvironment() !== "sandbox") return null;
  return (
    <div className="w-full border-b border-[hsl(var(--accent-kinetic))]/40 bg-[hsl(var(--accent-kinetic))]/10 px-4 py-2 text-center text-xs font-medium text-[hsl(var(--accent-kinetic))]">
      Test mode — payments in the preview won't charge a real card.{" "}
      <a
        href="https://docs.lovable.dev/features/payments#test-and-live-environments"
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-2"
      >
        Learn more
      </a>
    </div>
  );
}
