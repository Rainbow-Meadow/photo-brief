import { useEffect, useState } from "react";
import { Navigate, NavLink, useNavigate, useSearchParams } from "react-router-dom";
import { AlertTriangle, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EditorialAuthShell } from "@/components/editorial/EditorialAuthShell";
import { SEOHead } from "@/components/seo/SEOHead";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "@/hooks/use-toast";
import { trackEvent } from "@/lib/analytics";
import { INVITE_ONLY_BETA } from "@/config/access";
import { TurnstileWidget } from "@/components/security/TurnstileWidget";
import { verifyTurnstileToken } from "@/config/turnstile";

type ValidationState =
  | { kind: "loading" }
  | { kind: "invalid"; reason: string }
  | { kind: "valid"; email: string; business_name: string | null };

const reasonCopy: Record<string, { title: string; body: string }> = {
  not_found: {
    title: "That invite didn't check out",
    body: "The link might be off by a character. Double-check it, or apply for beta access below.",
  },
  expired: {
    title: "This invite has expired",
    body: "Beta invites are good for 14 days. Apply again and we'll send a fresh one.",
  },
  revoked: {
    title: "This invite was pulled",
    body: "Looks like this one was revoked. Reach out, or apply for beta access below.",
  },
  accepted: {
    title: "This invite was already used",
    body: "If that wasn't you, contact support. Otherwise, sign in below.",
  },
};

const fieldLabelCls =
  "block font-mono text-[0.7rem] font-medium uppercase tracking-[0.18em] text-muted-foreground";
const fieldHintCls =
  "mt-1 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground";
const inputCls =
  "mt-2 h-12 rounded-none border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--ring))]";
const primaryBtn =
  "inline-flex h-12 w-full items-center justify-center gap-2 bg-[hsl(var(--accent-kinetic))] px-5 font-[Geist,Inter,system-ui,sans-serif] text-[0.78rem] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--primary-foreground))] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--ring))]";
const outlineBtn =
  "inline-flex h-12 w-full items-center justify-center gap-2 border border-border bg-background px-5 font-[Geist,Inter,system-ui,sans-serif] text-[0.78rem] font-semibold uppercase tracking-[0.14em] text-foreground transition hover:bg-foreground hover:text-background";

