// Billing is being rebuilt. The previous Stripe checkout was torn out so we
// can re-enable payments cleanly through Lovable's built-in payments flow.
// This stub keeps the /settings/billing route mounted with a useful message
// and a link to the public pricing page.
import { NavLink } from "react-router-dom";
import { Sparkles, ArrowRight } from "lucide-react";
import { PageMeta } from "@/hooks/seo/usePageMeta";
import { Button } from "@/components/ui/button";
import { Section, Container } from "@/design-system/schema";
import { useCurrentWorkspace } from "@/hooks/useCurrentWorkspace";

export default function BillingSettingsPage() {
  const { workspace } = useCurrentWorkspace();
  const planLabel = workspace?.plan === "intake_team" ? "Smart Intake Team" : "Smart Intake";

  return (
    <>
      <PageMeta title="Billing | PhotoBrief" description="Billing settings" canonicalPath="/settings/billing" />
      <Section>
        <Container width="narrow">
          <div className="border border-border bg-card p-8">
            <p className="inline-flex items-center gap-2 font-mono text-[0.7rem] font-medium uppercase tracking-[0.16em] text-[hsl(var(--accent-kinetic))]">
              <Sparkles className="h-3.5 w-3.5" /> Billing
            </p>
            <h1 className="mt-4 text-2xl font-semibold tracking-tight text-foreground">
              Checkout is being rebuilt.
            </h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              You're on <span className="font-medium text-foreground">{planLabel}</span>. We're
              wiring up a fresh checkout flow — you don't need to do anything. Your workspace,
              data, and access stay exactly as they are.
            </p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Need to change plans or have a billing question in the meantime? Email{" "}
              <a className="underline underline-offset-4" href="mailto:hello@photobrief.ai">
                hello@photobrief.ai
              </a>
              .
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild variant="outline" className="rounded-[0.25rem] uppercase tracking-[0.14em]">
                <NavLink to="/pricing">
                  See plans <ArrowRight className="ml-1 h-4 w-4" />
                </NavLink>
              </Button>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
