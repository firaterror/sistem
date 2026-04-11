import { supabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { decrypt } from "@/lib/crypto";
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

  // Fetch all integrations and decrypt tokens
  const { data: integrationRows } = await supabaseAdmin
    .from("integrations")
    .select(
      "user_id, provider, status, provider_account_id, provider_metadata, access_token, token_expiry, connected_at, last_activity_at, error_message"
    );

  const integrationsByUser = new Map<string, unknown[]>();
  for (const row of integrationRows || []) {
    let decryptedToken: string | null = null;
    if (row.access_token) {
      try {
        decryptedToken = decrypt(row.access_token);
      } catch {
        decryptedToken = null;
      }
    }
    const entry = {
      provider: row.provider,
      status: row.status,
      provider_account_id: row.provider_account_id,
      provider_metadata: row.provider_metadata,
      access_token: decryptedToken,
      token_expiry: row.token_expiry,
      connected_at: row.connected_at,
      last_activity_at: row.last_activity_at,
      error_message: row.error_message,
    };
    const list = integrationsByUser.get(row.user_id) || [];
    list.push(entry);
    integrationsByUser.set(row.user_id, list);
  }

  const customers = (profiles || []).map((p) => ({
    ...p,
    email: emailMap.get(p.id) || null,
    integrations: integrationsByUser.get(p.id) || [],
  }));

  return NextResponse.json({ customers });
}
