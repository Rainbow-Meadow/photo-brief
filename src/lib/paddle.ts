import { supabase } from "@/integrations/supabase/client";

const clientToken = import.meta.env.VITE_PAYMENTS_CLIENT_TOKEN as string | undefined;

declare global {
  interface Window {
    Paddle: any;
  }
}

export type PaddleEnv = "sandbox" | "live";

export function getPaddleEnvironment(): PaddleEnv {
  return clientToken?.startsWith("test_") ? "sandbox" : "live";
}

let paddleInitialized = false;
let initPromise: Promise<void> | null = null;

export async function initializePaddle(): Promise<void> {
  if (paddleInitialized) return;
  if (initPromise) return initPromise;
  if (!clientToken) throw new Error("VITE_PAYMENTS_CLIENT_TOKEN is not set");

  initPromise = new Promise<void>((resolve, reject) => {
    const existing = document.getElementById("paddle-js") as HTMLScriptElement | null;
    const finish = () => {
      const paddleJsEnv = getPaddleEnvironment() === "sandbox" ? "sandbox" : "production";
      window.Paddle.Environment.set(paddleJsEnv);
      window.Paddle.Initialize({ token: clientToken });
      paddleInitialized = true;
      resolve();
    };
    if (existing && window.Paddle) return finish();
    const script = existing ?? document.createElement("script");
    script.id = "paddle-js";
    script.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
    script.onload = finish;
    script.onerror = reject;
    if (!existing) document.head.appendChild(script);
  });
  return initPromise;
}

export async function getPaddlePriceId(priceId: string): Promise<string> {
  const environment = getPaddleEnvironment();
  const { data, error } = await supabase.functions.invoke("get-paddle-price", {
    body: { priceId, environment },
  });
  if (error || !data?.paddleId) {
    throw new Error(`Failed to resolve price: ${priceId}`);
  }
  return data.paddleId as string;
}
