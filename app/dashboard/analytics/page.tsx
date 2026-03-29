import {
  Clock,
  ArrowRightLeft,
  UserCheck,
  MessageSquare,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

// ── Placeholder data (will be replaced with real n8n/DB data) ────────

const frt = {
  avg: "0s",
  median: "0s",
  p95: "0s",
  trend: 0,
};

const conversion = {
  rate: "0%",
  converted: 0,
  total: 0,
  trend: 0,
};

const handoff = {
  rate: "0%",
  count: 0,
  total: 0,
  trend: 0,
};

const channels = [
  { name: "WhatsApp", conversations: 0, conversion: "0%", avgFrt: "0s" },
  { name: "Instagram", conversations: 0, conversion: "0%", avgFrt: "0s" },
  { name: "Email", conversations: 0, conversion: "0%", avgFrt: "0s" },
];

// ── Component ────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const hasData = true;

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Track response times, conversion rates, and channel performance.
      </p>

      {/* KPI cards */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* First Response Time */}
        <div className="rounded-[var(--radius)] border border-border/60 bg-card/40 p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">
              First Response Time
            </p>
            <Clock size={14} className="text-muted-foreground" />
          </div>
          {hasData ? (
            <>
              <p className="mt-3 text-2xl font-semibold">{frt.avg}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">average</p>
              <div className="mt-4 flex gap-4">
                <div>
                  <p className="text-sm font-medium">{frt.median}</p>
                  <p className="text-[11px] text-muted-foreground">median</p>
                </div>
                <div>
                  <p className="text-sm font-medium">{frt.p95}</p>
                  <p className="text-[11px] text-muted-foreground">p95</p>
                </div>
              </div>
              {frt.trend !== 0 && (
                <div className="mt-3 flex items-center gap-1">
                  {frt.trend < 0 ? (
                    <TrendingDown size={12} className="text-emerald-500" />
                  ) : (
                    <TrendingUp size={12} className="text-red-400" />
                  )}
                  <span
                    className={`text-xs font-medium ${frt.trend < 0 ? "text-emerald-500" : "text-red-400"}`}
                  >
                    {Math.abs(frt.trend)}% vs last month
                  </span>
                </div>
              )}
            </>
          ) : (
            <div className="mt-4 rounded-[var(--radius)] border border-dashed border-border/40 py-6 text-center">
              <p className="text-xs text-muted-foreground">
                No response data yet
              </p>
            </div>
          )}
        </div>

        {/* Conversion Rate */}
        <div className="flex flex-col rounded-[var(--radius)] border border-border/60 bg-card/40 p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">
              Conversion Rate
            </p>
            <UserCheck size={14} className="text-muted-foreground" />
          </div>
          {hasData ? (
            <>
              <p className="mt-3 text-2xl font-semibold">{conversion.rate}</p>
              {conversion.trend !== 0 && (
                <div className="mt-3 flex items-center gap-1">
                  {conversion.trend > 0 ? (
                    <TrendingUp size={12} className="text-emerald-500" />
                  ) : (
                    <TrendingDown size={12} className="text-red-400" />
                  )}
                  <span
                    className={`text-xs font-medium ${conversion.trend > 0 ? "text-emerald-500" : "text-red-400"}`}
                  >
                    {Math.abs(conversion.trend)}% vs last month
                  </span>
                </div>
              )}
              <p className="mt-auto pt-4 text-xs text-muted-foreground">
                {conversion.converted} of {conversion.total} leads converted
              </p>
            </>
          ) : (
            <div className="mt-4 rounded-[var(--radius)] border border-dashed border-border/40 py-6 text-center">
              <p className="text-xs text-muted-foreground">
                No conversion data yet
              </p>
            </div>
          )}
        </div>

        {/* Handoff Rate */}
        <div className="flex flex-col rounded-[var(--radius)] border border-border/60 bg-card/40 p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">
              Handoff Rate
            </p>
            <ArrowRightLeft size={14} className="text-muted-foreground" />
          </div>
          {hasData ? (
            <>
              <p className="mt-3 text-2xl font-semibold">{handoff.rate}</p>
              {handoff.trend !== 0 && (
                <div className="mt-3 flex items-center gap-1">
                  {handoff.trend < 0 ? (
                    <TrendingDown size={12} className="text-emerald-500" />
                  ) : (
                    <TrendingUp size={12} className="text-red-400" />
                  )}
                  <span
                    className={`text-xs font-medium ${handoff.trend < 0 ? "text-emerald-500" : "text-red-400"}`}
                  >
                    {Math.abs(handoff.trend)}% vs last month
                  </span>
                </div>
              )}
              <p className="mt-auto pt-4 text-xs text-muted-foreground">
                {handoff.count} of {handoff.total} handed to human
              </p>
            </>
          ) : (
            <div className="mt-4 rounded-[var(--radius)] border border-dashed border-border/40 py-6 text-center">
              <p className="text-xs text-muted-foreground">
                No handoff data yet
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Channel Performance */}
      <div className="mt-6">
        <div className="rounded-[var(--radius)] border border-border/60 bg-card/40">
          <div className="flex items-center gap-2 border-b border-border/60 px-6 py-4">
            <MessageSquare size={14} className="text-muted-foreground" />
            <h2 className="text-sm font-semibold">Channel Performance</h2>
          </div>

          {channels.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/60 text-left">
                    <th className="px-6 py-3 text-xs font-medium text-muted-foreground">
                      Channel
                    </th>
                    <th className="px-6 py-3 text-xs font-medium text-muted-foreground">
                      Conversations
                    </th>
                    <th className="px-6 py-3 text-xs font-medium text-muted-foreground">
                      Conversion
                    </th>
                    <th className="px-6 py-3 text-xs font-medium text-muted-foreground">
                      Avg FRT
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {channels.map((ch) => (
                    <tr key={ch.name}>
                      <td className="px-6 py-3 font-medium">{ch.name}</td>
                      <td className="px-6 py-3 text-muted-foreground">
                        {ch.conversations}
                      </td>
                      <td className="px-6 py-3 text-muted-foreground">
                        {ch.conversion}
                      </td>
                      <td className="px-6 py-3 text-muted-foreground">
                        {ch.avgFrt}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-10 text-center">
              <p className="text-sm text-muted-foreground">
                No channel data yet. Performance breakdowns for WhatsApp,
                Instagram, and other channels will appear here once workflows
                are active.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
