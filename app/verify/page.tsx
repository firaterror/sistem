"use client";

import Link from "next/link";
import { Mail } from "lucide-react";
import { useState, useEffect } from "react";

export default function VerifyPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 30%, rgba(120,119,198,0.12), transparent)",
        }}
      />

      <div className="relative flex max-w-sm flex-col items-center text-center">
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-full border border-border/60 bg-card/50 transition-all
            ${mounted ? "opacity-100 scale-100" : "opacity-0 scale-75"}
          `}
          style={{ transitionDuration: "500ms", transitionDelay: "0ms" }}
        >
          <Mail size={24} className="text-muted-foreground" />
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
          We&apos;ve sent a verification link to your inbox. Click the link
          to confirm your account, then come back and sign in.
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
    </div>
  );
}
