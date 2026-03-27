import Link from "next/link";
import { CreditCard } from "lucide-react";
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
          Here&apos;s what&apos;s happening...
        </p>
      </div>

      {/* Stat cards placeholder */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Leads This Month", value: "0" },
          { label: "Active conversations", value: "0" },
          { label: "Conversion Rate", value: "0%" },
          { label: "Meetings booked", value: "0" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-[var(--radius)] border border-border/60 bg-card/40 p-5"
          >

            <p className="text-xs font-medium text-muted-foreground">
              {stat.label}
            </p>
            <p className="mt-2 text-2xl font-semibold">{stat.value}</p>
            {stat.label === "Active conversations" && (
              <span className="text-xs text-muted-foreground">0 awaiting human review</span>
            )}
            {stat.label === "Conversion Rate" && (
              <span className="text-xs text-muted-foreground">Pipeline +0% vs prior month</span>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        {/* Billing snapshot */}
        <div className="rounded-[var(--radius)] border border-border/60 bg-card/40 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Billing</h2>
            <CreditCard size={16} className="text-muted-foreground" />
          </div>

          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Plan</span>
              <span className="text-sm font-medium">Free</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Status</span>
              <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-500">
                Active
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Next billing</span>
              <span className="text-sm text-muted-foreground">—</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Monthly cost</span>
              <span className="text-sm font-medium">$0.00</span>
            </div>
          </div>

          <Link
            href="/dashboard/billing"
            className="mt-5 flex w-full items-center justify-center rounded-[var(--radius)] border border-border/60 px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground"
          >
            Manage subscription
          </Link>
        </div>

        {/* Recent activity */}
        <div className="lg:col-span-2 rounded-[var(--radius)] border border-border/60 bg-card/40 p-6">
          <h2 className="text-sm font-semibold">Recent activity</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            No activity yet. Leads and conversations will appear here once your
            workflows are running.
          </p>
        </div>
      </div>

      {verified === "true" && <VerifiedToast />}
      {welcome === "true" && <WelcomeToast />}
    </div>
  );
}
