"use client";

import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  }

  if (sent) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4">
        <div
          className="pointer-events-none fixed inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 40% at 50% 30%, rgba(120,119,198,0.12), transparent)",
          }}
        />

        <SentConfirmation email={email} />
      </div>
    );
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
        <Link
          href="/login"
          className={`mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-all hover:text-foreground
            ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}
          `}
          style={{ transitionDuration: "500ms", transitionDelay: "0ms" }}
        >
          <ArrowLeft size={14} />
          Back to sign in
        </Link>

        <h1
          className={`text-2xl font-semibold tracking-tight transition-all
            ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}
          `}
          style={{ transitionDuration: "500ms", transitionDelay: "80ms" }}
        >
          KAGAN
        </h1>
        <p
          className={`mt-1.5 text-sm text-muted-foreground transition-all
            ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}
          `}
          style={{ transitionDuration: "500ms", transitionDelay: "140ms" }}
        >
          Reset your password
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
            style={{ transitionDuration: "500ms", transitionDelay: "220ms" }}
          >
            <label htmlFor="email" className="block text-sm font-medium pb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              autoComplete="email"
              required
              className="flex h-10 w-full rounded-[var(--radius)] border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
            />
          </div>

          <div
            className={`pt-2 transition-all
              ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
            `}
            style={{ transitionDuration: "500ms", transitionDelay: "300ms" }}
          >
            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-[var(--radius)] bg-primary text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Sending…
                </>
              ) : (
                "Send reset link"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SentConfirmation({ email }: { email: string }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative flex max-w-sm flex-col items-center text-center">
      <div
        className={`flex h-14 w-14 items-center justify-center rounded-full border border-border/60 bg-card/50 transition-all
          ${mounted ? "opacity-100 scale-100" : "opacity-0 scale-75"}
        `}
        style={{ transitionDuration: "500ms", transitionDelay: "0ms" }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-muted-foreground"
        >
          <path d="M22 10.5V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h12.5" />
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          <path d="m16 19 2 2 4-4" />
        </svg>
      </div>

      <h1
        className={`mt-6 text-2xl font-semibold tracking-tight transition-all
          ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}
        `}
        style={{ transitionDuration: "500ms", transitionDelay: "100ms" }}
      >
        Check your email
      </h1>

      <p
        className={`mt-3 text-sm text-muted-foreground leading-relaxed transition-all
          ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}
        `}
        style={{ transitionDuration: "500ms", transitionDelay: "180ms" }}
      >
        We&apos;ve sent a password reset link to{" "}
        <span className="text-foreground">{email}</span>. Click the link to
        choose a new password.
      </p>

      <Link
        href="/login"
        className={`mt-8 inline-flex h-10 items-center rounded-[var(--radius)] bg-primary px-5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90
          ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}
        `}
        style={{ transitionDuration: "500ms", transitionDelay: "260ms" }}
      >
        Back to sign in
      </Link>
    </div>
  );
}
