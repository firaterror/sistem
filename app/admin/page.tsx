import { Users, CreditCard, DollarSign, UserPlus } from "lucide-react";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  // Fetch all profiles
  const { data: profiles } = await supabaseAdmin
    .from("profiles")
    .select(
      "id, first_name, last_name, company_name, stripe_subscription_status, stripe_customer_id, created_at"
    )
    .order("created_at", { ascending: false });

  const allUsers = profiles || [];
  const totalUsers = allUsers.length;
  const activeSubscribers = allUsers.filter(
    (p) =>
      p.stripe_subscription_status === "active" ||
      p.stripe_subscription_status === "trialing"
  ).length;
  const mrr = activeSubscribers * 700;

  // Recent signups (last 7 days)
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const recentSignups = allUsers.filter(
    (p) => p.created_at && p.created_at > weekAgo
  );

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-semibold tracking-tight">Staff Overview</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Platform metrics and recent activity.
      </p>

      {/* Stat cards */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-[var(--radius)] border border-border/60 bg-card/40 p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">
              Total Users
            </p>
            <Users size={14} className="text-muted-foreground" />
          </div>
          <p className="mt-3 text-2xl font-semibold">{totalUsers}</p>
        </div>
        <div className="rounded-[var(--radius)] border border-border/60 bg-card/40 p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">
              Active Subscribers
            </p>
            <CreditCard size={14} className="text-muted-foreground" />
          </div>
          <p className="mt-3 text-2xl font-semibold">{activeSubscribers}</p>
        </div>
        <div className="rounded-[var(--radius)] border border-border/60 bg-card/40 p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">MRR</p>
            <DollarSign size={14} className="text-muted-foreground" />
          </div>
          <p className="mt-3 text-2xl font-semibold">
            ${mrr.toLocaleString()}
          </p>
        </div>
        <div className="rounded-[var(--radius)] border border-border/60 bg-card/40 p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">
              Signups (7d)
            </p>
            <UserPlus size={14} className="text-muted-foreground" />
          </div>
          <p className="mt-3 text-2xl font-semibold">{recentSignups.length}</p>
        </div>
      </div>

      {/* Recent signups table */}
      <div className="mt-8 rounded-[var(--radius)] border border-border/60 bg-card/40">
        <div className="flex items-center gap-2 border-b border-border/60 px-6 py-4">
          <UserPlus size={14} className="text-muted-foreground" />
          <h2 className="text-sm font-semibold">Recent Signups</h2>
        </div>

        {allUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 text-left">
                  <th className="px-6 py-3 text-xs font-medium text-muted-foreground">
                    Name
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-muted-foreground">
                    Company
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-muted-foreground">
                    Subscription
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-muted-foreground">
                    Signed up
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {allUsers.slice(0, 10).map((user) => (
                  <tr key={user.id} className="hover:bg-accent/20 transition-colors">
                    <td className="whitespace-nowrap px-6 py-3 font-medium">
                      {user.first_name} {user.last_name}
                    </td>
                    <td className="whitespace-nowrap px-6 py-3 text-muted-foreground">
                      {user.company_name || "—"}
                    </td>
                    <td className="whitespace-nowrap px-6 py-3">
                      {user.stripe_subscription_status === "active" ||
                      user.stripe_subscription_status === "trialing" ? (
                        <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-500">
                          Active
                        </span>
                      ) : user.stripe_subscription_status ? (
                        <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-500">
                          {user.stripe_subscription_status}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          Free
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-3 text-xs text-muted-foreground">
                      {user.created_at
                        ? new Date(user.created_at).toLocaleDateString(
                            "en-US",
                            { month: "short", day: "numeric", year: "numeric" }
                          )
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-10 text-center">
            <p className="text-sm text-muted-foreground">No users yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
