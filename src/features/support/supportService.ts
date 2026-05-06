import { supabase } from "@/integrations/supabase/client";

export interface SupportTicket {
  id: string;
  workspace_id: string;
  user_id: string;
  type: string;
  subject: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface SupportMessage {
  id: string;
  ticket_id: string;
  sender_id: string;
  body: string;
  is_admin_reply: boolean;
  created_at: string;
}

export const supportService = {
  async listTickets(workspaceId: string): Promise<SupportTicket[]> {
    const { data, error } = await supabase
      .from("support_tickets")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as SupportTicket[];
  },

  async listAllTickets(): Promise<SupportTicket[]> {
    const { data, error } = await supabase
      .from("support_tickets")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as SupportTicket[];
  },

  async createTicket(input: {
    workspaceId: string;
    userId: string;
    type: string;
    subject: string;
    body: string;
  }): Promise<SupportTicket> {
    const { data, error } = await supabase
      .from("support_tickets")
      .insert({
        workspace_id: input.workspaceId,
        user_id: input.userId,
        type: input.type,
        subject: input.subject,
      })
      .select("*")
      .single();
    if (error) throw error;
    const ticket = data as SupportTicket;

    // Create the initial message
    await supabase.from("support_messages").insert({
      ticket_id: ticket.id,
      sender_id: input.userId,
      body: input.body,
      is_admin_reply: false,
    });

    return ticket;
  },

  async updateTicketStatus(ticketId: string, status: string) {
    const { error } = await supabase
      .from("support_tickets")
      .update({ status })
      .eq("id", ticketId);
    if (error) throw error;
  },

  async listMessages(ticketId: string): Promise<SupportMessage[]> {
    const { data, error } = await supabase
      .from("support_messages")
      .select("*")
      .eq("ticket_id", ticketId)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return (data ?? []) as SupportMessage[];
  },

  async sendMessage(input: {
    ticketId: string;
    senderId: string;
    body: string;
    isAdminReply?: boolean;
  }): Promise<SupportMessage> {
    const { data, error } = await supabase
      .from("support_messages")
      .insert({
        ticket_id: input.ticketId,
        sender_id: input.senderId,
        body: input.body,
        is_admin_reply: input.isAdminReply ?? false,
      })
      .select("*")
      .single();
    if (error) throw error;
    return data as SupportMessage;
  },

  subscribeToMessages(ticketId: string, onMessage: (msg: SupportMessage) => void) {
    const channel = supabase
      .channel(`support-${ticketId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "support_messages",
          filter: `ticket_id=eq.${ticketId}`,
        },
        (payload) => onMessage(payload.new as SupportMessage),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  },
};
