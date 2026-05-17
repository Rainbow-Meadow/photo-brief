import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { TurnstileWidget } from "@/components/security/TurnstileWidget";
import { verifyTurnstileToken } from "@/config/turnstile";
import { EditorialAuthShell } from "@/components/editorial/EditorialAuthShell";
import { PageMeta } from "@/hooks/seo/usePageMeta";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (turnstileToken) {
        const ok = await verifyTurnstileToken(turnstileToken);
        if (!ok) throw new Error("Verification failed. Please try again.");
      }
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setSent(true);
    } catch (err: any) {
      toast({
        title: "Could not send reset email",
        description: err?.message ?? "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <EditorialAuthShell
      numeral="00"
      eyebrow="Reset password"
      title="Reset your password"
      description="Enter your email and we'll send you a link to choose a new password."
      footer={
        <p>
          Remembered it?{" "}
          <NavLink to="/auth" className="font-medium text-[hsl(var(--accent-kinetic))] hover:underline">
            Back to sign in
          </NavLink>
        </p>
      }
    >
      {sent ? (
        <div className="border border-success/30 bg-success/10 p-4 text-sm text-foreground">
          If an account exists for <span className="font-medium">{email}</span>, a password
          reset link is on its way. Check your inbox.
        </div>
      ) : (
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <Label htmlFor="email" className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@business.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-[0.25rem]"
            />
          </div>
          <TurnstileWidget
            onVerify={(t) => setTurnstileToken(t)}
            onExpire={() => setTurnstileToken(null)}
            onError={() => setTurnstileToken(null)}
            action="password-reset"
            className="flex justify-center"
          />
          <Button type="submit" className="w-full rounded-[0.25rem]" disabled={submitting}>
            {submitting ? "Sending..." : "Send reset link"}
          </Button>
        </form>
      )}
    </EditorialAuthShell>
  );
}
