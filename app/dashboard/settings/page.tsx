"use client";

import { useState, useEffect } from "react";
import { Loader2, AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const inputClass =
  "flex h-10 w-full rounded-[var(--radius)] border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors";

const TIMEZONES = Intl.supportedValuesOf("timeZone");

export default function SettingsPage() {
  const [orgName, setOrgName] = useState("");
  const [timezone, setTimezone] = useState("UTC");
  const [escalationEmail, setEscalationEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("company_name, timezone, escalation_email")
        .eq("id", user.id)
        .single();

      if (data) {
        setOrgName(data.company_name || "");
        setTimezone(data.timezone || "UTC");
        setEscalationEmail(data.escalation_email || "");
      }
      setLoading(false);
    });
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setMessage({ type: "error", text: "Session expired. Please log in again." });
        return;
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          company_name: orgName.trim(),
          timezone,
          escalation_email: escalationEmail.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) {
        setMessage({ type: "error", text: error.message });
      } else {
        setMessage({ type: "success", text: "Settings saved." });
      }
    } catch {
      setMessage({ type: "error", text: "Something went wrong." });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your workspace configuration.
        </p>
        <div className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 size={14} className="animate-spin" />
          Loading settings…
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Manage your workspace configuration.
      </p>

      {!escalationEmail && (
        <div className="mt-6 flex max-w-xl items-start gap-3 rounded-[var(--radius)] border border-yellow-500/30 bg-yellow-500/5 px-4 py-3">
          <AlertTriangle size={16} className="mt-0.5 shrink-0 text-yellow-500" />
          <div>
            <p className="text-sm font-medium text-yellow-500">
              Escalation email not configured
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Without an escalation email, conversations that need human attention
              won&apos;t trigger any alerts.
            </p>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSave}
        className="mt-6 max-w-xl rounded-[var(--radius)] border border-border/60 bg-card/40"
      >
        <div className="grid gap-1.5 p-6">
          <label htmlFor="orgName" className="text-sm font-medium">
            Organization display name
          </label>
          <p className="text-xs text-muted-foreground">
            The name shown across your workspace and emails.
          </p>
          <input
            id="orgName"
            type="text"
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            placeholder="Acme Inc."
            className={`mt-1 ${inputClass}`}
          />
        </div>

        <div className="border-t border-border/60" />

        <div className="grid gap-1.5 p-6">
          <label htmlFor="timezone" className="text-sm font-medium">
            Default timezone
          </label>
          <p className="text-xs text-muted-foreground">
            Used for scheduling, reports, and conversation timestamps.
          </p>
          <select
            id="timezone"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className={`mt-1 ${inputClass} appearance-none cursor-pointer`}
          >
            {TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>
                {tz.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </div>

        <div className="border-t border-border/60" />

        <div className="grid gap-1.5 p-6">
          <label htmlFor="escalationEmail" className="text-sm font-medium">
            Escalation email
          </label>
          <p className="text-xs text-muted-foreground">
            Where to send alerts when a conversation needs human attention.
          </p>
          <input
            id="escalationEmail"
            type="email"
            value={escalationEmail}
            onChange={(e) => setEscalationEmail(e.target.value)}
            placeholder="support@company.com"
            className={`mt-1 ${inputClass}`}
          />
        </div>

        <div className="border-t border-border/60" />

        <div className="flex items-center justify-between p-6">
          {message ? (
            <p
              className={`text-sm ${
                message.type === "success"
                  ? "text-emerald-500"
                  : "text-destructive"
              }`}
            >
              {message.text}
            </p>
          ) : (
            <span />
          )}
          <button
            type="submit"
            disabled={saving}
            className="inline-flex h-10 items-center gap-2 rounded-[var(--radius)] bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
