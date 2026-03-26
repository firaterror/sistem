"use client";

import {
  Inbox,
  MessageSquare,
  GitBranch,
  BarChart3,
  ArrowRight,
  Check,
  Menu,
  X,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useRef, type RefObject } from "react";

// ── Animation hooks ──────────────────────────────────────────────────

function useMount() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);
  return mounted;
}

function useReveal<T extends HTMLElement>(
  threshold = 0.15
): [RefObject<T | null>, boolean] {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, visible];
}

// Base classes for reveal animations
const hidden = "opacity-0 translate-y-5";
const shown = "opacity-100 translate-y-0";

// ── Components ───────────────────────────────────────────────────────

function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 h-14 border-b border-border/60 backdrop-blur bg-background/80">
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <a href="/" className="text-lg font-semibold tracking-tight">
          KAGAN
        </a>

        <nav className="hidden items-center gap-6 sm:flex">
          <a
            href="#pricing"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Pricing
          </a>
          <a
            href="#contact"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Contact
          </a>
          <Link
            href="/login"
            className="inline-flex h-9 items-center rounded-[var(--radius)] border border-border/60 px-4 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            Log in
          </Link>
        </nav>

        <button
          className="sm:hidden p-2 text-muted-foreground hover:text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-b border-border/60 bg-background/95 backdrop-blur sm:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4">
            <a
              href="#pricing"
              onClick={() => setMobileOpen(false)}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Pricing
            </a>
            <a
              href="#contact"
              onClick={() => setMobileOpen(false)}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Contact
            </a>
            <a
              href="/login"
              className="inline-flex h-9 w-fit items-center rounded-[var(--radius)] border border-border/60 px-4 text-sm font-medium transition-colors hover:bg-accent"
            >
              Log in
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}

function HeroSection() {
  const mounted = useMount();

  return (
    <section className="relative border-b border-border/40">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(120,119,198,0.18), transparent)",
        }}
      />

      <div className="relative mx-auto max-w-6xl px-4 pt-16 pb-20 sm:px-6 sm:pt-24 sm:pb-28">
        <p
          className={`text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground transition-all duration-400
            ${mounted ? shown : hidden}
          `}
        >
          Private AI · Sales execution
        </p>
        <h1
          className={`mt-4 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl transition-all duration-400 delay-75
            ${mounted ? shown : hidden}
          `}
        >
          Always-on lead capture and conversion
        </h1>
        <p
          className={`mt-6 max-w-2xl text-lg text-muted-foreground transition-all duration-400 delay-150
            ${mounted ? shown : hidden}
          `}
        >
          KAGAN runs your sales motion when your team is in
          meetings—structured capture, on-brand automated replies, and
          governed handoffs to humans.
        </p>
        <div
          className={`mt-8 flex flex-wrap gap-4 transition-all duration-400 delay-200
            ${mounted ? shown : hidden}
          `}
        >
          <a
            href="#contact"
            className="inline-flex h-11 items-center gap-2 rounded-[var(--radius)] bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Book a conversation
            <ArrowRight size={16} />
          </a>
          <a
            href="#pricing"
            className="inline-flex h-11 items-center rounded-[var(--radius)] border border-border/60 px-5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            View pricing
          </a>
        </div>
      </div>
    </section>
  );
}

const features = [
  {
    icon: Inbox,
    title: "Lead capture",
    description:
      "Ingest inbound interest from forms and connected channels with fields mapped to your CRM stages.",
  },
  {
    icon: MessageSquare,
    title: "Automated replies",
    description:
      "Acknowledgment, scheduling nudges, and follow-up cadences that match your tone and policies.",
  },
  {
    icon: GitBranch,
    title: "Workflow automation",
    description:
      "Routing, qualification prompts, and clear rules for when a deal needs a human owner.",
  },
  {
    icon: BarChart3,
    title: "Activity visibility",
    description:
      "Response times, funnel movement, and audit-friendly views of what KAGAN executed.",
  },
];

