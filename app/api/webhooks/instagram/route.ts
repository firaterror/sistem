import { NextResponse, type NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.META_WEBHOOK_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse("Forbidden", { status: 403 });
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  try {
    const entries = body?.entry || [];

    for (const entry of entries) {
      const messaging = entry?.messaging || [];

      for (const event of messaging) {
        const message = event?.message;
        if (!message || message.is_echo) continue;

        const recipientId = event.recipient?.id;
        const senderId = event.sender?.id;

        if (!recipientId || !senderId) continue;

        const owner = await findOwnerByInstagramId(recipientId);
        if (!owner) continue;

        const senderName = await resolveInstagramName(senderId) || senderId;

        const conversation = await findOrCreateConversation(
          owner.user_id,
          "instagram",
          senderId,
          senderName
        );

        const content = message.text || "[attachment]";

        await insertMessage(
          conversation.id,
          content,
          message.mid,
          owner.user_id
        );
      }
    }
  } catch (err) {
    console.error("[instagram webhook] processing error:", err);
  }

  return NextResponse.json({ received: true });
}

async function findOwnerByInstagramId(igUserId: string) {
  const { data } = await supabaseAdmin
    .from("integrations")
    .select("user_id")
    .eq("provider", "instagram")
    .eq("status", "connected")
    .eq("provider_account_id", igUserId)
    .single();
  return data;
}

async function resolveInstagramName(igUserId: string): string | null {
  return null;
}

async function findOrCreateConversation(
  userId: string,
  channel: string,
  contactIdentifier: string,
  contactName: string
) {
  const { data: existing } = await supabaseAdmin
    .from("conversations")
    .select("id")
    .eq("user_id", userId)
    .eq("channel", channel)
    .eq("contact_identifier", contactIdentifier)
    .neq("status", "closed")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (existing) return existing;

  const { data: created, error } = await supabaseAdmin
    .from("conversations")
    .insert({
      user_id: userId,
      channel,
      contact_identifier: contactIdentifier,
      contact_name: contactName,
      status: "active",
      unread_count: 1,
    })
    .select("id")
    .single();

  if (error) throw error;
  return created!;
}

async function insertMessage(
  conversationId: string,
  content: string,
  platformMessageId: string,
  userId: string
) {
  const { error: msgError } = await supabaseAdmin.from("messages").insert({
    conversation_id: conversationId,
    direction: "inbound",
    sender_type: "lead",
    content,
    platform_message_id: platformMessageId,
  });

  if (msgError) {
    if (msgError.code === "23505") return;
    throw msgError;
  }

  await supabaseAdmin
    .from("conversations")
    .update({
      last_message_text: content.slice(0, 200),
      last_message_at: new Date().toISOString(),
      unread_count: 1,
      updated_at: new Date().toISOString(),
    })
    .eq("id", conversationId);

  await supabaseAdmin
    .from("integrations")
    .update({ last_activity_at: new Date().toISOString() })
    .eq("user_id", userId)
    .eq("provider", "instagram");
}
