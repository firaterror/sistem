import { CreditCard, FileText, Download } from "lucide-react";

const plan = {
  name: "Pro",
  price: "$49",
  interval: "month",
};

const integrations = {
  count: 2,
  unitPrice: 12,
};

const nextBillingDate = "Apr 25, 2026";

const paymentMethod = {
  brand: "Visa",
  last4: "4242",
};

const invoices = [
  { id: "INV-0041", date: "Mar 25, 2026", amount: "$73.00", status: "Paid" as const },
  { id: "INV-0040", date: "Feb 25, 2026", amount: "$73.00", status: "Paid" as const },
  { id: "INV-0039", date: "Jan 25, 2026", amount: "$61.00", status: "Paid" as const },
  { id: "INV-0038", date: "Dec 25, 2025", amount: "$49.00", status: "Paid" as const },
  { id: "INV-0037", date: "Nov 25, 2025", amount: "$49.00", status: "Paid" as const },
];

const statusColor: Record<string, string> = {
  Paid: "bg-emerald-500/10 text-emerald-500",
  Pending: "bg-yellow-500/10 text-yellow-500",
  Failed: "bg-destructive/10 text-destructive",
};

export default function BillingPage() {
  const integrationTotal = integrations.count * integrations.unitPrice;
  const monthlyTotal =
    Number(plan.price.replace("$", "")) + integrationTotal;

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-semibold tracking-tight">Billing</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Manage your subscription and invoices.
      </p>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        {/* Subscription card */}
        <div className="rounded-[var(--radius)] border border-border/60 bg-card/40">
          <div className="flex items-center gap-2 border-b border-border/60 px-6 py-4">
            <CreditCard size={16} className="text-muted-foreground" />
            <h2 className="text-sm font-semibold">Subscription</h2>
          </div>

          <div className="divide-y divide-border/60">
            {/* Plan */}
            <div className="flex items-center justify-between px-6 py-4">
              <div>
                <p className="text-sm font-medium">{plan.name} plan</p>
                <p className="text-xs text-muted-foreground">
                  {plan.price}/{plan.interval} base
                </p>
              </div>
              <button className="rounded-[var(--radius)] border border-border/60 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground">
                Change plan
              </button>
            </div>

            {/* Custom integrations */}
            <div className="flex items-center justify-between px-6 py-4">
              <div>
                <p className="text-sm font-medium">
                  Custom integrations
                  <span className="ml-1.5 inline-flex items-center rounded-full bg-accent px-2 py-0.5 text-[11px] font-medium">
                    {integrations.count}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground">
                  ${integrations.unitPrice}/integration &middot; ${integrationTotal}/mo
                </p>
              </div>
              <button className="rounded-[var(--radius)] border border-border/60 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground">
                Manage
              </button>
            </div>

            {/* Next billing */}
            <div className="flex items-center justify-between px-6 py-4">
              <div>
                <p className="text-xs text-muted-foreground">Next billing date</p>
                <p className="mt-0.5 text-sm font-medium">{nextBillingDate}</p>
              </div>
              <p className="text-right">
                <span className="text-lg font-semibold">${monthlyTotal.toFixed(2)}</span>
                <span className="text-xs text-muted-foreground">/mo</span>
              </p>
            </div>

            {/* Payment method */}
            <div className="flex items-center justify-between px-6 py-4">
              <div>
                <p className="text-xs text-muted-foreground">Payment method</p>
                <p className="mt-0.5 text-sm font-medium">
                  {paymentMethod.brand} ending in {paymentMethod.last4}
                </p>
              </div>
              <button className="rounded-[var(--radius)] border border-border/60 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground">
                Update
              </button>
            </div>
          </div>
        </div>

        {/* Recent invoices card */}
        <div className="rounded-[var(--radius)] border border-border/60 bg-card/40">
          <div className="flex items-center gap-2 border-b border-border/60 px-6 py-4">
            <FileText size={16} className="text-muted-foreground" />
            <h2 className="text-sm font-semibold">Recent invoices</h2>
          </div>

          <div className="divide-y divide-border/60">
            {invoices.map((inv) => (
              <div
                key={inv.id}
                className="flex items-center justify-between px-6 py-3.5"
              >
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-sm font-medium">{inv.id}</p>
                    <p className="text-xs text-muted-foreground">{inv.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">{inv.amount}</span>
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${
                      statusColor[inv.status] ?? ""
                    }`}
                  >
                    {inv.status}
                  </span>
                  <button
                    className="text-muted-foreground transition-colors hover:text-foreground"
                    aria-label={`Download ${inv.id}`}
                  >
                    <Download size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-border/60 px-6 py-4">
            <button className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
              View all invoices &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
