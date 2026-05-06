import { useState } from "react";
import { MessageCircle, X, Bug, Lightbulb, HelpCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useCurrentWorkspace } from "@/hooks/useCurrentWorkspace";
import { useAuth } from "@/hooks/useAuth";
import { supportService } from "@/features/support/supportService";
import { toast } from "@/hooks/use-toast";

const TYPES = [
  { value: "bug", label: "Bug", icon: Bug },
  { value: "feature_request", label: "Idea", icon: Lightbulb },
  { value: "question", label: "Question", icon: HelpCircle },
] as const;

export function FeedbackWidget() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<string>("bug");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const { workspace } = useCurrentWorkspace();
  const { user } = useAuth();

  async function handleSubmit() {
    if (!message.trim() || !workspace?.id || !user?.id) return;
    setSending(true);
    try {
      const subjectMap: Record<string, string> = {
        bug: "Bug report",
        feature_request: "Feature request",
        question: "Question",
      };
      await supportService.createTicket({
        workspaceId: workspace.id,
        userId: user.id,
        type,
        subject: subjectMap[type] ?? "Feedback",
        body: message.trim(),
      });
      toast({ title: "Sent!", description: "Thanks for the feedback. We'll get back to you." });
      setMessage("");
      setOpen(false);
    } catch {
      toast({ title: "Something went wrong", description: "Please try again.", variant: "destructive" });
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      {/* Floating trigger */}
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "fixed bottom-20 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-all md:bottom-6",
          "bg-primary text-primary-foreground hover:scale-105 active:scale-95",
        )}
        aria-label="Send feedback"
      >
        {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed bottom-[5.5rem] right-4 z-50 w-[calc(100vw-2rem)] max-w-sm rounded-xl border bg-card p-4 shadow-xl md:bottom-20">
          <p className="mb-3 text-sm font-semibold text-foreground">Send us feedback</p>

          {/* Type chips */}
          <div className="mb-3 flex gap-2">
            {TYPES.map((t) => (
              <button
                key={t.value}
                onClick={() => setType(t.value)}
                className={cn(
                  "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  type === t.value
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:bg-muted",
                )}
              >
                <t.icon className="h-3.5 w-3.5" />
                {t.label}
              </button>
            ))}
          </div>

          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="What's on your mind?"
            className="mb-3 min-h-[100px] resize-none text-sm"
          />

          <Button
            onClick={handleSubmit}
            disabled={!message.trim() || sending}
            loading={sending}
            size="sm"
            className="w-full"
          >
            <Send className="mr-1.5 h-3.5 w-3.5" />
            Send
          </Button>
        </div>
      )}
    </>
  );
}
