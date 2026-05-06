import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BETA_TOTAL_PARTNERS, BETA_SEATS_FILLED } from "@/config/betaProgram";

interface BetaSeats {
  seatsFilled: number;
  seatsRemaining: number;
  isFull: boolean;
}

const fallback: BetaSeats = {
  seatsFilled: BETA_SEATS_FILLED,
  seatsRemaining: BETA_TOTAL_PARTNERS - BETA_SEATS_FILLED,
  isFull: BETA_SEATS_FILLED >= BETA_TOTAL_PARTNERS,
};

/** Shared cache so every component on the page uses the same value without re-fetching. */
let cached: BetaSeats | null = null;
let fetchPromise: Promise<BetaSeats> | null = null;

function fetchSeats(): Promise<BetaSeats> {
  if (fetchPromise) return fetchPromise;
  fetchPromise = (supabase as any)
    .from("beta_program_config")
    .select("seats_filled")
    .eq("id", true)
    .maybeSingle()
    .then(({ data }: { data: { seats_filled: number } | null }) => {
      const filled = data?.seats_filled ?? BETA_SEATS_FILLED;
      const result: BetaSeats = {
        seatsFilled: filled,
        seatsRemaining: Math.max(0, BETA_TOTAL_PARTNERS - filled),
        isFull: filled >= BETA_TOTAL_PARTNERS,
      };
      cached = result;
      return result;
    })
    .catch(() => {
      cached = fallback;
      return fallback;
    });
  return fetchPromise;
}

export function useBetaSeats(): BetaSeats {
  const [seats, setSeats] = useState<BetaSeats>(cached ?? fallback);

  useEffect(() => {
    if (cached) {
      setSeats(cached);
      return;
    }
    fetchSeats().then(setSeats);
  }, []);

  return seats;
}
