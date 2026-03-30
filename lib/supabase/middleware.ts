import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Redirect unauthenticated users away from protected routes
  if (
    !user &&
    (pathname.startsWith("/dashboard") ||
      pathname.startsWith("/onboarding") ||
      pathname.startsWith("/admin"))
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users away from auth pages
  if (
    user &&
    (pathname === "/login" || pathname === "/register")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // Block non-admin users from /admin routes (cached in cookie)
  if (user && pathname.startsWith("/admin")) {
    const adminCached = request.cookies.get("is_admin")?.value;

    if (adminCached !== "true") {
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();

      if (!profile?.is_admin) {
        const url = request.nextUrl.clone();
        url.pathname = "/dashboard";
        return NextResponse.redirect(url);
      }

      supabaseResponse.cookies.set("is_admin", "true", {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
    }
  }

  // Check onboarding status — use cookie cache to avoid DB query on every navigation
  if (user && pathname.startsWith("/dashboard")) {
    const onboardingDone = request.cookies.get("onboarding_completed")?.value;

    if (onboardingDone !== "true") {
      // Only query DB if cookie isn't set
      const { data: profile } = await supabase
        .from("profiles")
        .select("onboarding_completed")
        .eq("id", user.id)
        .single();

      if (profile && !profile.onboarding_completed) {
        const url = request.nextUrl.clone();
        url.pathname = "/onboarding";
        return NextResponse.redirect(url);
      }

      // Cache the result so we don't query again
      supabaseResponse.cookies.set("onboarding_completed", "true", {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
    }
  }

  return supabaseResponse;
}
