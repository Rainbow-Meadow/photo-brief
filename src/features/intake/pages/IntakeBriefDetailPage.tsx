import { NavLink, useParams } from "react-router-dom";
import { ArrowLeft, ExternalLink, FileText, ImageIcon, Mail, MapPin, Phone } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageShell, PageStack } from "@/components/layout/primitives";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ReadinessScoreBadge } from "@/components/shared/ReadinessScoreBadge";
import { Button } from "@/components/ui/button";
import { useIntakeBrief, useIntakeBriefAttachments, type IntakeAttachment } from "@/hooks/useIntakeBriefs";
import { formatRelativeTime } from "@/utils/format";
import { photoPolicySentence, photoPolicyShort, photoPolicyTone } from "@/features/intake/lib/photoPolicy";

function humanize(value: string) {
  return value.replace(/_/g, " ");
}

export default function IntakeBriefDetailPage() {
  const { id } = useParams();
  const { data: brief, isLoading, error } = useIntakeBrief(id);
  const { data: attachments = [], isLoading: attachmentsLoading } = useIntakeBriefAttachments(
    brief?.photoCount && brief.photoCount > 0 ? brief.id : undefined,
  );

  if (isLoading) {
    return <PageShell><PageStack><div className="surface-card p-8 text-center text-sm text-muted-foreground">Loading intake brief…</div></PageStack></PageShell>;
  }

  if (error || !brief) {
    return (
      <PageShell><PageStack>
        <Button asChild variant="ghost" className="w-fit gap-1.5">
          <NavLink to="/intake/briefs"><ArrowLeft className="h-4 w-4" /> Back to briefs</NavLink>
        </Button>
        <section className="surface-card p-8 text-center">
          <FileText className="mx-auto h-8 w-8 text-muted-foreground" />
          <h1 className="mt-4 text-lg font-semibold text-foreground">Brief not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">This intake brief may have been removed or you may not have access.</p>
        </section>
      </PageStack></PageShell>
    );
  }

  return (
    <PageShell><PageStack>
      <Button asChild variant="ghost" className="w-fit gap-1.5">
        <NavLink to="/intake/briefs"><ArrowLeft className="h-4 w-4" /> Back to briefs</NavLink>
      </Button>

      <PageHeader
        title={brief.title}
        description={brief.summary ?? "Smart Intake brief"}
        actions={
          brief.linkedPhotoBriefRequestId ? (
            <Button asChild variant="outline" className="gap-1.5">
              <NavLink to={`/requests/${brief.linkedPhotoBriefRequestId}`}>
                Open photo request <ExternalLink className="h-4 w-4" />
              </NavLink>
            </Button>
          ) : undefined
        }
      />

      <section className="grid gap-4 md:grid-cols-3">
        <InfoCard title="Customer">
          <p className="text-base font-medium leading-snug text-foreground">{brief.customer.name ?? "Unknown customer"}</p>
          <div className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
            {brief.customer.email ? <p className="flex items-center gap-2"><Mail className="h-4 w-4 shrink-0" /> <span className="break-all">{brief.customer.email}</span></p> : null}
            {brief.customer.phone ? <p className="flex items-center gap-2"><Phone className="h-4 w-4 shrink-0" /> {brief.customer.phone}</p> : null}
            {brief.customer.address ? <p className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0" /> {brief.customer.address}</p> : null}
            {!brief.customer.email && !brief.customer.phone && !brief.customer.address ? <p>No contact details shown.</p> : null}
          </div>
        </InfoCard>

        <InfoCard title="Request">
          <p className="text-base font-medium leading-snug text-foreground">{brief.routeLabel ?? brief.serviceLabel ?? "General request"}</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Submitted {formatRelativeTime(brief.createdAt)}</p>
          {brief.serviceLabel && brief.serviceLabel !== brief.routeLabel ? (
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Service · <span className="text-foreground">{brief.serviceLabel}</span></p>
          ) : null}
        </InfoCard>

        <InfoCard title="Readiness">
          <div className="flex flex-wrap items-center gap-2">
            {brief.readinessScore !== null && brief.readinessScore !== undefined ? <ReadinessScoreBadge score={brief.readinessScore} /> : null}
            <StatusBadge label={humanize(brief.readinessStatus)} tone={brief.readinessStatus.includes("ready") ? "success" : "warning"} />
          </div>
          <p className="mt-3 text-sm leading-6 text-foreground">{brief.nextAction ?? "Review this brief and follow up with the customer."}</p>
        </InfoCard>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <InfoCard title="Brief summary">
            <p className="text-[15px] leading-7 text-foreground/90">{brief.summary ?? "No summary was generated yet."}</p>
          </InfoCard>

          <InfoCard title="Answers">
            <KeyValueList data={brief.answers} />
          </InfoCard>
        </div>

        <div className="space-y-4">
          <InfoCard title="Photo handling">
            <StatusBadge label={photoPolicyShort(brief.photoPolicy)} tone={photoPolicyTone(brief.photoPolicy)} />
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {photoPolicySentence(brief.photoPolicy).charAt(0).toUpperCase() + photoPolicySentence(brief.photoPolicy).slice(1)}.
            </p>
            <p className="mt-2 text-sm leading-6 text-foreground">
              {brief.photosProvided ? `${brief.photoCount} ${brief.photoCount === 1 ? "photo" : "photos"} attached.` : "No photos attached yet."}
            </p>
            {brief.linkedPhotoBriefRequestId ? (
              <Button asChild variant="outline" size="sm" className="mt-3 gap-1.5">
                <NavLink to={`/requests/${brief.linkedPhotoBriefRequestId}`}>Open linked photo request</NavLink>
              </Button>
            ) : null}
          </InfoCard>
          <InfoCard title="Missing items">
            {brief.missingItems.length ? (
              <ul className="space-y-1 text-sm text-muted-foreground">
                {brief.missingItems.map((item) => <li key={item}>• {humanize(item)}</li>)}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No missing items flagged.</p>
            )}
          </InfoCard>
        </div>
      </section>
    </PageStack></PageShell>
  );
}

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="surface-card p-5">
      <p className="mb-3 font-mono text-[0.68rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">{title}</p>
      {children}
    </section>
  );
}

function KeyValueList({ data }: { data: Record<string, unknown> }) {
  const entries = Object.entries(data).filter(([key]) => key !== "raw");
  if (!entries.length) return <p className="text-sm text-muted-foreground">No answers shown.</p>;
  return (
    <dl className="divide-y divide-border">
      {entries.map(([key, value]) => (
        <div key={key} className="grid gap-1 py-3 sm:grid-cols-3 sm:gap-4">
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{humanize(key)}</dt>
          <dd className="text-sm leading-6 text-foreground sm:col-span-2">{formatValue(value)}</dd>
        </div>
      ))}
    </dl>
  );
}

function formatValue(value: unknown) {
  if (value == null || value === "") return "—";
  if (Array.isArray(value)) return value.map(formatValue).join(", ");
  if (typeof value === "object") return JSON.stringify(value, null, 2);
  return String(value);
}