export default function SignupPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("invite")?.trim();

  // No token + invite-only mode → bounce to waitlist.
  useEffect(() => {
    if (!token && INVITE_ONLY_BETA) {
      trackEvent("signup_blocked_no_invite");
    }
  }, [token]);

  if (!token && INVITE_ONLY_BETA) {
    return <Navigate to="/" replace />;
  }

  const [state, setState] = useState<ValidationState>({ kind: "loading" });
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!token) {
        setState({ kind: "invalid", reason: "not_found" });
        return;
      }
      try {
        const { data, error } = await supabase.functions.invoke("invite-validate", {
          body: { token },
        });
        if (cancelled) return;
        if (error) throw error;
        const r = data as {
          valid: boolean;
          email?: string;
          business_name?: string | null;
          reason?: string;
        };
        if (r.valid && r.email) {
          setState({ kind: "valid", email: r.email, business_name: r.business_name ?? null });
        } else {
          const reason = r.reason ?? "not_found";
          trackEvent("invite_invalid", { reason });
          setState({ kind: "invalid", reason });
        }
      } catch (e) {
        if (cancelled) return;
        trackEvent("invite_invalid", { reason: "network" });
        setState({ kind: "invalid", reason: "not_found" });
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [token]);

  async function finalizeAcceptance() {
    if (!token) return;
    try {
      await supabase.functions.invoke("invite-accept", { body: { token } });
      trackEvent("invite_accepted");
    } catch (err) {
      console.error("invite-accept failed", err);
    }
  }

  async function handleEmailSignup(e: React.FormEvent) {
    e.preventDefault();
    if (state.kind !== "valid") return;
    setSubmitting(true);
    try {
      if (turnstileToken) {
        const ok = await verifyTurnstileToken(turnstileToken);
        if (!ok) throw new Error("Verification failed. Please try again.");
      }
      trackEvent("signup_started", { method: "email" });
      const { error } = await supabase.auth.signUp({
        email: state.email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/onboarding`,
          data: { name, beta_invite_token: token },
        },
      });
      if (error) throw error;
      await finalizeAcceptance();
      trackEvent("signup_completed", { method: "email" });
      toast({
        title: "You're in.",
        description: "Confirm your email, sign in, and we'll get your intake live.",
      });
      navigate("/auth", { replace: true });
    } catch (err) {
      toast({
        title: "Sign-up failed",
        description: (err as Error).message ?? "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleOAuth(provider: "google" | "apple") {
    if (state.kind !== "valid" || !token) return;
    sessionStorage.setItem("pendingBetaInviteToken", token);
    sessionStorage.setItem("pendingBetaInviteEmail", state.email);
    setSubmitting(true);
    try {
      const result = await lovable.auth.signInWithOAuth(provider, {
        redirect_uri: window.location.origin + "/onboarding",
      });
      if (result.error) throw new Error(result.error.message ?? "OAuth failed");
    } catch (err) {
      sessionStorage.removeItem("pendingBetaInviteToken");
      sessionStorage.removeItem("pendingBetaInviteEmail");
      toast({
        title: `${provider === "google" ? "Google" : "Apple"} sign-in failed`,
        description: (err as Error).message,
        variant: "destructive",
      });
      setSubmitting(false);
    }
  }

  const seo = (
    <SEOHead
      title="Claim your PhotoBrief invite"
      description="Accept your beta invite and stand up your smart intake in minutes."
      canonicalPath="/signup"
    />
  );

  if (state.kind === "loading") {
    return (
      <>
        {seo}
        <EditorialAuthShell numeral="00" eyebrow="Verifying invite" title="Checking your invite…">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin text-[hsl(var(--accent-kinetic))]" />
            One moment while we verify the link.
          </div>
        </EditorialAuthShell>
      </>
    );
  }

  if (state.kind === "invalid") {
    const copy = reasonCopy[state.reason] ?? {
      title: "We couldn't verify that invite",
      body: "Please double-check the link, or apply for beta access below.",
    };
    return (
      <>
        {seo}
        <EditorialAuthShell numeral="ER" eyebrow="Invite not accepted" title={copy.title} description={copy.body}>
          <span className="mb-6 flex h-12 w-12 items-center justify-center border border-[hsl(var(--accent-kinetic))] text-[hsl(var(--accent-kinetic))]">
            <AlertTriangle className="h-5 w-5" />
          </span>
          <div className="flex flex-col gap-2.5">
            <NavLink to="/#apply" className={primaryBtn}>Apply for beta</NavLink>
            <NavLink to="/auth" className={outlineBtn}>I already have an account — sign in</NavLink>
          </div>
        </EditorialAuthShell>
      </>
    );
  }

  return (
    <>
      {seo}
      <EditorialAuthShell
        numeral="01"
        eyebrow="Invite verified"
        title="Create your workspace"
        description={
          <>
            Setting up an account for{" "}
            <span className="font-medium text-foreground">{state.email}</span>.
          </>
        }
      >
        <form onSubmit={handleEmailSignup} className="grid gap-5">
          <div>
            <label htmlFor="email" className={fieldLabelCls}>Email</label>
            <Input id="email" value={state.email} readOnly className={`${inputCls} bg-muted/40`} />
            <p className={fieldHintCls}>Locked to your invite</p>
          </div>
          <div>
            <label htmlFor="name" className={fieldLabelCls}>Your name</label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              required
              className={inputCls}
            />
          </div>
          <div>
            <label htmlFor="password" className={fieldLabelCls}>Password</label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              minLength={8}
              required
              className={inputCls}
            />
            <p className={fieldHintCls}>At least 8 characters</p>
          </div>
          <TurnstileWidget
            onVerify={(t) => setTurnstileToken(t)}
            onExpire={() => setTurnstileToken(null)}
            onError={() => setTurnstileToken(null)}
            action="invite-signup"
            className="flex justify-center"
          />
          <button type="submit" disabled={submitting} className={primaryBtn}>
            {submitting ? "Creating account…" : "Create account"}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          or continue with
          <span className="h-px flex-1 bg-border" />
        </div>

        <div className="grid gap-2.5">
          <button type="button" onClick={() => handleOAuth("google")} disabled={submitting} className={outlineBtn}>
            Continue with Google
          </button>
          <button type="button" onClick={() => handleOAuth("apple")} disabled={submitting} className={outlineBtn}>
            Continue with Apple
          </button>
        </div>

        <p className="mt-6 text-center font-mono text-[0.7rem] uppercase tracking-[0.16em] text-muted-foreground">
          Already have an account?{" "}
          <NavLink to="/auth" className="text-[hsl(var(--accent-kinetic))] hover:underline">
            Sign in
          </NavLink>
        </p>
      </EditorialAuthShell>
    </>
  );
}
