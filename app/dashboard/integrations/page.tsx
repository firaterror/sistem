import {
  MessageCircle,
  Camera,
  Calendar,
  Database,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  Plug,
} from "lucide-react";

type Status = "connected" | "disconnected" | "error";

type Integration = {
  name: string;
  description: string;
  icon: React.ReactNode;
  status: Status;
  detail: string;
  lastActivity: string | null;
};

const integrations: Integration[] = [
  {
    name: "WhatsApp Business API",
    description: "Send and receive messages through WhatsApp",
    icon: <MessageCircle size={18} />,
    status: "disconnected",
    detail: "Not configured",
    lastActivity: null,
  },
  {
    name: "Instagram Messaging",
    description: "Handle DMs and story replies from Instagram",
    icon: <Camera size={18} />,
    status: "disconnected",
    detail: "Token not set",
    lastActivity: null,
  },
  {
    name: "Calendar",
    description: "Google Calendar or Outlook sync for meeting bookings",
    icon: <Calendar size={18} />,
    status: "disconnected",
    detail: "No account linked",
    lastActivity: null,
  },
  {
    name: "CRM",
    description: "Sync leads and deal stages with your CRM",
    icon: <Database size={18} />,
    status: "disconnected",
    detail: "No CRM connected",
    lastActivity: null,
  },
];

const statusConfig: Record<
  Status,
  { label: string; color: string; icon: React.ReactNode }
> = {
  connected: {
    label: "Connected",
    color: "bg-emerald-500/10 text-emerald-500",
    icon: <CheckCircle2 size={12} />,
  },
  disconnected: {
    label: "Disconnected",
    color: "bg-muted/50 text-muted-foreground",
    icon: <XCircle size={12} />,
  },
  error: {
    label: "Error",
    color: "bg-red-500/10 text-red-400",
    icon: <XCircle size={12} />,
  },
};

export default function IntegrationsPage() {
  const connectedCount = integrations.filter(
    (i) => i.status === "connected"
  ).length;

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Integrations
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Monitor connection health and manage external services.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-[var(--radius)] border border-border/60 bg-card/40 px-3 py-1.5">
          <Plug size={12} className="text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">
            {connectedCount}/{integrations.length} active
          </span>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {integrations.map((integration) => {
          const status = statusConfig[integration.status];

          return (
            <div
              key={integration.name}
              className="rounded-[var(--radius)] border border-border/60 bg-card/40 p-5"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-[var(--radius)] border border-border/60 bg-muted/30 text-muted-foreground">
                    {integration.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{integration.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {integration.description}
                    </p>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${status.color}`}
                >
                  {status.icon}
                  {status.label}
                </span>
              </div>

              {/* Details */}
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Status</span>
                  <span className="text-xs font-medium">
                    {integration.detail}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Last activity
                  </span>
                  <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                    {integration.lastActivity ? (
                      <>
                        <Clock size={10} />
                        {integration.lastActivity}
                      </>
                    ) : (
                      "—"
                    )}
                  </span>
                </div>
              </div>

              {/* Action */}
              <button
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-[var(--radius)] border border-border/60 px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground cursor-pointer"
              >
                {integration.status === "connected" ? (
                  <>
                    <ExternalLink size={12} />
                    Manage
                  </>
                ) : (
                  <>
                    <Plug size={12} />
                    Connect
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
