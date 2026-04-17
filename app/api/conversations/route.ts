import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const channel = searchParams.get("channel");
  const status = searchParams.get("status");
  const search = searchParams.get("search");

  let query = supabase
    .from("conversations")
    .select("*")
    .eq("user_id", user.id)
    .order("last_message_at", { ascending: false, nullsFirst: false });

  if (channel) {
    query = query.eq("channel", channel);
  }
  if (status) {
    query = query.eq("status", status);
  }
  if (search) {
    const sanitized = search.replace(/[%_\\.,()]/g, "");
    if (sanitized) {
      query = query.or(
        `contact_name.ilike.%${sanitized}%,contact_identifier.ilike.%${sanitized}%,last_message_text.ilike.%${sanitized}%`
      );
    }
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ conversations: data || [] });
}
