"use client";

import Link from "next/link";
import { useState } from "react";
import { Loader2, Mail, MessageSquare } from "lucide-react";

const inputClass =
  "flex h-10 w-full rounded-[var(--radius)] border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setStatus(null);

    try {
      // TODO: send to backend / email service
      await new Promise((r) => setTimeout(r, 800));
      setStatus({
        type: "success",
        text: "Message sent! We'll get back to you shortly.",
      });
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch {
      setStatus({ type: "error", text: "Something went wrong. Please try again." });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-20 lg:py-28">
      <Link
        href="/"
        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        &larr; Back to home
      </Link>

      <h1 className="mt-8 text-3xl font-semibold tracking-tight">
        Contact Us
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Have a question, need a demo, or want to talk about a custom plan?
        We&apos;d love to hear from you.
      </p>

      <div className="mt-12 grid gap-10 lg:grid-cols-5">
        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-3 rounded-[var(--radius)] border border-border/60 bg-card/40"
        >
          <div className="grid gap-4 p-6 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="name" className="block text-sm font-medium pb-1">
                Name
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Smith"
                className={inputClass}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-medium pb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@company.com"
                className={inputClass}
              />
            </div>
          </div>

          <div className="border-t border-border/60" />

          <div className="grid gap-1.5 p-6">
            <label htmlFor="subject" className="block text-sm font-medium pb-1">
              Subject
            </label>
            <input
              id="subject"
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Enterprise pricing, Demo request, Integration help"
              className={inputClass}
            />
          </div>

          <div className="border-t border-border/60" />

          <div className="grid gap-1.5 p-6">
            <label htmlFor="message" className="block text-sm font-medium pb-1">
              Message
            </label>
            <textarea
              id="message"
              rows={5}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us how we can help..."
              className="flex w-full rounded-[var(--radius)] border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors resize-none"
            />
          </div>

          <div className="border-t border-border/60" />

          <div className="flex items-center justify-between p-6">
            {status ? (
              <p
                className={`text-sm ${
                  status.type === "success"
                    ? "text-emerald-500"
                    : "text-destructive"
                }`}
              >
                {status.text}
              </p>
            ) : (
              <span />
            )}
            <button
              type="submit"
              disabled={sending}
              className="inline-flex h-10 items-center gap-2 rounded-[var(--radius)] bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none"
            >
              {sending && <Loader2 size={14} className="animate-spin" />}
              {sending ? "Sending…" : "Send message"}
            </button>
          </div>
        </form>

        {/* Sidebar info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-[var(--radius)] border border-border/60 bg-card/40 p-6">
            <div className="flex items-center gap-2">
              <Mail size={16} className="text-muted-foreground" />
              <h3 className="text-sm font-semibold">Email us directly</h3>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              For general inquiries and support:
            </p>
            <a
              href="mailto:hello@kagan.ai"
              className="mt-1 block text-sm text-foreground underline underline-offset-4 transition-colors hover:text-foreground/80"
            >
              hello@kagan.ai
            </a>
          </div>

          <div className="rounded-[var(--radius)] border border-border/60 bg-card/40 p-6">
            <div className="flex items-center gap-2">
              <MessageSquare size={16} className="text-muted-foreground" />
              <h3 className="text-sm font-semibold">Sales &amp; partnerships</h3>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Interested in enterprise plans or integration partnerships?
            </p>
            <a
              href="mailto:sales@kagan.ai"
              className="mt-1 block text-sm text-foreground underline underline-offset-4 transition-colors hover:text-foreground/80"
            >
              sales@kagan.ai
            </a>
          </div>

          <div className="rounded-[var(--radius)] border border-border/60 bg-card/40 p-6">
            <p className="text-sm text-muted-foreground">
              We typically respond within one business day.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
