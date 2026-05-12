import { NavLink } from "react-router-dom";
import { Inbox, MessageSquareText, Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageShell, PageStack } from "@/components/layout/primitives";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ReadinessScoreBadge } from "@/components/shared/ReadinessScoreBadge";
import { Button } from "@/components/ui/button";
import { useIntakeBriefs } from "@/hooks/useIntakeBriefs";
import { formatRelativeTime } from "@/utils/format";
import type { IntakeBrief } from "@/types/intake";

function humanize(value: string) {
  return value.replace(/_/g, " ");
}

export default function IntakeBriefsPage() {
  const { data: briefs = [], isLoading, error } = useIntakeBriefs();

  return (
    <PageShell><PageStack>
      <PageHeader
        title="Intake briefs"
        description="Smart Intake submissions from your public website link."
        actions={
          <Button asChild className="hidden gap-1.5 sm:inline-flex">
            <NavLink to="/intake">
              <Plus className="h-4 w-4" /> Setup intake
            </NavLink>
          </Button>
        }
      />

      {error ? (
        <div className="surface-card p-5 text-sm text-destructive">Could not load intake briefs.</div>
      ) : null}

      {isLoading ? (
        <div className="surface-card p-8 text-center text-sm text-muted-foreground">Loading intake briefs…</div>
      ) : briefs.length === 0 ? (
        <EmptyState />
      ) : (
        <section className="surface-card overflow-hidden">
          <div className="flex items-center justify-between border-b px-5 py-3 text-xs text-muted-foreground">
            <span>{briefs.length} {briefs.length === 1 ? "brief" : "briefs"}</span>
            <NavLink to="/intake" className="font-medium text-foreground hover:text-primary">Manage setup</NavLink>
          </div>

          <ul className="divide-y md:hidden">
            {briefs.map((brief) => <MobileBriefItem key={brief.id} brief={brief} />)}
          </ul>

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-5 py-3 font-medium">Request</th>
                  <th className="px-5 py-3 font-medium">Photos</th>
                  <th className="px-5 py-3 font-medium">Readiness</th>
                  <th className="px-5 py-3 font-medium">Created</th>
                  <th className="px-5 py-3 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {briefs.map((brief) => (
                  <tr key={brief.id} className="hover:bg-muted/30">
                    <td className="px-5 py-3 align-middle">
                      <p className="font-medium text-foreground">{brief.customer.name ?? "Unknown customer"}</p>
                      <p className="text-xs text-muted-foreground">{brief.customer.email ?? brief.customer.phone ?? "No contact shown"}</p>
                    </td>
                    <td className="px-5 py-3 align-middle">
                      <p className="font-medium text-foreground">{brief.routeLabel ?? brief.serviceLabel ?? brief.title}</p>
                      <p className="max-w-md truncate text-xs text-muted-foreground">{brief.summary ?? brief.nextAction ?? "No summary yet"}</p>
                    </td>
                    <td className="px-5 py-3 align-middle"><PhotoPolicyBadge brief={brief} /></td>
                    <td className="px-5 py-3 align-middle">
                      <div className="flex items-center gap-2">
                        {brief.readinessScore !== null && brief.readinessScore !== undefined ? <ReadinessScoreBadge score={brief.readinessScore} /> : null}
                        <StatusBadge label={humanize(brief.readinessStatus)} tone={brief.readinessStatus.includes("ready") ? "success" : "warning"} />
                      </div>
                    </td>
                    <td className="px-5 py-3 align-middle text-xs text-muted-foreground">{formatRelativeTime(brief.createdAt)}</td>
                    <td className="px-5 py-3 text-right align-middle">
                      <Button asChild variant="ghost" size="sm">
                        <NavLink to={`/intake/briefs/${brief.id}`}>Open</NavLink>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </PageStack></PageShell>
  );
}

function EmptyState() {
  return (
    <section className="surface-card p-8 text-center">
      <span className="mx-auto flex h-12 w-12 items-center justify-center border border-border text-muted-foreground">
        <Inbox className="h-5 w-5" />
      </span>
      <h2 className="mt-4 text-lg font-semibold text-foreground">No intake briefs yet</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        Once customers submit your public Smart Intake link, their briefs will appear here.
      </p>
      <Button asChild className="mt-5 gap-1.5">
        <NavLink to="/intake">
          <MessageSquareText className="h-4 w-4" /> Manage intake setup
        </NavLink>
      </Button>
    </section>
  );
}

function MobileBriefItem({ brief }: { brief: IntakeBrief }) {
  return (
    <li>
      <NavLink to={`/intake/briefs/${brief.id}`} className="block px-4 py-4 active:bg-muted/40">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-[15px] font-medium text-foreground">{brief.customer.name ?? "Unknown customer"}</p>
            <p className="truncate text-xs text-muted-foreground">{brief.routeLabel ?? brief.serviceLabel ?? brief.title}</p>
          </div>
          <PhotoPolicyBadge brief={brief} />
        </div>
        <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground">{brief.summary ?? brief.nextAction ?? "No summary yet"}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {brief.readinessScore !== null && brief.readinessScore !== undefined ? <ReadinessScoreBadge score={brief.readinessScore} /> : null}
          <StatusBadge label={humanize(brief.readinessStatus)} tone={brief.readinessStatus.includes("ready") ? "success" : "warning"} />
          <span className="text-xs text-muted-foreground">{formatRelativeTime(brief.createdAt)}</span>
        </div>
      </NavLink>
    </li>
  );
}

function PhotoPolicyBadge({ brief }: { brief: IntakeBrief }) {
  const label = humanize(brief.photoPolicy);
  const tone = brief.photoPolicy === "required" ? "warning" : brief.photoPolicy === "not_needed" ? "muted" : "info";
  return <StatusBadge label={label} tone={tone} />;
}
