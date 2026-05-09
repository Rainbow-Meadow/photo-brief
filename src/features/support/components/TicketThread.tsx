import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { supportService, type SupportMessage } from "@/features/support/supportService";
import { useAuth } from "@/hooks/useAuth";

interface Props {
  ticketId: string;
  isAdmin?: boolean;
}

export function TicketThread({ ticketId, isAdmin }: Props) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const msgs = await supportService.listMessages(ticketId);
      setMessages(msgs);
      setLoading(false);
    })();

    const unsub = supportService.subscribeToMessages(ticketId, (msg) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    });
    return unsub;
  }, [ticketId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function handleSend() {
    if (!reply.trim() || !user?.id) return;
    setSending(true);
    try {
      await supportService.sendMessage({
        ticketId,
        senderId: user.id,
        body: reply.trim(),
        isAdminReply: isAdmin,
      });
      setReply("");
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return <div className="py-8 text-center text-sm text-muted-foreground">Loading…</div>;
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((m) => {
          const isMine = m.sender_id === user?.id;
          return (
            <div
              key={m.id}
              className={cn(
                "max-w-[85%] rounded-[0.25rem] px-3.5 py-2.5 text-sm leading-relaxed",
                isMine
                  ? "ml-auto bg-primary text-primary-foreground"
                  : "bg-muted text-foreground",
              )}
            >
              {m.is_admin_reply && !isMine && (
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider opacity-60">
                  PhotoBrief Team
                </p>
              )}
              <p className="whitespace-pre-wrap">{m.body}</p>
              <p className="mt-1 text-[10px] opacity-50">
                {new Date(m.created_at).toLocaleString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      <form
        className="flex items-end gap-2 border-t p-3"
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
      >
        <Textarea
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder={isAdmin ? "Reply as PhotoBrief team…" : "Add a message…"}
          className="min-h-[44px] max-h-32 flex-1 resize-none text-sm"
          rows={1}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <Button type="submit" size="icon" disabled={!reply.trim() || sending}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
