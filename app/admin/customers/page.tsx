"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Search,
  ChevronDown,
  Clock,
  Building2,
  Target,
  Palette,
  Radio,
  Mail,
  Globe,
  CreditCard,
  Loader2,
  Plug,
  Eye,
  EyeOff,
  Copy,
  Check,
} from "lucide-react";

type Integration = {
  provider: string;
  status: string;
  provider_account_id: string | null;
  provider_metadata: Record<string, unknown> | null;
  access_token: string | null;
  token_expiry: string | null;
  connected_at: string | null;
  last_activity_at: string | null;
  error_message: string | null;
};

type Customer = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  company_name: string | null;
  industry: string | null;
  timezone: string | null;
  primary_goal: string | null;
  brand_tone: string | null;
  default_language: string | null;
  channels: string[] | null;
  business_hours: Record<string, { enabled: boolean; start: string; end: string }> | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  stripe_subscription_status: string | null;
  onboarding_completed: boolean | null;
  created_at: string | null;
  integrations: Integration[] | null;
};

const DAY_ORDER = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "subscribed" | "free">("all");
  const [revealedTokens, setRevealedTokens] = useState<Set<string>>(new Set());
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  function toggleToken(key: string) {
    setRevealedTokens((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  async function copyToken(key: string, token: string) {
    await navigator.clipboard.writeText(token);
    setCopiedToken(key);
    setTimeout(() => setCopiedToken(null), 1500);
  }

  useEffect(() => {
    fetch("/api/admin/customers")
      .then((res) => res.json())
      .then((data) => {
        setCustomers(data.customers || []);
        setLoading(false);
      });
  }, []);

  const filtered = customers.filter((c) => {
    const matchesSearch =
      !search ||
      `${c.first_name} ${c.last_name} ${c.company_name} ${c.email}`
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesFilter =
      filter === "all" ||
      (filter === "subscribed" &&
        (c.stripe_subscription_status === "active" ||
          c.stripe_subscription_status === "trialing")) ||
      (filter === "free" && !c.stripe_subscription_id);

    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 size={20} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-semibold tracking-tight">Customers</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        All registered users and their onboarding details.
      </p>

      {/* Controls */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 rounded-[var(--radius)] border border-border/60 bg-muted/20 px-3 py-1.5">
          <Search size={12} className="text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, company, or email..."
            className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-64"
          />
        </div>
        <div className="flex gap-1 rounded-[var(--radius)] border border-border/60 bg-muted/20 p-1">
          {(["all", "subscribed", "free"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-[calc(var(--radius)-2px)] px-3 py-1 text-xs font-medium transition-colors cursor-pointer capitalize ${
                filter === f
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <span className="text-xs text-muted-foreground">
          {filtered.length} result{filtered.length !== 1 && "s"}
        </span>
      </div>

      {/* Customer list */}
      <div className="mt-6 rounded-[var(--radius)] border border-border/60 bg-card/40">
        <div className="flex items-center gap-2 border-b border-border/60 px-6 py-4">
          <Users size={14} className="text-muted-foreground" />
          <h2 className="text-sm font-semibold">Customer List</h2>
        </div>

        {filtered.length > 0 ? (
          <div className="divide-y divide-border/60">
            {filtered.map((customer) => {
              const isExpanded = expanded === customer.id;
              const isSubscribed =
                customer.stripe_subscription_status === "active" ||
                customer.stripe_subscription_status === "trialing";

              return (
                <div key={customer.id}>
                  {/* Row */}
                  <button
                    onClick={() =>
                      setExpanded(isExpanded ? null : customer.id)
                    }
                    className="flex w-full items-center justify-between px-6 py-4 text-left transition-colors hover:bg-accent/20 cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted/30 text-xs font-medium text-muted-foreground">
                        {(customer.first_name?.[0] || "") +
                          (customer.last_name?.[0] || "")}
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {customer.first_name} {customer.last_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {customer.email}
                          {customer.company_name &&
                            ` · ${customer.company_name}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {isSubscribed ? (
                        <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-500">
                          Subscribed
                        </span>
                      ) : customer.stripe_subscription_status ? (
                        <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-500 capitalize">
                          {customer.stripe_subscription_status}
                        </span>
                      ) : (
                        <span className="text-[11px] text-muted-foreground">
                          Free
                        </span>
                      )}
                      {customer.onboarding_completed ? (
                        <span className="inline-flex items-center rounded-full bg-blue-500/10 px-2 py-0.5 text-[11px] font-medium text-blue-400">
                          Onboarded
                        </span>
                      ) : (
                        <span className="text-[11px] text-muted-foreground">
                          Not onboarded
                        </span>
                      )}
                      <ChevronDown
                        size={14}
                        className={`text-muted-foreground transition-transform ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </button>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="border-t border-border/40 bg-muted/10 px-6 py-5">
                      <div className="grid gap-6 lg:grid-cols-2">
                        {/* Company & Goals */}
                        <div className="space-y-4">
                          <div>
                            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                              <Building2 size={12} />
                              Company
                            </p>
                            <div className="mt-2 space-y-2">
                              <Detail
                                label="Company"
                                value={customer.company_name}
                              />
                              <Detail
                                label="Industry"
                                value={customer.industry}
                              />
                              <Detail
                                label="Timezone"
                                value={customer.timezone}
                              />
                            </div>
                          </div>

                          <div>
                            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                              <Target size={12} />
                              Goals
                            </p>
                            <div className="mt-2 space-y-2">
                              <Detail
                                label="Primary goal"
                                value={customer.primary_goal}
                              />
                            </div>
                          </div>

                          <div>
                            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                              <Palette size={12} />
                              Brand & Language
                            </p>
                            <div className="mt-2 space-y-2">
                              <Detail
                                label="Tone"
                                value={customer.brand_tone}
                              />
                              <Detail
                                label="Language"
                                value={customer.default_language}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Channels & Subscription */}
                        <div className="space-y-4">
                          <div>
                            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                              <Radio size={12} />
                              Channels
                            </p>
                            <div className="mt-2">
                              {customer.channels &&
                              customer.channels.length > 0 ? (
                                <div className="flex flex-wrap gap-1.5">
                                  {customer.channels.map((ch) => (
                                    <span
                                      key={ch}
                                      className="rounded-full border border-border/60 bg-card/40 px-2.5 py-0.5 text-xs font-medium"
                                    >
                                      {ch}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-xs text-muted-foreground">
                                  —
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Business hours */}
                          {customer.business_hours && (
                            <div>
                              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                <Clock size={12} />
                                Business Hours
                              </p>
                              <div className="mt-2 space-y-1">
                                {Object.entries(customer.business_hours)
                                  .sort(
                                    ([a], [b]) =>
                                      DAY_ORDER.indexOf(a.toLowerCase()) -
                                      DAY_ORDER.indexOf(b.toLowerCase())
                                  )
                                  .map(
                                  ([day, hours]) => (
                                    <div
                                      key={day}
                                      className="flex items-center justify-between text-xs"
                                    >
                                      <span className="capitalize text-muted-foreground w-20">
                                        {day}
                                      </span>
                                      {hours.enabled ? (
                                        <span className="font-medium">
                                          {hours.start} – {hours.end}
                                        </span>
                                      ) : (
                                        <span className="text-muted-foreground">
                                          Closed
                                        </span>
                                      )}
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          )}

                          <div>
                            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                              <CreditCard size={12} />
                              Subscription
                            </p>
                            <div className="mt-2 space-y-2">
                              <Detail
                                label="Status"
                                value={
                                  customer.stripe_subscription_status || "None"
                                }
                              />
                              <Detail
                                label="Customer ID"
                                value={customer.stripe_customer_id}
                              />
                              <Detail
                                label="Subscription ID"
                                value={customer.stripe_subscription_id}
                              />
                            </div>
                          </div>

                          <div>
                            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                              <Mail size={12} />
                              Contact
                            </p>
                            <div className="mt-2 space-y-2">
                              <Detail label="Email" value={customer.email} />
                              <Detail
                                label="Joined"
                                value={
                                  customer.created_at
                                    ? new Date(
                                        customer.created_at
                                      ).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                      })
                                    : null
                                }
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Integrations */}
                      <div className="mt-6 border-t border-border/40 pt-5">
                        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          <Plug size={12} />
                          Integrations
                        </p>
                        {customer.integrations &&
                        customer.integrations.length > 0 ? (
                          <div className="mt-3 space-y-3">
                            {customer.integrations.map((intg) => {
                              const key = `${customer.id}:${intg.provider}`;
                              const revealed = revealedTokens.has(key);
                              const meta = intg.provider_metadata as
                                | { instagram_username?: string; page_name?: string }
                                | null;
                              const accountLabel =
                                meta?.instagram_username
                                  ? `@${meta.instagram_username}`
                                  : meta?.page_name ||
                                    intg.provider_account_id ||
                                    "—";
                              return (
                                <div
                                  key={intg.provider}
                                  className="rounded-[var(--radius)] border border-border/60 bg-card/40 p-3"
                                >
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="text-xs font-medium capitalize">
                                        {intg.provider}
                                      </p>
                                      <p className="text-[11px] text-muted-foreground">
                                        {accountLabel}
                                      </p>
                                    </div>
                                    <span
                                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                        intg.status === "connected"
                                          ? "bg-emerald-500/10 text-emerald-500"
                                          : intg.status === "error"
                                          ? "bg-red-500/10 text-red-400"
                                          : "bg-muted/50 text-muted-foreground"
                                      }`}
                                    >
                                      {intg.status}
                                    </span>
                                  </div>
                                  {intg.access_token && (
                                    <div className="mt-2">
                                      <div className="flex items-center gap-2">
                                        <code className="flex-1 truncate rounded bg-muted/30 px-2 py-1 font-mono text-[10px]">
                                          {revealed
                                            ? intg.access_token
                                            : "•".repeat(40)}
                                        </code>
                                        <button
                                          onClick={() => toggleToken(key)}
                                          className="rounded border border-border/60 p-1 text-muted-foreground hover:text-foreground cursor-pointer"
                                          title={revealed ? "Hide" : "Show"}
                                        >
                                          {revealed ? (
                                            <EyeOff size={10} />
                                          ) : (
                                            <Eye size={10} />
                                          )}
                                        </button>
                                        <button
                                          onClick={() =>
                                            copyToken(key, intg.access_token!)
                                          }
                                          className="rounded border border-border/60 p-1 text-muted-foreground hover:text-foreground cursor-pointer"
                                          title="Copy"
                                        >
                                          {copiedToken === key ? (
                                            <Check
                                              size={10}
                                              className="text-emerald-500"
                                            />
                                          ) : (
                                            <Copy size={10} />
                                          )}
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                  <div className="mt-2 grid grid-cols-2 gap-2 text-[10px] text-muted-foreground">
                                    <div>
                                      <span className="block">Connected</span>
                                      <span className="font-medium text-foreground">
                                        {intg.connected_at
                                          ? new Date(
                                              intg.connected_at
                                            ).toLocaleDateString()
                                          : "—"}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="block">Expires</span>
                                      <span className="font-medium text-foreground">
                                        {intg.token_expiry
                                          ? new Date(
                                              intg.token_expiry
                                            ).toLocaleDateString()
                                          : "—"}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="mt-2 text-xs text-muted-foreground">
                            No integrations connected.
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="px-6 py-10 text-center">
            <p className="text-sm text-muted-foreground">
              {search || filter !== "all"
                ? "No customers match your search."
                : "No customers yet."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function Detail({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-xs font-medium">{value || "—"}</span>
    </div>
  );
}
