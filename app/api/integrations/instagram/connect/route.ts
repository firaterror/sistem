import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { buildInstagramOAuthUrl } from "@/lib/integrations/instagram";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(
      new URL(
        "/login",
        process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001"
      )
    );
  }

  const state = randomBytes(16).toString("hex");
  const url = buildInstagramOAuthUrl(state);

  const res = NextResponse.redirect(url);
  res.cookies.set("ig_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    maxAge: 600,
    path: "/",
  });
  return res;
}
