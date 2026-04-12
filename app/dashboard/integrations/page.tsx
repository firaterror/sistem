"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  loadFacebookSDK,
  launchWhatsAppSignup,
} from "@/lib/integrations/facebook-sdk";
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
  Loader2,
} from "lucide-react";

type Status = "connected" | "disconnected" | "error";

type IntegrationRow = {
  provider: string;
  status: Status;
  provider_account_id: string | null;
  provider_metadata: Record<string, unknown> | null;
  error_message: string | null;
  connected_at: string | null;
  last_activity_at: string | null;
};

type ProviderKey = "whatsapp" | "instagram" | "calendar" | "crm";

type ProviderMeta = {
  key: ProviderKey;
  name: string;
  description: string;
  icon: React.ReactNode;
  connectType: "redirect" | "fb-popup" | null;
  connectPath: string | null;
};

const PROVIDERS: ProviderMeta[] = [
  {
    key: "whatsapp",
    name: "WhatsApp Business API",
    description: "Send and receive messages through WhatsApp",
    icon: <MessageCircle size={18} />,
    connectType: "fb-popup",
    connectPath: null,
  },
  {
    key: "instagram",
    name: "Instagram Messaging",
    description: "Handle DMs and story replies from Instagram",
    icon: <Camera size={18} />,
    connectType: "redirect",
    connectPath: "/api/integrations/instagram/connect",
  },
  {
    key: "calendar",
    name: "Calendar",
    description: "Google Calendar or Outlook sync for meeting bookings",
    icon: <Calendar size={18} />,
    connectType: null,
    connectPath: null,
  },
  {
    key: "crm",
    name: "CRM",
    description: "Sync leads and deal stages with your CRM",
    icon: <Database size={18} />,
    connectType: null,
    connectPath: null,
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

function formatRelative(iso: string | null): string {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function IntegrationsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [rows, setRows] = useState<IntegrationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyKey, setBusyKey] = useState<ProviderKey | null>(null);
  const [notice, setNotice] = useState<{
    kind: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    const connected = searchParams.get("connected");
    const error = searchParams.get("error");
    if (connected) {
      setNotice({ kind: "success", text: `${connected} connected` });
      router.replace("/dashboard/integrations");
    } else if (error) {
      setNotice({ kind: "error", text: `Connection failed: ${error}` });
      router.replace("/dashboard/integrations");
    }
  }, [searchParams, router]);

  const [fbReady, setFbReady] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/integrations/status");
        const data = await res.json();
        setRows(data.integrations || []);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    const appId = process.env.NEXT_PUBLIC_META_APP_ID;
    if (appId) {
      loadFacebookSDK(appId).then(() => setFbReady(true));
    }
  }, []);

  const rowsByProvider = new Map(rows.map((r) => [r.provider, r]));

  const connectedCount = rows.filter((r) => r.status === "connected").length;

  const handleWhatsAppConnect = useCallback(async () => {
    setBusyKey("whatsapp");
    try {
      const code = await launchWhatsAppSignup();
      const res = await fetch("/api/integrations/whatsapp/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setRows((prev) => [
          ...prev.filter((r) => r.provider !== "whatsapp"),
          {
            provider: "whatsapp",
            status: "connected" as Status,
            provider_account_id: data.phone_number || data.waba_id,
            provider_metadata: { phone_number: data.phone_number },
            error_message: null,
            connected_at: new Date().toISOString(),
            last_activity_at: new Date().toISOString(),
          },
        ]);
        setNotice({ kind: "success", text: "WhatsApp connected" });
      } else {
        setNotice({
          kind: "error",
          text: data.error || "WhatsApp connection failed",
        });
      }
    } catch {
      setNotice({ kind: "error", text: "WhatsApp signup cancelled" });
    } finally {
      setBusyKey(null);
    }
  }, []);

  async function handleConnect(p: ProviderMeta) {
    if (p.connectType === "fb-popup") {
      handleWhatsAppConnect();
      return;
    }
    if (!p.connectPath) return;
    setBusyKey(p.key);
    window.location.href = p.connectPath;
  }

  async function handleDisconnect(p: ProviderMeta) {
    setBusyKey(p.key);
    try {
      const res = await fetch(`/api/integrations/${p.key}/disconnect`, {
        method: "POST",
      });
      if (res.ok) {
        setRows((prev) => prev.filter((r) => r.provider !== p.key));
        setNotice({ kind: "success", text: `${p.key} disconnected` });
      } else {
        const data = await res.json();
        setNotice({ kind: "error", text: data.error || "Disconnect failed" });
      }
    } finally {
      setBusyKey(null);
    }
  }

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
            {connectedCount}/{PROVIDERS.length} active
          </span>
        </div>
      </div>

      {notice && (
        <div
          className={`mt-6 rounded-[var(--radius)] border px-4 py-2.5 text-xs ${
            notice.kind === "success"
              ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-400"
              : "border-red-500/30 bg-red-500/5 text-red-400"
          }`}
        >
          {notice.text}
        </div>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {PROVIDERS.map((p) => {
          const row = rowsByProvider.get(p.key);
          const status: Status = row?.status || "disconnected";
          const cfg = statusConfig[status];
          const isBusy = busyKey === p.key;
          const canConnect =
            !!p.connectPath || (p.connectType === "fb-popup" && fbReady);
          const metadata = row?.provider_metadata as
            | {
                instagram_username?: string;
                page_name?: string;
                phone_number?: string;
              }
            | null;

          let detail = "Not configured";
          if (status === "connected") {
            if (p.key === "instagram" && metadata?.instagram_username) {
              detail = `@${metadata.instagram_username}`;
            } else if (p.key === "whatsapp" && metadata?.phone_number) {
              detail = metadata.phone_number;
            } else {
              detail = "Connected";
            }
          } else if (status === "error") {
            detail = row?.error_message || "Error";
          } else if (!canConnect && !p.connectType) {
            detail = "Coming soon";
          }

          return (
            <div
              key={p.key}
              className="rounded-[var(--radius)] border border-border/60 bg-card/40 p-5"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-[var(--radius)] border border-border/60 bg-muted/30 text-muted-foreground">
                    {p.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.description}
                    </p>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${cfg.color}`}
                >
                  {cfg.icon}
                  {cfg.label}
                </span>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Status</span>
                  <span className="text-xs font-medium">{detail}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Last activity
                  </span>
                  <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                    {row?.last_activity_at ? (
                      <>
                        <Clock size={10} />
                        {formatRelative(row.last_activity_at)}
                      </>
                    ) : (
                      "—"
                    )}
                  </span>
                </div>
              </div>

              <button
                disabled={loading || isBusy || (!canConnect && status !== "connected")}
                onClick={() =>
                  status === "connected"
                    ? handleDisconnect(p)
                    : handleConnect(p)
                }
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-[var(--radius)] border border-border/60 px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isBusy ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : status === "connected" ? (
                  <>
                    <ExternalLink size={12} />
                    Disconnect
                  </>
                ) : (
                  <>
                    <Plug size={12} />
                    {canConnect
                      ? "Connect"
                      : p.connectType
                      ? "Loading..."
                      : "Coming soon"}
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
