"use client";

import { CreditCard, FileText, Loader2, ExternalLink, Check } from "lucide-react";
import { useState, useEffect } from "react";

type SubData = {
  status: string | null;
  hasSubscription: boolean;
  cancelAtPeriodEnd: boolean;
  cancelAt: string | null;
};

function daysLeft(cancelAt: string): number {
  const now = new Date();
  const end = new Date(cancelAt);
  return Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
}

export default function BillingPage() {
  const [sub, setSub] = useState<SubData | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [successBanner, setSuccessBanner] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "true") {
      setSuccessBanner(true);
      window.history.replaceState({}, "", "/dashboard/billing");
    }

    function fetchBilling() {
      fetch("/api/stripe/subscription")
        .then((res) => res.json())
        .then((data) => {
          setSub(data);
          setLoading(false);
        });
    }

    fetchBilling();

    function handleVisibility() {
      if (document.visibilityState === "visible") fetchBilling();
    }
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  async function handleCheckout() {
    setCheckoutLoading(true);
    const res = await fetch("/api/stripe/checkout", { method: "POST" });
    const data = await res.json();
    if (data.url) {
      window.open(data.url, "_blank");
    }
    setCheckoutLoading(false);
  }

  async function handlePortal() {
    setPortalLoading(true);
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const data = await res.json();
    if (data.url) {
      window.open(data.url, "_blank");
    }
    setPortalLoading(false);
  }

  const isActive = sub?.status === "active" || sub?.status === "trialing";
  const isCanceling = isActive && (sub?.cancelAtPeriodEnd || !!sub?.cancelAt);
  const remaining = sub?.cancelAt ? daysLeft(sub.cancelAt) : null;

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="h-7 w-32 rounded bg-muted/30 animate-pulse" />
        <div className="mt-2 h-4 w-64 rounded bg-muted/20 animate-pulse" />
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <div className="h-64 rounded-[var(--radius)] border border-border/60 bg-card/40 animate-pulse" />
          <div className="h-64 rounded-[var(--radius)] border border-border/60 bg-card/40 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-semibold tracking-tight">Billing</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Manage your subscription and payment details.
      </p>

      {successBanner && (
        <div className="mt-4 flex items-center gap-2 rounded-[var(--radius)] border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400">
          <Check size={16} />
          Subscription activated successfully.
        </div>
      )}

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        {/* Subscription card */}
        <div className="rounded-[var(--radius)] border border-border/60 bg-card/40">
          <div className="flex items-center gap-2 border-b border-border/60 px-6 py-4">
            <CreditCard size={16} className="text-muted-foreground" />
            <h2 className="text-sm font-semibold">Subscription</h2>
          </div>

          {isActive ? (
            <div className="divide-y divide-border/60">
              {/* Plan */}
              <div className="flex items-center justify-between px-6 py-4">
                <div>
                  <p className="text-sm font-medium">KAGAN Platform</p>
                  <p className="text-xs text-muted-foreground">$700/month</p>
                </div>
                {isCanceling ? (
                  <span className="inline-flex rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[12px] font-medium text-red-500">
                    Cancelled
                  </span>
                ) : (
                  <span className="inline-flex rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-500">
                    {sub.status === "trialing" ? "Trial" : "Active"}
                  </span>
                )}
              </div>

              {/* Cancellation notice */}
              {isCanceling && remaining !== null && (
                <div className="px-6 py-4">
                  <p className="text-sm text-red-400">
                    {remaining === 0
                      ? "Your subscription expires today."
                      : `${remaining} day${remaining === 1 ? "" : "s"} left — expires ${new Date(sub.cancelAt!).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    You can resubscribe anytime from the customer portal.
                  </p>
                </div>
              )}

              {/* Manage */}
              <div className="px-6 py-4">
                <button
                  onClick={handlePortal}
                  disabled={portalLoading}
                  className="inline-flex items-center gap-2 rounded-[var(--radius)] border border-border/60 px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground cursor-pointer disabled:opacity-50"
                >
                  {portalLoading ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <ExternalLink size={14} />
                  )}
                  Manage subscription
                </button>
                <p className="mt-2 text-xs text-muted-foreground">
                  {isCanceling
                    ? "Renew subscription, update payment method, or view invoices."
                    : "Update payment method, view invoices, or cancel."}
                </p>
              </div>
            </div>
          ) : sub?.status === "canceled" || sub?.status === "past_due" ? (
            <div className="px-6 py-8">
              <div className="flex items-center gap-2">
                <span className="inline-flex rounded-full bg-destructive/10 px-2.5 py-0.5 text-[11px] font-medium text-destructive">
                  {sub.status === "past_due" ? "Past due" : "Canceled"}
                </span>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                {sub.status === "past_due"
                  ? "Your last payment failed. Please update your payment method."
                  : "Your subscription has been canceled."}
              </p>
              <div className="mt-4 flex gap-3">
                {sub.status === "past_due" && (
                  <button
                    onClick={handlePortal}
                    disabled={portalLoading}
                    className="inline-flex items-center gap-2 rounded-[var(--radius)] bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 cursor-pointer disabled:opacity-50"
                  >
                    {portalLoading && (
                      <Loader2 size={14} className="animate-spin" />
                    )}
                    Update payment
                  </button>
                )}
                <button
                  onClick={handleCheckout}
                  disabled={checkoutLoading}
                  className="inline-flex items-center gap-2 rounded-[var(--radius)] bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 cursor-pointer disabled:opacity-50"
                >
                  {checkoutLoading && (
                    <Loader2 size={14} className="animate-spin" />
                  )}
                  Resubscribe
                </button>
              </div>
            </div>
          ) : (
            /* No subscription */
            <div className="px-6 py-8">
              <h3 className="text-lg font-semibold">KAGAN Platform</h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-3xl font-semibold">$700</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                Private AI sales execution, standard integrations, dashboard,
                and reporting.
              </p>
              <ul className="mt-5 space-y-2.5">
                {[
                  "Conversation handling and workflow automation",
                  "Lead capture and automated replies",
                  "Dashboard and sales activity reporting",
                  "Standard catalog integrations",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 text-sm text-muted-foreground"
                  >
                    <Check
                      size={14}
                      className="mt-0.5 shrink-0 text-muted-foreground"
                    />
                    {item}
                  </li>
                ))}
              </ul>
              <button
                onClick={handleCheckout}
                disabled={checkoutLoading}
                className="mt-6 inline-flex h-10 items-center gap-2 rounded-[var(--radius)] bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 cursor-pointer disabled:opacity-50"
              >
                {checkoutLoading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Redirecting…
                  </>
                ) : (
                  "Subscribe"
                )}
              </button>
            </div>
          )}
        </div>

        {/* Info card */}
        <div className="rounded-[var(--radius)] border border-border/60 bg-card/40">
          <div className="flex items-center gap-2 border-b border-border/60 px-6 py-4">
            <FileText size={16} className="text-muted-foreground" />
            <h2 className="text-sm font-semibold">Billing details</h2>
          </div>

          <div className="px-6 py-6 space-y-4">
            {isActive ? (
              <>
                <p className="text-sm text-muted-foreground">
                  Invoices, payment method updates, and cancellation are handled
                  through the Stripe Customer Portal.
                </p>
                <button
                  onClick={handlePortal}
                  disabled={portalLoading}
                  className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
                >
                  {portalLoading ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <ExternalLink size={14} />
                  )}
                  Open Customer Portal
                </button>
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  Subscribe to KAGAN Platform to access billing management,
                  invoices, and payment settings.
                </p>
                <div className="rounded-[var(--radius)] border border-dashed border-border/60 bg-muted/20 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Custom integrations
                  </p>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-xl font-semibold">+$100</span>
                    <span className="text-sm text-muted-foreground">
                      /month each
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Tailored connections to proprietary tools, legacy systems, or
                    non-catalog APIs. Available after subscribing.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
