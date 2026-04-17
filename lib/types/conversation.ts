export type Channel = "whatsapp" | "instagram" | "email" | "phone" | "web";
export type ConversationStatus = "active" | "waiting" | "handed_off" | "closed";
export type MessageDirection = "inbound" | "outbound";
export type SenderType = "lead" | "ai" | "human";

export type Conversation = {
  id: string;
  user_id: string;
  channel: Channel;
  status: ConversationStatus;
  contact_name: string | null;
  contact_identifier: string;
  platform_conversation_id: string | null;
  unread_count: number;
  last_message_text: string | null;
  last_message_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Message = {
  id: string;
  conversation_id: string;
  direction: MessageDirection;
  sender_type: SenderType;
  content: string;
  platform_message_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
};
