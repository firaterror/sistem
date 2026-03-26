"use client";

import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const [mounted, setMounted] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 30%, rgba(120,119,198,0.12), transparent)",
        }}
      />

      <div className="relative w-full max-w-sm">
        <h1
          className={`text-2xl font-semibold tracking-tight transition-all
            ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}
          `}
          style={{ transitionDuration: "500ms", transitionDelay: "0ms" }}
        >
          KAGAN
        </h1>
        <p
          className={`mt-1.5 text-sm text-muted-foreground transition-all
            ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}
          `}
          style={{ transitionDuration: "500ms", transitionDelay: "80ms" }}
        >
          Choose a new password
        </p>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-[var(--radius)] border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          <div
            className={`space-y-1.5 transition-all
              ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
            `}
            style={{ transitionDuration: "500ms", transitionDelay: "160ms" }}
          >
            <label htmlFor="password" className="block text-sm font-medium pb-1">
              New password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              required
              className="flex h-10 w-full rounded-[var(--radius)] border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
            />
          </div>

          <div
            className={`space-y-1.5 transition-all
              ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
            `}
            style={{ transitionDuration: "500ms", transitionDelay: "240ms" }}
          >
            <label htmlFor="confirm" className="block text-sm font-medium pb-1">
              Confirm password
            </label>
            <input
              id="confirm"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              required
              className="flex h-10 w-full rounded-[var(--radius)] border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
            />
          </div>

          <div
            className={`pt-2 transition-all
              ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
            `}
            style={{ transitionDuration: "500ms", transitionDelay: "320ms" }}
          >
            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-[var(--radius)] bg-primary text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Updating…
                </>
              ) : (
                "Update password"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
