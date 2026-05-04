import { useMemo, useState } from "react";
import { CheckCircle2, Clipboard, ExternalLink, MessageSquareText, Share2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { messagingService } from "@/services/messagingService";
import type { PhotoBriefRequest } from "@/types/photobrief";
import { trackEvent } from "@/lib/analytics";

function firstName(name: string) {
  return name.trim().split(/\s+/)[0] || "there";
}

function normalizePhone(phone?: string) {
  if (!phone) return "";
  const trimmed = phone.trim();
  const prefix = trimmed.startsWith("+") ? "+" : "";
  return `${prefix}${trimmed.replace(/\D/g, "")}`;
}

function buildSmsHref(phone: string, body: string) {
  const recipient = normalizePhone(phone);
  const separator = /iPad|iPhone|iPod/i.test(navigator.userAgent) ? "&" : "?";
  return `sms:${recipient}${separator}body=${encodeURIComponent(body)}`;
}

export function buildManualSmsMessage({
  request,
  businessName,
  link,
}: {
  request: PhotoBriefRequest;
  businessName: string;
  link: string;
}) {
  const customer = firstName(request.recipientName);
  const sender = businessName?.trim() || "our team";
  const guide = request.guideName?.trim();
  const workLabel = guide && guide.toLowerCase() !== "request" ? ` for ${guide}` : "";

  return `Hi ${customer} — this is ${sender}. Please add the requested photos${workLabel} here so we can review this faster:\n\n${link}\n\nIt takes about 2 minutes.`;
}

interface ManualSmsShareCardProps {
  request: PhotoBriefRequest;
  businessName: string;
  link: string;
  onLogged?: () => Promise<void> | void;
}

export function ManualSmsShareCard({ request, businessName, link, onLogged }: ManualSmsShareCardProps) {
  const [logging, setLogging] = useState(false);
  const [logged, setLogged] = useState(false);
  const message = useMemo(
    () => buildManualSmsMessage({ request, businessName, link }),
    [request, businessName, link],
  );
  const smsHref = useMemo(
    () => buildSmsHref(request.recipientPhone ?? "", message),
    [request.recipientPhone, message],
  );
  const hasPhone = !!normalizePhone(request.recipientPhone);

  async function copyMessage() {
    await navigator.clipboard.writeText(message);
    toast.success("Text message copied");
    trackEvent("manual_sms_message_copied", { request_id: request.id });
  }

  async function shareMessage() {
    if (navigator.share) {
      try {
        await navigator.share({ title: "PhotoBrief request", text: message, url: link });
        trackEvent("manual_sms_message_shared", { request_id: request.id });
        return;
      } catch (err) {
        if ((err as Error)?.name === "AbortError") return;
      }
    }
    await copyMessage();
  }

  async function markSent() {
    setLogging(true);
    try {
      await messagingService.logManualSend({
        requestId: request.id,
        workspaceId: request.workspaceId,
        channel: "sms",
        toAddress: request.recipientPhone ?? request.recipientContact ?? null,
        body: message,
      });
      setLogged(true);
      toast.success("Marked as sent");
      trackEvent("manual_sms_message_marked_sent", { request_id: request.id });
      await onLogged?.();
    } catch (err) {
      console.error(err);
      toast.error("Could not mark as sent", {
        description: "The message is still safe to copy and send manually.",
      });
    } finally {
      setLogging(false);
    }
  }

  return (
    <section className="relative isolate overflow-hidden rounded-[2rem] border border-primary/20 bg-gradient-to-br from-card via-card to-primary/5 p-5 shadow-[0_24px_70px_-50px_hsl(var(--primary)/0.55)] sm:p-6">
      <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 -z-10 h-56 w-56 rounded-full bg-primary/12 blur-3xl" />
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-full border bg-background/70 px-3 py-1 text-xs font-semibold text-primary">
            <MessageSquareText className="h-3.5 w-3.5" /> Send from your own phone number
          </span>
          <h2 className="mt-4 text-2xl font-semibold tracking-tight text-foreground">Copy a polished customer text.</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            PhotoBrief gives you the exact message. Paste it into your normal texting app so the customer sees your real business number.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 lg:justify-end">
          <Button className="rounded-2xl" onClick={copyMessage}>
            <Clipboard className="mr-2 h-4 w-4" /> Copy text
          </Button>
          <Button asChild variant="outline" className="rounded-2xl bg-background/70" disabled={!hasPhone}>
            <a href={smsHref} onClick={() => trackEvent("manual_sms_app_opened", { request_id: request.id, has_phone: hasPhone })}>
              <ExternalLink className="mr-2 h-4 w-4" /> Open Messages
            </a>
          </Button>
          <Button variant="outline" className="rounded-2xl bg-background/70" onClick={shareMessage}>
            <Share2 className="mr-2 h-4 w-4" /> Share
          </Button>
          <Button variant={logged ? "secondary" : "outline"} className="rounded-2xl bg-background/70" onClick={markSent} disabled={logging || logged}>
            <CheckCircle2 className="mr-2 h-4 w-4" /> {logged ? "Sent" : logging ? "Marking…" : "Mark as sent"}
          </Button>
        </div>
      </div>

      <div className="mt-5 rounded-[1.5rem] border bg-background/75 p-4 shadow-inner">
        <div className="mb-3 flex items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>Message preview</span>
          <span>{message.length} characters</span>
        </div>
        <pre className="whitespace-pre-wrap font-sans text-sm leading-6 text-foreground">{message}</pre>
      </div>

      {!hasPhone && (
        <p className="mt-3 text-xs leading-5 text-muted-foreground">
          No customer phone number is saved on this request, so “Open Messages” may open a blank recipient. Copy still works.
        </p>
      )}
    </section>
  );
}