function FeaturesSection() {
  const [ref, visible] = useReveal<HTMLDivElement>();

  return (
    <section className="border-b border-border/40">
      <div ref={ref} className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
        <h2
          className={`text-3xl font-semibold tracking-tight transition-all duration-500
            ${visible ? shown : hidden}
          `}
        >
          Built for revenue operations
        </h2>
        <p
          className={`mt-3 max-w-2xl text-lg text-muted-foreground transition-all duration-500 delay-75
            ${visible ? shown : hidden}
          `}
        >
          Workflow automation tied to your pipeline—not a generic chat
          window.
        </p>

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {features.map((f, i) => (
            <div
              key={f.title}
              className={`group rounded-[var(--radius)] border border-border/60 bg-card/40 p-6 transition-all duration-500 hover:border-border
                ${visible ? shown : hidden}
              `}
              style={{ transitionDelay: visible ? `${150 + i * 100}ms` : "0ms" }}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border/60 bg-background/50">
                <f.icon size={20} className="text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  const [ref, visible] = useReveal<HTMLDivElement>();

  return (
    <section id="pricing" className="border-b border-border/40 scroll-mt-14">
      <div ref={ref} className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
        <h2
          className={`text-3xl font-semibold tracking-tight transition-all duration-500
            ${visible ? shown : hidden}
          `}
        >
          Straightforward pricing
        </h2>
        <p
          className={`mt-3 max-w-2xl text-lg text-muted-foreground transition-all duration-500 delay-75
            ${visible ? shown : hidden}
          `}
        >
          One plan. Full platform access. Custom integrations billed only
          when you need them.
        </p>

        <div className="mt-12 space-y-6">
          <div
            className={`rounded-[var(--radius)] border border-primary/25 bg-card/50 p-6 sm:p-8 transition-all duration-500
              ${visible ? shown : hidden}
            `}
            style={{ transitionDelay: visible ? "150ms" : "0ms" }}
          >
            <div className="flex flex-wrap items-baseline gap-2">
              <h3 className="text-xl font-semibold">KAGAN Platform</h3>
            </div>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-4xl font-semibold">$700</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Private AI sales execution, standard integrations, dashboard,
              and reporting.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Conversation handling and workflow automation",
                "Lead capture and automated replies",
                "Dashboard and sales activity reporting",
                "Standard catalog integrations (CRM, email, calendar)",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm">
                  <Check
                    size={16}
                    className="mt-0.5 shrink-0 text-muted-foreground"
                  />
                  {item}
                </li>
              ))}
            </ul>
            <a
              href="#contact"
              className="mt-8 inline-flex h-11 items-center gap-2 rounded-[var(--radius)] bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Talk to sales
              <ArrowRight size={16} />
            </a>
            <p className="mt-4 text-xs text-muted-foreground">
              Volume limits and enterprise options available during
              onboarding.
            </p>
          </div>

          <div
            className={`rounded-[var(--radius)] border border-dashed border-border/60 bg-muted/20 p-6 sm:p-8 transition-all duration-500
              ${visible ? shown : hidden}
            `}
            style={{ transitionDelay: visible ? "250ms" : "0ms" }}
          >
            <div className="flex flex-wrap items-baseline gap-3">
              <h3 className="text-lg font-semibold">Custom integrations</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-semibold">+$100</span>
                <span className="text-sm text-muted-foreground">
                  /month each
                </span>
              </div>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Tailored connections to proprietary tools, legacy systems, or
              non-catalog APIs.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function CtaSection() {
  const [ref, visible] = useReveal<HTMLDivElement>();

  return (
    <section id="contact" className="border-t border-border/40 bg-muted/20 scroll-mt-14">
      <div ref={ref} className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="grid gap-10 sm:grid-cols-2 sm:gap-16">
          <div
            className={`transition-all duration-500
              ${visible ? shown : hidden}
            `}
          >
            <h2 className="text-3xl font-semibold tracking-tight">
              Ready to run conversion as infrastructure?
            </h2>
            <p className="mt-3 text-lg text-muted-foreground">
              Tell us about your stack and pipeline. We&apos;ll follow up
              with next steps and integration scope.
            </p>
          </div>

          <form
            className={`space-y-4 transition-all duration-500
              ${visible ? shown : hidden}
            `}
            style={{ transitionDelay: visible ? "120ms" : "0ms" }}
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="name" className="block text-sm font-medium pb-1">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="Jane Smith"
                  className="flex h-10 w-full rounded-[var(--radius)] border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="email" className="block text-sm font-medium pb-1">
                  Work email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="jane@company.com"
                  className="flex h-10 w-full rounded-[var(--radius)] border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="company" className="block text-sm font-medium pb-1">
                Company
              </label>
              <input
                id="company"
                type="text"
                placeholder="Acme Inc."
                className="flex h-10 w-full rounded-[var(--radius)] border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="message" className="block text-sm font-medium pb-1">
                How can we help?
              </label>
              <textarea
                id="message"
                rows={4}
                placeholder="Tell us about your pipeline, current tools, and what you're looking to automate."
                className="flex w-full rounded-[var(--radius)] border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
              />
            </div>
            <button
              type="submit"
              className="inline-flex h-11 items-center gap-2 rounded-[var(--radius)] bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 cursor-pointer"
            >
              Book a conversation
              <ArrowRight size={16} />
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border/60 bg-card/30">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <p className="text-lg font-semibold tracking-tight">KAGAN</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Private AI for sales execution and lead conversion.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Product
            </p>
            <ul className="mt-3 space-y-2">
              <li>
                <a
                  href="#pricing"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Pricing
                </a>
              </li>
              <li>
                <a
                  href="#contact"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Legal
            </p>
            <ul className="mt-3 space-y-2">
              <li>
                <span className="text-sm text-muted-foreground/50 cursor-default">
                  Privacy
                </span>
              </li>
              <li>
                <span className="text-sm text-muted-foreground/50 cursor-default">
                  Terms
                </span>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-border/40 pt-6">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} KAGAN. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <PricingSection />
        <CtaSection />
      </main>
      <Footer />
    </>
  );
}
