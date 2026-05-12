import { NavLink } from "react-router-dom";
import { ArrowRight, CheckCircle2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ReadinessScoreBadge } from "@/components/shared/ReadinessScoreBadge";
import { useIntakeBriefs } from "@/hooks/useIntakeBriefs";
import { formatRelativeTime } from "@/utils/format";
import type { IntakeBrief } from "@/types/intake";

function humanize(value: string) {
  return value.replace(/_/g, " ");
}

export function RecentIntakeBriefsCard() {
  const { data: briefs = [], isLoading } = useIntakeBriefs();
  const recent = briefs.slice(0, 4);

  return (
    <section className="surface-card overflow-hidden">
      <header className="flex items-center justify-between surface-divider px-4 py-3 sm:px-5 sm:py-4">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Recent intake briefs</h2>
          <p className="text-xs text-muted-foreground">
            {isLoading ? "Loading" : `${briefs.length} ${briefs.length === 1 ? "brief" : "briefs"}`}
          </p>
        </div>
        <Button asChild variant="ghost" size="sm" className="-mr-2 gap-1 rounded-full">
          <NavLink to="/intake/briefs">
            View all <ArrowRight className="h-3.5 w-3.5" />
          </NavLink>
        </Button>
      </header>

      {isLoading ? (
        <div className="px-5 py-8 text-center text-sm text-muted-foreground">Loading intake briefs…</div>
      ) : recent.length === 0 ? (
        <div className="px-5 py-10 text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <FileText className="h-5 w-5" />
          </div>
          <p className="text-sm font-medium text-foreground">No website briefs yet.</p>
          <p className="mt-1 text-xs text-muted-foreground">Smart Intake submissions will appear here.</p>
        </div>
      ) : (
        <ul className="divide-y divide-[hsl(var(--glass-border))]">
          {recent.map((brief) => <BriefRow key={brief.id} brief={brief} />)}
        </ul>
      )}
    </section>
  );
}

function BriefRow({ brief }: { brief: IntakeBrief }) {
  const ready = brief.readinessStatus.includes("ready");
  return (
    <li>
      <NavLink
        to={`/intake/briefs/${brief.id}`}
        className="group flex min-h-[52px] items-center justify-between gap-3 px-4 py-3 transition active:bg-muted/40 hover:bg-muted/45 sm:px-5 sm:py-4"
      >
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground group-hover:text-primary">
            {brief.customer.name ?? "Unknown customer"}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {brief.routeLabel ?? brief.serviceLabel ?? brief.title} · {formatRelativeTime(brief.createdAt)}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {brief.readinessScore !== null && brief.readinessScore !== undefined ? (
            <ReadinessScoreBadge score={brief.readinessScore} />
          ) : null}
          <StatusBadge label={humanize(brief.readinessStatus)} tone={ready ? "success" : "warning"} />
          <CheckCircle2 className="h-4 w-4 text-muted-foreground/50 transition group-hover:text-primary" />
        </div>
      </NavLink>
    </li>
  );
}
