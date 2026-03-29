import {
  Play,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Clock,
  ChevronDown,
  Zap,
  AlertTriangle,
} from "lucide-react";

// ── Workflow step definitions ────────────────────────────────────────

const workflowSteps: Record<string, { name: string; description: string }> = {
  "WF-01": {
    name: "Message Intake",
    description:
      "Incoming message enters the system. Channel info and timestamp are recorded.",
  },
  "WF-02": {
    name: "Buffer",
    description:
      "Message is briefly held. If the user sends multiple messages, they are merged.",
  },
  "WF-03": {
    name: "AI Brain",
    description:
      "AI analyzes the message, determines intent, and selects the appropriate strategy.",
  },
  "WF-04": {
    name: "Tool Use",
    description:
      "External tools are called if needed — calendar checks, knowledge base queries, etc.",
  },
  "WF-05": {
    name: "Suggestion",
    description:
      "AI generates a reply suggestion. In auto mode, it is sent directly.",
  },
  "WF-06": {
    name: "Knowledge Retrieval",
    description:
      "Relevant information is pulled from the knowledge base and appended to the reply.",
  },
  "WF-OUT": {
    name: "Response Delivery",
    description:
      "Final reply is sent to the user and saved to conversation history.",
  },
  "WF-ERR": {
    name: "Error Handling",
    description:
      "If any step fails, the error is logged and a retry is attempted if applicable.",
  },
};

// ── Mock execution data ──────────────────────────────────────────────

type ExecutionStatus = "success" | "failed" | "retried";

type Execution = {
  id: string;
  workflow: string;
  status: ExecutionStatus;
  startedAt: string;
  duration: string;
  error: string | null;
  retried: boolean;
  steps: string[];
};

const executions: Execution[] = [];

// ── Status config ────────────────────────────────────────────────────

const statusConfig: Record<
  ExecutionStatus,
  { label: string; color: string; icon: React.ReactNode }
> = {
  success: {
    label: "Success",
    color: "bg-emerald-500/10 text-emerald-500",
    icon: <CheckCircle2 size={12} />,
  },
  failed: {
    label: "Failed",
    color: "bg-red-500/10 text-red-400",
    icon: <XCircle size={12} />,
  },
  retried: {
    label: "Retried",
    color: "bg-amber-500/10 text-amber-500",
    icon: <RefreshCw size={12} />,
  },
};

// ── Component ────────────────────────────────────────────────────────

export default function WorkflowsPage() {
  const successCount = executions.filter((e) => e.status === "success").length;
  const failedCount = executions.filter((e) => e.status === "failed").length;
  const retriedCount = executions.filter((e) => e.status === "retried").length;

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-semibold tracking-tight">Workflows</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Monitor automation executions and workflow health.
      </p>

      {/* Summary cards */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-[var(--radius)] border border-border/60 bg-card/40 p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">
              Successful
            </p>
            <CheckCircle2 size={14} className="text-emerald-500" />
          </div>
          <p className="mt-3 text-2xl font-semibold">{successCount}</p>
        </div>
        <div className="rounded-[var(--radius)] border border-border/60 bg-card/40 p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">Failed</p>
            <XCircle size={14} className="text-red-400" />
          </div>
          <p className="mt-3 text-2xl font-semibold">{failedCount}</p>
        </div>
        <div className="rounded-[var(--radius)] border border-border/60 bg-card/40 p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">
              Retried
            </p>
            <RefreshCw size={14} className="text-amber-500" />
          </div>
          <p className="mt-3 text-2xl font-semibold">{retriedCount}</p>
        </div>
      </div>

      {/* Recent executions */}
      <div className="mt-6 rounded-[var(--radius)] border border-border/60 bg-card/40">
        <div className="flex items-center gap-2 border-b border-border/60 px-6 py-4">
          <Play size={14} className="text-muted-foreground" />
          <h2 className="text-sm font-semibold">Recent Executions</h2>
        </div>

        {executions.length > 0 ? (
          <div className="divide-y divide-border/60">
            {executions.map((exec) => {
              const st = statusConfig[exec.status];
              return (
                <details key={exec.id} className="group">
                  <summary className="flex cursor-pointer items-center justify-between px-6 py-4 hover:bg-accent/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-[var(--radius)] border border-border/60 bg-muted/30 text-muted-foreground">
                        <Zap size={14} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">
                            {exec.workflow}
                          </p>
                          <span className="text-xs text-muted-foreground">
                            {exec.id}
                          </span>
                        </div>
                        <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock size={10} />
                            {exec.startedAt}
                          </span>
                          <span>{exec.duration}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {exec.retried && (
                        <span className="flex items-center gap-1 text-[11px] text-amber-500">
                          <RefreshCw size={10} />
                          Retried
                        </span>
                      )}
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${st.color}`}
                      >
                        {st.icon}
                        {st.label}
                      </span>
                      <ChevronDown
                        size={14}
                        className="text-muted-foreground transition-transform group-open:rotate-180"
                      />
                    </div>
                  </summary>

                  <div className="border-t border-border/40 bg-muted/10 px-6 py-4">
                    {/* Steps */}
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Steps executed
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {exec.steps.map((code) => {
                        const step = workflowSteps[code];
                        return (
                          <div
                            key={code}
                            className="rounded-[var(--radius)] border border-border/60 bg-card/40 px-3 py-1.5"
                            title={step?.description}
                          >
                            <span className="text-[11px] font-medium text-muted-foreground">
                              {code}
                            </span>
                            <span className="ml-1.5 text-xs">
                              {step?.name || code}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Error detail */}
                    {exec.error && (
                      <div className="mt-4 flex items-start gap-2 rounded-[var(--radius)] border border-red-500/20 bg-red-500/5 px-3 py-2.5">
                        <AlertTriangle
                          size={14}
                          className="mt-0.5 shrink-0 text-red-400"
                        />
                        <div>
                          <p className="text-xs font-medium text-red-400">
                            Error
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {exec.error}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </details>
              );
            })}
          </div>
        ) : (
          <div className="px-6 py-10 text-center">
            <p className="text-sm text-muted-foreground">
              No workflow executions yet. Runs will appear here once your
              automations are active.
            </p>
          </div>
        )}
      </div>

      {/* Workflow reference */}
      <div className="mt-6 rounded-[var(--radius)] border border-border/60 bg-card/40">
        <div className="flex items-center gap-2 border-b border-border/60 px-6 py-4">
          <Zap size={14} className="text-muted-foreground" />
          <h2 className="text-sm font-semibold">Workflow Reference</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 text-left">
                <th className="px-6 py-3 text-xs font-medium text-muted-foreground">
                  Code
                </th>
                <th className="px-6 py-3 text-xs font-medium text-muted-foreground">
                  Name
                </th>
                <th className="px-6 py-3 text-xs font-medium text-muted-foreground">
                  Description
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {Object.entries(workflowSteps).map(([code, step]) => (
                <tr key={code}>
                  <td className="whitespace-nowrap px-6 py-3">
                    <span className="rounded bg-muted/40 px-1.5 py-0.5 text-xs font-mono font-medium">
                      {code}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-3 font-medium">
                    {step.name}
                  </td>
                  <td className="px-6 py-3 text-muted-foreground">
                    {step.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
