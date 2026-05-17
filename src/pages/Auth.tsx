import { useEffect, useState } from "react";
import { useSearchParams, NavLink, useNavigate, Navigate } from "react-router-dom";
import { INVITE_ONLY_BETA, PUBLIC_SIGNUP_ENABLED } from "@/config/access";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageMeta } from "@/hooks/seo/usePageMeta";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { trackEvent } from "@/lib/analytics";
import { onboardingDebug, supabaseErrorDebug } from "@/lib/onboardingDebug";
import { TurnstileWidget } from "@/components/security/TurnstileWidget";
import { verifyTurnstileToken } from "@/config/turnstile";
import { EditorialAuthShell } from "@/components/editorial/EditorialAuthShell";

export default function AuthPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { session, loading: authLoading } = useAuth();
  const requestedSignup = params.get("mode") === "signup";
  const signupAllowed = PUBLIC_SIGNUP_ENABLED && !INVITE_ONLY_BETA;
  const mode = requestedSignup && signupAllowed ? "signup" : "signin";
  const otherMode = mode === "signup" ? "signin" : "signup";

  if (requestedSignup && !signupAllowed && !session && !authLoading) {
    return <Navigate to="/" replace />;
  }

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  // Persist ?demo=<sessionId> across the auth round-trip.
  useEffect(() => {
    const demo = params.get("demo");
    if (demo) {
      try { sessionStorage.setItem("pb_demo_session_id", demo); } catch { /* noop */ }
    }
  }, [params]);

  useEffect(() => {
    if (authLoading || !session) return;
    (async () => {
      let claimedTarget: string | null = null;
      try {
        const demoId = sessionStorage.getItem("pb_demo_session_id");
        if (demoId) {
          sessionStorage.removeItem("pb_demo_session_id");
          const { data, error } = await supabase.functions.invoke("claim-demo-blueprint", {
            body: { demoSessionId: demoId },
          });
          if (!error && (data as any)?.ok) {
            claimedTarget = "/intake?claimed=1";
            toast({ title: "Setup imported", description: "Your demo is now your workspace." });
          }
        }
      } catch { /* ignore — fall through to default redirect */ }
      const next = params.get("next");
      const target = claimedTarget ?? (next ? decodeURIComponent(next) : "/dashboard");
      onboardingDebug("auth.redirect_authenticated", {
        sessionPresent: true, currentUserId: session.user.id,
        currentUserEmail: session.user.email ?? null,
        redirectDestination: target, triggeredBy: "AuthPage.session_present",
      });
      navigate(target, { replace: true });
    })();
  }, [authLoading, session, navigate, params]);

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (turnstileToken) {
        const ok = await verifyTurnstileToken(turnstileToken);
        if (!ok) throw new Error("Verification failed. Please try again.");
      }
      if (mode === "signup") {
        trackEvent("signup_started", { method: "email" });
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: { name },
          },
        });
        onboardingDebug("auth.email_signup.done", {
          sessionPresent: !!session,
          currentUserEmail: email,
          requestName: "auth.signUp",
          urlPath: "/auth/v1/signup",
          method: "POST",
          error: supabaseErrorDebug(error),
        });
        if (error) throw error;
        trackEvent("signup_completed", { method: "email" });
        toast({ title: "Check your inbox", description: "Confirm your email and we'll spin up your workspace." });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        onboardingDebug("auth.email_signin.done", {
          sessionPresent: !!session,
          currentUserEmail: email,
          requestName: "auth.signInWithPassword",
          urlPath: "/auth/v1/token?grant_type=password",
          method: "POST",
          error: supabaseErrorDebug(error),
        });
        if (error) throw error;
        trackEvent("login_completed", { method: "email" });
      }
    } catch (err: any) {
      toast({
        title: mode === "signup" ? "Sign-up failed" : "Sign-in failed",
        description: err?.message ?? "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const oauth = (provider: "apple" | "google") => async () => {
    setSubmitting(true);
    trackEvent(mode === "signup" ? "signup_started" : "login_started", { method: provider });
    try {
      const result = await lovable.auth.signInWithOAuth(provider, { redirect_uri: window.location.origin });
      if (result.error) throw new Error(result.error.message ?? `${provider} sign-in failed`);
      if (result.redirected) return;
    } catch (err: any) {
      toast({
        title: `${provider === "apple" ? "Apple" : "Google"} sign-in failed`,
        description: err?.message ?? "Something went wrong.",
        variant: "destructive",
      });
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageMeta
        title="Sign in | PhotoBrief"
        description="Sign in to your PhotoBrief workspace."
        canonicalPath="/auth"
        noindex
      />
      <EditorialAuthShell
        numeral="01"
        eyebrow={mode === "signup" ? "Create workspace" : "Sign in"}
        title={mode === "signup" ? "Set up your intake" : "Welcome back"}
        description={
          mode === "signup"
            ? "Replace your contact form with smart intake. Start sending briefs in minutes."
            : "Back to your inbox of briefs."
        }
        footer={
          <p>
            {mode === "signup" ? "Already have an account?" : "New to PhotoBrief?"}{" "}
            <NavLink to={`/auth?mode=${otherMode}`} className="font-medium text-[hsl(var(--accent-kinetic))] hover:underline">
              {otherMode === "signup" ? "Create one" : "Sign in"}
            </NavLink>
          </p>
        }
      >
        <Button
          type="button"
          variant="outline"
          className="w-full rounded-[0.25rem] border-border"
          onClick={oauth("google")}
          disabled={submitting}
        >
          Continue with Google
        </Button>
        <Button
          type="button"
          variant="outline"
          className="mt-3 w-full rounded-[0.25rem] border-border"
          onClick={oauth("apple")}
          disabled={submitting}
        >
          Continue with Apple
        </Button>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">or</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <form className="space-y-4" onSubmit={handleEmail}>
          {mode === "signup" && (
            <div className="space-y-1.5">
              <Label htmlFor="name" className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground">Your name</Label>
              <Input id="name" type="text" placeholder="Jane Smith" value={name} onChange={(e) => setName(e.target.value)} className="rounded-[0.25rem]" />
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="email" className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground">Email</Label>
            <Input id="email" type="email" placeholder="you@business.com" required value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-[0.25rem]" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password" className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground">Password</Label>
            <Input id="password" type="password" placeholder="••••••••" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="rounded-[0.25rem]" />
          </div>
          <TurnstileWidget
            onVerify={(t) => setTurnstileToken(t)}
            onExpire={() => setTurnstileToken(null)}
            onError={() => setTurnstileToken(null)}
            action={mode === "signup" ? "signup" : "signin"}
            className="flex justify-center"
          />
          <Button type="submit" className="w-full rounded-[0.25rem]" disabled={submitting}>
            {submitting ? "Please wait..." : mode === "signup" ? "Create account" : "Sign in"}
          </Button>
        </form>

        {mode === "signin" && (
          <p className="mt-4 text-center text-xs text-muted-foreground">
            <NavLink to="/forgot-password" className="hover:text-foreground hover:underline">
              Forgot your password?
            </NavLink>
          </p>
        )}
      </EditorialAuthShell>
    </>
  );
}
