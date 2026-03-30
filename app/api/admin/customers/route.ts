import { supabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  // Verify the requesting user is an admin
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Fetch all profiles with admin client (bypasses RLS)
  const { data: profiles } = await supabaseAdmin
    .from("profiles")
    .select(
      "id, first_name, last_name, company_name, industry, timezone, primary_goal, brand_tone, default_language, channels, business_hours, stripe_customer_id, stripe_subscription_id, stripe_subscription_status, onboarding_completed, created_at"
    )
    .order("created_at", { ascending: false });

  // Fetch emails from auth.users
  const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers();

  const emailMap = new Map<string, string>();
  if (authUsers?.users) {
    for (const u of authUsers.users) {
      if (u.email) emailMap.set(u.id, u.email);
    }
  }

  const customers = (profiles || []).map((p) => ({
    ...p,
    email: emailMap.get(p.id) || null,
  }));

  return NextResponse.json({ customers });
}
