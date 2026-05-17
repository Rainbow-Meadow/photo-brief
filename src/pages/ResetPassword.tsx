import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { EditorialAuthShell } from "@/components/editorial/EditorialAuthShell";
import { PageMeta } from "@/hooks/seo/usePageMeta";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast({ title: "Password too short", description: "Use at least 8 characters.", variant: "destructive" });
      return;
    }
    if (password !== confirm) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast({ title: "Password updated", description: "You're signed in." });
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      toast({
        title: "Could not update password",
        description: err?.message ?? "The reset link may have expired — request a new one.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageMeta
        title="Set a new password | PhotoBrief"
        description="Choose a new password to finish recovering your PhotoBrief account."
        canonicalPath="/reset-password"
        noindex
      />
    <EditorialAuthShell
      numeral="00"
      eyebrow="New password"
      title="Choose a new password"
      description={ready ? "Enter a new password for your account." : "Verifying your reset link…"}
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-1.5">
          <Label htmlFor="password" className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground">New password</Label>
          <Input
            id="password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={!ready}
            className="rounded-[0.25rem]"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="confirm" className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground">Confirm password</Label>
          <Input
            id="confirm"
            type="password"
            required
            minLength={8}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            disabled={!ready}
            className="rounded-[0.25rem]"
          />
        </div>
        <Button type="submit" className="w-full rounded-[0.25rem]" disabled={submitting || !ready}>
          {submitting ? "Updating..." : "Update password"}
        </Button>
      </form>
    </EditorialAuthShell>
  );
}
