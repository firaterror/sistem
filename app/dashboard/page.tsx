import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LogOut } from "lucide-react";
import { VerifiedToast, WelcomeToast } from "./verified-toast";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ verified?: string; welcome?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { verified, welcome } = await searchParams;
  const firstName = user.user_metadata?.first_name || "there";

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 h-14 border-b border-border/60 backdrop-blur bg-background/80">
        <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <span className="text-lg font-semibold tracking-tight">KAGAN</span>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="inline-flex h-9 items-center gap-2 rounded-[var(--radius)] border border-border/60 px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer"
            >
              <LogOut size={14} />
              Sign out
            </button>
          </form>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-3xl font-semibold tracking-tight">
            Welcome, {firstName}
          </h1>
          <p className="mt-2 text-muted-foreground">
            Your dashboard is being built. Check back soon.
          </p>
        </div>
      </main>

      {verified === "true" && <VerifiedToast />}
      {welcome === "true" && <WelcomeToast />}
    </div>
  );
}
