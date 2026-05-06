import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BETA_TOTAL_PARTNERS, BETA_SEATS_FILLED } from "@/config/betaProgram";

interface BetaSeats {
  seatsFilled: number;
  seatsRemaining: number;
  isFull: boolean;
}

function derive(filled: number): BetaSeats {
  return {
    seatsFilled: filled,
    seatsRemaining: Math.max(0, BETA_TOTAL_PARTNERS - filled),
    isFull: filled >= BETA_TOTAL_PARTNERS,
  };
}

const fallback = derive(BETA_SEATS_FILLED);

/** Shared cache so every component on the page uses the same value without re-fetching. */
let cached: BetaSeats | null = null;
let listeners: Set<(s: BetaSeats) => void> = new Set();
let subscribed = false;

function broadcast(seats: BetaSeats) {
  cached = seats;
  listeners.forEach((fn) => fn(seats));
}

function ensureSubscription() {
  if (subscribed) return;
  subscribed = true;

  // Initial fetch
  (supabase as any)
    .from("beta_program_config")
    .select("seats_filled")
    .eq("id", true)
    .maybeSingle()
    .then(({ data }: { data: { seats_filled: number } | null }) => {
      broadcast(derive(data?.seats_filled ?? BETA_SEATS_FILLED));
    })
    .catch(() => {
      broadcast(fallback);
    });

  // Realtime subscription
  supabase
    .channel("beta-seats")
    .on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "beta_program_config" },
      (payload: any) => {
        const filled = payload.new?.seats_filled;
        if (typeof filled === "number") {
          broadcast(derive(filled));
        }
      },
    )
    .subscribe();
}

export function useBetaSeats(): BetaSeats {
  const [seats, setSeats] = useState<BetaSeats>(cached ?? fallback);

  useEffect(() => {
    listeners.add(setSeats);
    ensureSubscription();
    // If cached value arrived before this component mounted
    if (cached) setSeats(cached);
    return () => {
      listeners.delete(setSeats);
    };
  }, []);

  return seats;
}
