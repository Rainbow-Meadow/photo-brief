
-- Support tickets table
CREATE TABLE public.support_tickets (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id uuid NOT NULL,
  user_id uuid NOT NULL,
  type text NOT NULL DEFAULT 'general',
  subject text NOT NULL,
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "support tickets read own workspace"
  ON public.support_tickets FOR SELECT TO authenticated
  USING (is_workspace_member(workspace_id));

CREATE POLICY "support tickets insert own"
  ON public.support_tickets FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND is_workspace_member(workspace_id));

CREATE POLICY "support tickets update own"
  ON public.support_tickets FOR UPDATE TO authenticated
  USING (user_id = auth.uid() AND is_workspace_member(workspace_id))
  WITH CHECK (user_id = auth.uid() AND is_workspace_member(workspace_id));

CREATE POLICY "support tickets admin read all"
  ON public.support_tickets FOR SELECT TO authenticated
  USING (is_platform_admin());

CREATE POLICY "support tickets admin write all"
  ON public.support_tickets FOR ALL TO authenticated
  USING (is_platform_admin())
  WITH CHECK (is_platform_admin());

CREATE TRIGGER update_support_tickets_updated_at
  BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Support messages table
CREATE TABLE public.support_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id uuid NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL,
  body text NOT NULL,
  is_admin_reply boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "support messages read own workspace"
  ON public.support_messages FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.support_tickets t
    WHERE t.id = support_messages.ticket_id AND is_workspace_member(t.workspace_id)
  ));

CREATE POLICY "support messages insert own"
  ON public.support_messages FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.support_tickets t
      WHERE t.id = support_messages.ticket_id AND is_workspace_member(t.workspace_id)
    )
  );

CREATE POLICY "support messages admin read all"
  ON public.support_messages FOR SELECT TO authenticated
  USING (is_platform_admin());

CREATE POLICY "support messages admin write all"
  ON public.support_messages FOR ALL TO authenticated
  USING (is_platform_admin())
  WITH CHECK (is_platform_admin());

-- Enable realtime for chat
ALTER PUBLICATION supabase_realtime ADD TABLE public.support_messages;

-- Indexes
CREATE INDEX idx_support_tickets_workspace ON public.support_tickets(workspace_id);
CREATE INDEX idx_support_tickets_user ON public.support_tickets(user_id);
CREATE INDEX idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX idx_support_messages_ticket ON public.support_messages(ticket_id);
