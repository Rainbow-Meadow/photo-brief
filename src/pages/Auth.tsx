import { useEffect, useState } from "react";
import { useSearchParams, NavLink, useNavigate, Navigate } from "react-router-dom";
import { INVITE_ONLY_BETA, PUBLIC_SIGNUP_ENABLED } from "@/config/access";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BrandMark } from "@/components/layout/BrandMark";
import { PageMeta } from "@/hooks/seo/usePageMeta";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { trackEvent } from "@/lib/analytics";
import { onboardingDebug, edgeFunctionErrorDebug, supabaseErrorDebug } from "@/lib/onboardingDebug";
import { TurnstileWidget } from "@/components/security/TurnstileWidget";
import { verifyTurnstileToken } from "@/config/turnstile";

export default function AuthPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { session, loading: authLoading } = useAuth();
  const requestedSignup = params.get("mode") === "signup";
  // Force sign-in mode while public signup is disabled. Visitors trying to
  // sign up are redirected to the waitlist (or signup-with-invite flow).
  const signupAllowed = PUBLIC_SIGNUP_ENABLED && !INVITE_ONLY_BETA;
  const mode = requestedSignup && signupAllowed ? "signup" : "signin";
  const otherMode = mode === "signup" ? "signin" : "signup";

  // If a logged-out visitor asks for ?mode=signup while signup is closed,
  // bounce them to the waitlist instead of silently flipping to sign-in.
  if (requestedSignup && !signupAllowed && !session && !authLoading) {
    return <Navigate to="/" replace />;
  }

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  // Redirect once authenticated — honor ?next= so RequireAuth round-trips work.
  useEffect(() => {
    if (!authLoading && session) {
      const next = params.get("next");
      const target = next ? decodeURIComponent(next) : "/dashboard";
      onboardingDebug("auth.redirect_authenticated", {
        sessionPresent: true,
        currentUserId: session.user.id,
        currentUserEmail: session.user.email ?? null,
        redirectDestination: target,
        triggeredBy: "AuthPage.session_present",
      });
      navigate(target, { replace: true });
    }
  }, [authLoading, session, navigate, params]);

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Verify Turnstile before any auth call. If no token, the widget hasn't
      // loaded — proceed (open) so preview/dev flows aren't blocked.
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
        toast({
          title: "Check your inbox",
          description: "Confirm your email to finish creating your workspace.",
        });
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
        // Redirect handled by effect
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

  const handleApple = async () => {
    setSubmitting(true);
    trackEvent(mode === "signup" ? "signup_started" : "login_started", { method: "apple" });
    try {
      const result = await lovable.auth.signInWithOAuth("apple", {
        redirect_uri: window.location.origin,
      });
      if (result.error) throw new Error(result.error.message ?? "Apple sign-in failed");
      if (result.redirected) return;
    } catch (err: any) {
      toast({
        title: "Apple sign-in failed",
        description: err?.message ?? "Something went wrong.",
        variant: "destructive",
      });
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setSubmitting(true);
    trackEvent(mode === "signup" ? "signup_started" : "login_started", { method: "google" });
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) throw new Error(result.error.message ?? "Google sign-in failed");
      if (result.redirected) return;
      // Tokens received — effect will redirect once session updates
    } catch (err: any) {
      toast({
        title: "Google sign-in failed",
        description: err?.message ?? "Something went wrong.",
        variant: "destructive",
      });
      setSubmitting(false);
    }
  };

  return (
    <div className="relative isolate min-h-[100vh] overflow-hidden">
      <PageMeta
        title="Sign in | PhotoBrief"
        description="Sign in to your PhotoBrief workspace."
        canonicalPath="/auth"
        noindex
      />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-ambient-mesh" aria-hidden />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[60vh] bg-ambient-sky" aria-hidden />
      <div className="mx-auto flex min-h-[100vh] w-full max-w-md flex-col justify-center px-4 py-10">
        <div className="mb-8 flex justify-center animate-brand-entrance">
          <BrandMark variant="stacked" tone="auto" size={96} eager />
        </div>
        <div className="glass-strong rounded-3xl p-7 animate-lift-in">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {mode === "signup" ? "Create your workspace" : "Welcome back"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {mode === "signup"
            ? "Sign up to start sending photo briefs."
            : "Sign in to your PhotoBrief workspace."}
        </p>

        <Button
          type="button"
          variant="outline"
          className="mt-6 w-full"
          onClick={handleGoogle}
          disabled={submitting}
        >
          Continue with Google
        </Button>

        <Button
          type="button"
          variant="outline"
          className="mt-3 w-full"
          onClick={handleApple}
          disabled={submitting}
        >
          Continue with Apple
        </Button>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs uppercase tracking-wide text-muted-foreground">or</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <form className="space-y-4" onSubmit={handleEmail}>
          {mode === "signup" && (
            <div className="space-y-1.5">
              <Label htmlFor="name">Your name</Label>
              <Input id="name" type="text" placeholder="Jane Smith" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@business.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="••••••••" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <TurnstileWidget
            onVerify={(t) => setTurnstileToken(t)}
            onExpire={() => setTurnstileToken(null)}
            onError={() => setTurnstileToken(null)}
            action={mode === "signup" ? "signup" : "signin"}
            className="flex justify-center"
          />
          <Button type="submit" className="w-full" disabled={submitting}>
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

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {mode === "signup" ? "Already have an account?" : "New to PhotoBrief?"}{" "}
          {mode === "signin" && !signupAllowed ? (
            <NavLink to="/#apply" className="font-medium text-primary hover:underline">
              Apply for beta
            </NavLink>
          ) : (
            <NavLink to={`/auth?mode=${otherMode}`} className="font-medium text-primary hover:underline">
              {otherMode === "signup" ? "Create one" : "Sign in"}
            </NavLink>
          )}
        </p>
      </div>
      </div>
    </div>
  );
}
