import { useState } from "react";
import { initializePaddle, getPaddlePriceId } from "@/lib/paddle";

export interface OpenCheckoutOptions {
  priceId: string;
  workspaceId: string;
  customerEmail?: string;
  discountCode?: string;
  successUrl?: string;
}

export function usePaddleCheckout() {
  const [loading, setLoading] = useState(false);
  const openCheckout = async (opts: OpenCheckoutOptions) => {
    setLoading(true);
    try {
      await initializePaddle();
      const paddlePriceId = await getPaddlePriceId(opts.priceId);
      window.Paddle.Checkout.open({
        items: [{ priceId: paddlePriceId, quantity: 1 }],
        customer: opts.customerEmail ? { email: opts.customerEmail } : undefined,
        customData: { workspaceId: opts.workspaceId },
        discountCode: opts.discountCode,
        settings: {
          displayMode: "overlay",
          successUrl: opts.successUrl || `${window.location.origin}/settings/billing?checkout=success`,
          allowLogout: false,
          variant: "one-page",
        },
      });
    } finally {
      setLoading(false);
    }
  };
  return { openCheckout, loading };
}
