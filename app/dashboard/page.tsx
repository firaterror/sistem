import { createClient } from "@/lib/supabase/server";
import { VerifiedToast, WelcomeToast } from "./verified-toast";

export default async function OverviewPage({
  searchParams,
}: {
  searchParams: Promise<{ verified?: string; welcome?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { verified, welcome } = await searchParams;
  const firstName = user?.user_metadata?.first_name || "there";

  return (
    <div className="p-6 lg:p-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome back, {firstName}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Here&apos;s what&apos;s happening with your pipeline.
        </p>
      </div>

      {/* Stat cards placeholder */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Active leads", value: "—" },
          { label: "Open conversations", value: "—" },
          { label: "Avg. response time", value: "—" },
          { label: "Meetings booked", value: "—" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-[var(--radius)] border border-border/60 bg-card/40 p-5"
          >
            <p className="text-xs font-medium text-muted-foreground">
              {stat.label}
            </p>
            <p className="mt-2 text-2xl font-semibold">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Activity placeholder */}
      <div className="mt-8 rounded-[var(--radius)] border border-border/60 bg-card/40 p-6">
        <h2 className="text-lg font-semibold">Recent activity</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          No activity yet. Leads and conversations will appear here once your
          workflows are running.
        </p>
      </div>

      {verified === "true" && <VerifiedToast />}
      {welcome === "true" && <WelcomeToast />}
    </div>
  );
}
