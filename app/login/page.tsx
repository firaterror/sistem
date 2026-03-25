"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";

export default function LoginPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Small delay so the initial render is "hidden" and then we animate in
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      {/* Subtle radial glow — same vibe as hero */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 30%, rgba(120,119,198,0.12), transparent)",
        }}
      />

      <div className="relative w-full max-w-sm">
        {/* Back link */}
        <Link
          href="/"
          className={`mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-all hover:text-foreground
            ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}
          `}
          style={{ transitionDuration: "500ms", transitionDelay: "0ms" }}
        >
          <ArrowLeft size={14} />
          Back
        </Link>

        {/* Logo */}
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
          Sign in to your account
        </p>

        {/* Form */}
        <form
          className="mt-8 space-y-4"
          onSubmit={(e) => e.preventDefault()}
        >
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
              placeholder="you@company.com"
              autoComplete="email"
              className="flex h-10 w-full rounded-[var(--radius)] border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
            />
          </div>

          <div
            className={`space-y-1.5 transition-all
              ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
            `}
            style={{ transitionDuration: "500ms", transitionDelay: "300ms" }}
          >
            <div className="flex items-center justify-between pb-1">
              <label htmlFor="password" className="block text-sm font-medium">
                Password
              </label>
              <a
                href="#"
                className="text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                Forgot password?
              </a>
            </div>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              className="flex h-10 w-full rounded-[var(--radius)] border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
            />
          </div>

          <div
            className={`pt-2 transition-all
              ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
            `}
            style={{ transitionDuration: "500ms", transitionDelay: "380ms" }}
          >
            <button
              type="submit"
              className="inline-flex h-10 w-full items-center justify-center rounded-[var(--radius)] bg-primary text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 cursor-pointer"
            >
              Sign in
            </button>
          </div>
        </form>

        {/* Footer note */}
        <p
          className={`mt-6 text-center text-xs text-muted-foreground transition-all
            ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}
          `}
          style={{ transitionDuration: "500ms", transitionDelay: "460ms" }}
        >
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="text-foreground transition-colors hover:text-foreground/80"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
