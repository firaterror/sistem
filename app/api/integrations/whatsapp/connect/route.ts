import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { encrypt } from "@/lib/crypto";

const GRAPH_URL = "https://graph.facebook.com/v22.0";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { access_token: accessToken } = await request.json();
  if (!accessToken) {
    return NextResponse.json({ error: "Missing access_token" }, { status: 400 });
  }

  try {
    const debugRes = await fetch(
      `${GRAPH_URL}/debug_token?input_token=${accessToken}&access_token=${process.env.META_APP_ID!}|${process.env.META_APP_SECRET!}`
    );
    const debugData = await debugRes.json();
    console.log("[whatsapp connect] debug_token:", JSON.stringify(debugData));

    const granularScopes = debugData?.data?.granular_scopes || [];
    const wabaScope = granularScopes.find(
      (s: { scope: string; target_ids?: string[] }) =>
        s.scope === "whatsapp_business_management"
    );
    const wabaId = wabaScope?.target_ids?.[0] || null;

    let phoneNumber: string | null = null;
    let phoneNumberId: string | null = null;

    if (wabaId) {
      const phonesRes = await fetch(
        `${GRAPH_URL}/${wabaId}/phone_numbers?access_token=${accessToken}`
      );
      if (phonesRes.ok) {
        const phonesData = await phonesRes.json();
        const firstPhone = phonesData?.data?.[0];
        if (firstPhone) {
          phoneNumber = firstPhone.display_phone_number || firstPhone.phone_number;
          phoneNumberId = firstPhone.id;
        }
      }
    }

    const { error: upsertError } = await supabaseAdmin
      .from("integrations")
      .upsert(
        {
          user_id: user.id,
          provider: "whatsapp",
          status: "connected",
          access_token: encrypt(accessToken),
          refresh_token: null,
          token_expiry: null,
          provider_account_id: phoneNumberId || wabaId,
          provider_metadata: {
            waba_id: wabaId,
            phone_number_id: phoneNumberId,
            phone_number: phoneNumber,
            scopes: granularScopes,
          },
          error_message: null,
          connected_at: new Date().toISOString(),
          last_activity_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,provider" }
      );

    if (upsertError) {
      console.error("[whatsapp connect] db error:", upsertError);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      phone_number: phoneNumber,
      waba_id: wabaId,
    });
  } catch (err) {
    console.error("[whatsapp connect] error:", err);
    return NextResponse.json(
      { error: "Connection failed" },
      { status: 500 }
    );
  }
}
