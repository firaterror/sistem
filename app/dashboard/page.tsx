import Link from "next/link";
import { CreditCard } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";
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

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_subscription_id, stripe_subscription_status")
    .eq("id", user?.id ?? "")
    .single();

  const subStatus = profile?.stripe_subscription_status;
  const hasSubscription =
    !!profile?.stripe_subscription_id &&
    (subStatus === "active" || subStatus === "trialing");
  const hadSubscriptionBefore = !!profile?.stripe_subscription_id;

  // Fetch live cancellation state from Stripe
  let isCanceling = false;
  let cancelAt: string | null = null;
  let daysLeft = 0;

  if (hasSubscription && profile?.stripe_subscription_id) {
    try {
      const subscription = await getStripe().subscriptions.retrieve(
        profile.stripe_subscription_id
      );
      isCanceling =
        subscription.cancel_at_period_end || !!subscription.cancel_at;
      if (subscription.cancel_at) {
        cancelAt = new Date(
          subscription.cancel_at * 1000
        ).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
        daysLeft = Math.max(
          0,
          Math.ceil(
            (subscription.cancel_at * 1000 - Date.now()) /
              (1000 * 60 * 60 * 24)
          )
        );
      }
    } catch {
      // Fall through with defaults
    }
  }

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

          {hasSubscription ? (
            <>
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Plan</span>
                  <span className="text-sm font-medium">KAGAN</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Status</span>
                  {isCanceling ? (
                    <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-red-500">
                      Cancelled
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-500">
                      {subStatus === "trialing" ? "Trial" : "Active"}
                    </span>
                  )}
                </div>
                {isCanceling && cancelAt && (
                  <p className="text-xs text-red-400">
                    {daysLeft === 0
                      ? "Expires today"
                      : `${daysLeft} day${daysLeft === 1 ? "" : "s"} left — expires ${cancelAt}`}
                  </p>
                )}
              </div>
              <Link
                href="/dashboard/billing"
                className="mt-5 flex w-full items-center justify-center rounded-[var(--radius)] border border-border/60 px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground"
              >
                Manage subscription
              </Link>
            </>
          ) : (
            <>
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Plan</span>
                  <span className="text-sm font-medium text-muted-foreground">No subscription</span>
                </div>
                {subStatus === "past_due" && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Status</span>
                    <span className="inline-flex items-center rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                      Past due
                    </span>
                  </div>
                )}
                {subStatus === "canceled" && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Status</span>
                    <span className="inline-flex items-center rounded-full bg-yellow-500/10 px-2 py-0.5 text-xs font-medium text-yellow-500">
                      Canceled
                    </span>
                  </div>
                )}
              </div>
              <Link
                href="/dashboard/billing"
                className="mt-5 flex w-full items-center justify-center rounded-[var(--radius)] bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                {hadSubscriptionBefore ? "Resubscribe" : "Start a free trial"}
              </Link>
            </>
          )}
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
