import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = searchParams.get("next") ?? "/onboarding";

  if (token_hash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
      type: type as "signup" | "email",
      token_hash,
    });

    if (!error) {
      const url = request.nextUrl.clone();
      url.pathname = next;
      url.searchParams.set("verified", "true");
      url.searchParams.delete("token_hash");
      url.searchParams.delete("type");
      url.searchParams.delete("next");
      return NextResponse.redirect(url);
    }
  }

  // If verification fails, redirect to login with error
  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("error", "verification_failed");
  return NextResponse.redirect(url);
}
