import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/design-system/schema";

type State =
  | { status: "loading" }
  | { status: "valid" }
  | { status: "already" }
  | { status: "invalid"; message: string }
  | { status: "submitting" }
  | { status: "success" };

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

export default function UnsubscribePage() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    if (!token) {
      setState({ status: "invalid", message: "Missing unsubscribe token." });
      return;
    }
    (async () => {
      try {
        const url = `${SUPABASE_URL}/functions/v1/handle-email-unsubscribe?token=${encodeURIComponent(token)}`;
        const res = await fetch(url, { headers: { apikey: SUPABASE_ANON_KEY } });
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (res.ok && data?.valid) {
          setState({ status: "valid" });
        } else if (data?.reason === "already_unsubscribed") {
          setState({ status: "already" });
        } else {
          setState({
            status: "invalid",
            message: data?.error ?? "This unsubscribe link is invalid or expired.",
          });
        }
      } catch (err) {
        if (cancelled) return;
        setState({
          status: "invalid",
          message: err instanceof Error ? err.message : "Could not validate the link.",
        });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const confirm = async () => {
    if (!token) return;
    setState({ status: "submitting" });
    try {
      const { data, error } = await supabase.functions.invoke(
        "handle-email-unsubscribe",
        { body: { token } },
      );
      if (error) throw error;
      if (data?.success || data?.reason === "already_unsubscribed") {
        setState({ status: "success" });
      } else {
        setState({
          status: "invalid",
          message: data?.error ?? "Could not process the unsubscribe.",
        });
      }
    } catch (err) {
      setState({
        status: "invalid",
        message: err instanceof Error ? err.message : "Could not process the unsubscribe.",
      });
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-16">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[60vh] bg-ambient-sky"
        aria-hidden
      />
      <div className="w-full max-w-md border border-border bg-card p-7">
        <p className="inline-flex items-baseline gap-2 font-mono text-[0.7rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          <span className="inline-block h-px w-8 -translate-y-[0.25em] bg-[hsl(var(--accent-kinetic))]" />
          <span className="text-[hsl(var(--accent-kinetic))]">[ 00 ]</span>
          <span>Email preferences</span>
        </p>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-foreground">Manage your subscription</h1>

        {state.status === "loading" || state.status === "submitting" ? (
          <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            {state.status === "loading" ? "Checking your link…" : "Updating…"}
          </div>
        ) : null}

        {state.status === "valid" ? (
          <>
            <p className="mt-3 text-sm text-muted-foreground">
              Confirm to stop receiving emails from PhotoBrief at this address.
              You can still receive password reset and other security emails.
            </p>
            <div className="mt-6 flex justify-end">
              <Button onClick={confirm}>Confirm unsubscribe</Button>
            </div>
          </>
        ) : null}

        {state.status === "already" ? (
          <div className="mt-6 flex items-start gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="mt-0.5 h-4 w-4 text-success" />
            <span>This address is already unsubscribed.</span>
          </div>
        ) : null}

        {state.status === "success" ? (
          <div className="mt-6 flex items-start gap-2 text-sm text-foreground">
            <CheckCircle2 className="mt-0.5 h-4 w-4 text-success" />
            <span>You've been unsubscribed. Sorry to see you go.</span>
          </div>
        ) : null}

        {state.status === "invalid" ? (
          <div className="mt-6 flex items-start gap-2 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4" />
            <span>{state.message}</span>
          </div>
        ) : null}
      </div>
    </main>
  );
}
