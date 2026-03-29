import {
  UserPlus,
  MessageSquare,
  BadgeCheck,
  CalendarCheck,
  Trophy,
  XCircle,
  Search,
  Filter,
  Clock,
  ChevronRight,
} from "lucide-react";

// ── Pipeline stages ──────────────────────────────────────────────────

type Stage = "new" | "engaged" | "qualified" | "appointment" | "won" | "lost";

const stages: {
  key: Stage;
  label: string;
  icon: React.ReactNode;
  color: string;
  dotColor: string;
}[] = [
  {
    key: "new",
    label: "New",
    icon: <UserPlus size={14} />,
    color: "bg-blue-500/10 text-blue-400",
    dotColor: "bg-blue-400",
  },
  {
    key: "engaged",
    label: "Engaged",
    icon: <MessageSquare size={14} />,
    color: "bg-violet-500/10 text-violet-400",
    dotColor: "bg-violet-400",
  },
  {
    key: "qualified",
    label: "Qualified",
    icon: <BadgeCheck size={14} />,
    color: "bg-amber-500/10 text-amber-400",
    dotColor: "bg-amber-400",
  },
  {
    key: "appointment",
    label: "Appointment",
    icon: <CalendarCheck size={14} />,
    color: "bg-cyan-500/10 text-cyan-400",
    dotColor: "bg-cyan-400",
  },
  {
    key: "won",
    label: "Won",
    icon: <Trophy size={14} />,
    color: "bg-emerald-500/10 text-emerald-500",
    dotColor: "bg-emerald-500",
  },
  {
    key: "lost",
    label: "Lost",
    icon: <XCircle size={14} />,
    color: "bg-red-500/10 text-red-400",
    dotColor: "bg-red-400",
  },
];

// ── Mock data ────────────────────────────────────────────────────────

type Lead = {
  id: string;
  name: string;
  company: string;
  channel: string;
  stage: Stage;
  movedAt: string;
  value: string;
};

const leads: Lead[] = [];

// ── Component ────────────────────────────────────────────────────────

export default function LeadsPage() {
  const stageCounts = stages.map((s) => ({
    ...s,
    count: leads.filter((l) => l.stage === s.key).length,
  }));

  const totalLeads = leads.length;

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Leads</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track prospects through your sales pipeline.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-[var(--radius)] border border-border/60 bg-card/40 px-3 py-1.5">
          <span className="text-xs font-medium text-muted-foreground">
            {totalLeads} total
          </span>
        </div>
      </div>

      {/* Pipeline funnel */}
      <div className="mt-8 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {stageCounts.map((stage) => (
          <div
            key={stage.key}
            className="rounded-[var(--radius)] border border-border/60 bg-card/40 p-4"
          >
            <div className="flex items-center gap-2">
              <span className={`rounded-full p-1 ${stage.color}`}>
                {stage.icon}
              </span>
              <p className="text-xs font-medium text-muted-foreground">
                {stage.label}
              </p>
            </div>
            <p className="mt-3 text-2xl font-semibold">{stage.count}</p>
          </div>
        ))}
      </div>

      {/* Leads table */}
      <div className="mt-6 rounded-[var(--radius)] border border-border/60 bg-card/40">
        <div className="flex items-center justify-between border-b border-border/60 px-6 py-4">
          <h2 className="text-sm font-semibold">All Leads</h2>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-[var(--radius)] border border-border/60 bg-muted/20 px-3 py-1.5">
              <Search size={12} className="text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Search...</span>
            </div>
            <button className="flex items-center gap-1.5 rounded-[var(--radius)] border border-border/60 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground cursor-pointer">
              <Filter size={12} />
              Filter
            </button>
          </div>
        </div>

        {leads.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 text-left">
                  <th className="px-6 py-3 text-xs font-medium text-muted-foreground">
                    Lead
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-muted-foreground">
                    Company
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-muted-foreground">
                    Channel
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-muted-foreground">
                    Stage
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-muted-foreground">
                    Last Activity
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-muted-foreground">
                    Value
                  </th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {leads.map((lead) => {
                  const stage = stages.find((s) => s.key === lead.stage);
                  return (
                    <tr
                      key={lead.id}
                      className="transition-colors hover:bg-accent/20"
                    >
                      <td className="whitespace-nowrap px-6 py-3 font-medium">
                        {lead.name}
                      </td>
                      <td className="whitespace-nowrap px-6 py-3 text-muted-foreground">
                        {lead.company}
                      </td>
                      <td className="whitespace-nowrap px-6 py-3 text-muted-foreground">
                        {lead.channel}
                      </td>
                      <td className="whitespace-nowrap px-6 py-3">
                        {stage && (
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ${stage.color}`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${stage.dotColor}`}
                            />
                            {stage.label}
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-3">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock size={10} />
                          {lead.movedAt}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-3 font-medium">
                        {lead.value}
                      </td>
                      <td className="px-6 py-3">
                        <ChevronRight
                          size={14}
                          className="text-muted-foreground"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-10 text-center">
            <p className="text-sm text-muted-foreground">
              No leads yet. Incoming leads from WhatsApp, Instagram, and other
              channels will appear here as they enter your pipeline.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
