import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { encrypt } from "@/lib/crypto";
import {
  exchangeCodeForShortLivedToken,
  exchangeForLongLivedToken,
  getInstagramUser,
} from "@/lib/integrations/instagram";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001";

function redirectWithError(reason: string) {
  const url = new URL("/dashboard/integrations", SITE_URL);
  url.searchParams.set("error", reason);
  return NextResponse.redirect(url);
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", SITE_URL));
  }

  const params = request.nextUrl.searchParams;
  const code = params.get("code");
  const returnedState = params.get("state");
  const errorParam = params.get("error");

  if (errorParam) return redirectWithError(errorParam);
  if (!code) return redirectWithError("missing_code");

  const storedState = request.cookies.get("ig_oauth_state")?.value;
  const allCookieNames = request.cookies.getAll().map((c) => c.name);
  console.log("[ig callback] debug", {
    returnedState,
    storedState,
    allCookieNames,
    cookieHeader: request.headers.get("cookie"),
  });

  if (!storedState || storedState !== returnedState) {
    return redirectWithError("invalid_state");
  }

  try {
    const shortLived = await exchangeCodeForShortLivedToken(code);
    const longLived = await exchangeForLongLivedToken(shortLived.access_token);
    const igUser = await getInstagramUser(longLived.access_token);

    const tokenExpiry = new Date(
      Date.now() + longLived.expires_in * 1000
    ).toISOString();

    const { error: upsertError } = await supabaseAdmin
      .from("integrations")
      .upsert(
        {
          user_id: user.id,
          provider: "instagram",
          status: "connected",
          access_token: encrypt(longLived.access_token),
          refresh_token: null,
          token_expiry: tokenExpiry,
          provider_account_id: igUser.id,
          provider_metadata: {
            instagram_username: igUser.username,
            account_type: igUser.account_type || null,
          },
          error_message: null,
          connected_at: new Date().toISOString(),
          last_activity_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,provider" }
      );

    if (upsertError) {
      console.error("[instagram callback] db error:", upsertError);
      return redirectWithError("db_error");
    }

    const res = NextResponse.redirect(
      new URL("/dashboard/integrations?connected=instagram", SITE_URL)
    );
    res.cookies.delete("ig_oauth_state");
    return res;
  } catch (err) {
    console.error("[instagram callback] error:", err);
    return redirectWithError("oauth_failed");
  }
}
