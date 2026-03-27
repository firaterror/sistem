"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { VerifiedToast } from "./verified-toast";
import {
  ArrowRight,
  ArrowLeft,
  Loader2,
  Check,
  Building2,
  Target,
  Palette,
  Radio,
  ClipboardList,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────

type BusinessHours = {
  [day: string]: { enabled: boolean; start: string; end: string };
};

type OnboardingData = {
  company_name: string;
  industry: string;
  industry_other: string;
  timezone: string;
  primary_goal: string;
  primary_goal_other: string;
  brand_tone: string;
  default_language: string;
  channels: string[];
  business_hours: BusinessHours;
};

const STEPS = [
  { label: "Company", icon: Building2 },
  { label: "Goals", icon: Target },
  { label: "Brand", icon: Palette },
  { label: "Channels", icon: Radio },
  { label: "Review", icon: ClipboardList },
];

const INDUSTRIES = [
  "SaaS / Software",
  "Financial Services",
  "Healthcare",
  "Real Estate",
  "E-commerce",
  "Manufacturing",
  "Professional Services",
  "Other",
];

const GOALS = [
  "Pipeline Velocity",
  "Faster Lead Responses",
  "Compliant policy-aware replies",
  "More meetings booked",
  "Other",
];

const TONES = ["Professional", "Friendly", "Empathetic", "Direct"];

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "tr", label: "Türkçe" },
  { value: "fr", label: "Français" },
  { value: "de", label: "Deutsch" },
];

const CHANNELS = ["Email", "Web forms", "LinkedIn", "Phone", "SMS"];

const DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const TIME_OPTIONS = [
  "06:00", "06:30", "07:00", "07:30", "08:00", "08:30",
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
  "18:00", "18:30", "19:00", "19:30", "20:00", "20:30",
  "21:00", "21:30", "22:00",
];

const DEFAULT_HOURS: BusinessHours = {
  monday: { enabled: true, start: "09:00", end: "17:00" },
  tuesday: { enabled: true, start: "09:00", end: "17:00" },
  wednesday: { enabled: true, start: "09:00", end: "17:00" },
  thursday: { enabled: true, start: "09:00", end: "17:00" },
  friday: { enabled: true, start: "09:00", end: "17:00" },
  saturday: { enabled: false, start: "09:00", end: "17:00" },
  sunday: { enabled: false, start: "09:00", end: "17:00" },
};

// ── Helpers ──────────────────────────────────────────────────────────

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function formatTime(t: string) {
  const [h, m] = t.split(":");
  const hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  const display = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${display}:${m} ${ampm}`;
}

// ── Shared styles ────────────────────────────────────────────────────

const inputClass =
  "flex h-10 w-full rounded-[var(--radius)] border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors";

const selectClass =
  "flex h-10 w-full rounded-[var(--radius)] border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors appearance-none cursor-pointer";

// ── Main Component ───────────────────────────────────────────────────

export default function OnboardingPage() {
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [animating, setAnimating] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const verified = searchParams.get("verified") === "true";

  const [data, setData] = useState<OnboardingData>({
    company_name: "",
    industry: "",
    industry_other: "",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    primary_goal: "",
    primary_goal_other: "",
    brand_tone: "",
    default_language: "en",
    channels: [],
    business_hours: DEFAULT_HOURS,
  });

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  function update<K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  function goTo(next: number) {
    setDirection(next > step ? "forward" : "back");
    setAnimating(true);
    setTimeout(() => {
      setStep(next);
      setAnimating(false);
    }, 200);
  }

  function canProceed(): boolean {
    switch (step) {
      case 0:
        return (
          data.company_name.trim() !== "" &&
          data.industry !== "" &&
          (data.industry !== "Other" || data.industry_other.trim() !== "")
        );
      case 1:
        return (
          data.primary_goal !== "" &&
          (data.primary_goal !== "Other" || data.primary_goal_other.trim() !== "")
        );
      case 2:
        return data.brand_tone !== "" && data.default_language !== "";
      case 3:
        return data.channels.length > 0;
      default:
        return true;
    }
  }

  async function handleFinish() {
    setError("");
    setLoading(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Session expired. Please log in again.");
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        company_name: data.company_name.trim(),
        industry: data.industry === "Other" ? data.industry_other.trim() : data.industry,
        timezone: data.timezone,
        primary_goal:
          data.primary_goal === "Other"
            ? data.primary_goal_other.trim()
            : data.primary_goal,
        brand_tone: data.brand_tone,
        default_language: data.default_language,
        channels: data.channels,
        business_hours: data.business_hours,
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard?welcome=true");
    router.refresh();
  }

  const stepContent = [
    <StepCompany key="company" data={data} update={update} />,
    <StepGoals key="goals" data={data} update={update} />,
    <StepBrand key="brand" data={data} update={update} />,
    <StepChannels key="channels" data={data} update={update} />,
    <StepReview key="review" data={data} />,
  ];

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 30%, rgba(120,119,198,0.12), transparent)",
        }}
      />

      <div className="relative w-full max-w-xl">
        {/* Header */}
        <div
          className={`transition-all duration-500
            ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}
          `}
        >
          <h1 className="text-2xl font-semibold tracking-tight">KAGAN</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Set up your workspace
          </p>
        </div>

        {/* Step indicator */}
        <div
          className={`mt-8 flex items-center gap-1 transition-all duration-500 delay-75
            ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}
          `}
        >
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isActive = i === step;
            const isDone = i < step;

            return (
              <div key={s.label} className="flex items-center gap-1">
                <button
                  onClick={() => i < step && goTo(i)}
                  disabled={i > step}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all cursor-pointer disabled:cursor-not-allowed
                    ${isActive ? "bg-primary text-primary-foreground" : ""}
                    ${isDone ? "bg-card text-foreground hover:bg-accent" : ""}
                    ${!isActive && !isDone ? "text-muted-foreground" : ""}
                  `}
                >
                  {isDone ? (
                    <Check size={12} />
                  ) : (
                    <Icon size={12} />
                  )}
                  <span className="hidden sm:inline">{s.label}</span>
                </button>
                {i < STEPS.length - 1 && (
                  <div
                    className={`h-px w-4 sm:w-6 transition-colors ${
                      isDone ? "bg-primary/50" : "bg-border"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Step content */}
        <div
          className={`mt-8 transition-all duration-200
            ${animating
              ? direction === "forward"
                ? "opacity-0 translate-x-4"
                : "opacity-0 -translate-x-4"
              : "opacity-100 translate-x-0"
            }
          `}
        >
          <div
            className={`transition-all duration-500 delay-150
              ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
            `}
          >
            {stepContent[step]}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-4 rounded-[var(--radius)] border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Navigation */}
        <div
          className={`mt-8 flex items-center justify-between transition-all duration-500 delay-200
            ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
          `}
        >
          <button
            onClick={() => goTo(step - 1)}
            disabled={step === 0}
            className="inline-flex h-10 items-center gap-2 rounded-[var(--radius)] border border-border/60 px-4 text-sm font-medium transition-colors hover:bg-accent cursor-pointer disabled:opacity-0 disabled:cursor-default"
          >
            <ArrowLeft size={14} />
            Back
          </button>

          {step < STEPS.length - 1 ? (
            <button
              onClick={() => goTo(step + 1)}
              disabled={!canProceed()}
              className="inline-flex h-10 items-center gap-2 rounded-[var(--radius)] bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
              <ArrowRight size={14} />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={loading}
              className="inline-flex h-10 items-center gap-2 rounded-[var(--radius)] bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Finishing…
                </>
              ) : (
                <>
                  Launch KAGAN
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {verified && <VerifiedToast />}
    </div>
  );
}

// ── Step 1: Company Basics ───────────────────────────────────────────

function StepCompany({
  data,
  update,
}: {
  data: OnboardingData;
  update: <K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Company basics</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Tell us about your organization.
        </p>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="company_name" className="block text-sm font-medium pb-1">
          Company name
        </label>
        <input
          id="company_name"
          type="text"
          value={data.company_name}
          onChange={(e) => update("company_name", e.target.value)}
          placeholder="Acme Inc."
          className={inputClass}
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="industry" className="block text-sm font-medium pb-1">
          Industry
        </label>
        <select
          id="industry"
          value={data.industry}
          onChange={(e) => update("industry", e.target.value)}
          className={selectClass}
        >
          <option value="" disabled>
            Select industry
          </option>
          {INDUSTRIES.map((ind) => (
            <option key={ind} value={ind}>
              {ind}
            </option>
          ))}
        </select>
        {data.industry === "Other" && (
          <input
            type="text"
            value={data.industry_other}
            onChange={(e) => update("industry_other", e.target.value)}
            placeholder="Enter your industry"
            className={`${inputClass} mt-2`}
          />
        )}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="timezone" className="block text-sm font-medium pb-1">
          Timezone
        </label>
        <select
          id="timezone"
          value={data.timezone}
          onChange={(e) => update("timezone", e.target.value)}
          className={selectClass}
        >
          {Intl.supportedValuesOf("timeZone").map((tz) => (
            <option key={tz} value={tz}>
              {tz.replace(/_/g, " ")}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

// ── Step 2: Goals ────────────────────────────────────────────────────

function StepGoals({
  data,
  update,
}: {
  data: OnboardingData;
  update: <K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Goals</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          What matters most for your sales motion?
        </p>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium pb-1">Primary goal</label>
        <div className="grid gap-2">
          {GOALS.map((goal) => (
            <button
              key={goal}
              type="button"
              onClick={() => update("primary_goal", goal)}
              className={`flex items-center gap-3 rounded-[var(--radius)] border px-4 py-3 text-sm text-left transition-all cursor-pointer
                ${
                  data.primary_goal === goal
                    ? "border-primary bg-primary/5 text-foreground"
                    : "border-border/60 bg-card/40 text-muted-foreground hover:border-border hover:text-foreground"
                }
              `}
            >
              <div
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors
                  ${
                    data.primary_goal === goal
                      ? "border-primary bg-primary"
                      : "border-muted-foreground/40"
                  }
                `}
              >
                {data.primary_goal === goal && (
                  <Check size={10} className="text-primary-foreground" />
                )}
              </div>
              {goal}
            </button>
          ))}
        </div>
        {data.primary_goal === "Other" && (
          <input
            type="text"
            value={data.primary_goal_other}
            onChange={(e) => update("primary_goal_other", e.target.value)}
            placeholder="Describe your primary goal"
            className={`${inputClass} mt-2`}
          />
        )}
      </div>
    </div>
  );
}

// ── Step 3: Brand & Language ─────────────────────────────────────────

function StepBrand({
  data,
  update,
}: {
  data: OnboardingData;
  update: <K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">
          Brand & language
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          How should KAGAN sound when it speaks for you?
        </p>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium pb-1">Brand tone</label>
        <div className="grid grid-cols-2 gap-2">
          {TONES.map((tone) => (
            <button
              key={tone}
              type="button"
              onClick={() => update("brand_tone", tone)}
              className={`flex items-center justify-center gap-2 rounded-[var(--radius)] border px-4 py-3 text-sm font-medium transition-all cursor-pointer
                ${
                  data.brand_tone === tone
                    ? "border-primary bg-primary/5 text-foreground"
                    : "border-border/60 bg-card/40 text-muted-foreground hover:border-border hover:text-foreground"
                }
              `}
            >
              {data.brand_tone === tone && <Check size={14} />}
              {tone}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="language" className="block text-sm font-medium pb-1">
          Default language
        </label>
        <select
          id="language"
          value={data.default_language}
          onChange={(e) => update("default_language", e.target.value)}
          className={selectClass}
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.value} value={lang.value}>
              {lang.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

// ── Step 4: Channels & Hours ─────────────────────────────────────────

function StepChannels({
  data,
  update,
}: {
  data: OnboardingData;
  update: <K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) => void;
}) {
  function toggleChannel(ch: string) {
    const current = data.channels;
    if (current.includes(ch)) {
      update(
        "channels",
        current.filter((c) => c !== ch)
      );
    } else {
      update("channels", [...current, ch]);
    }
  }

  function toggleDay(day: string) {
    const hours = { ...data.business_hours };
    hours[day] = { ...hours[day], enabled: !hours[day].enabled };
    update("business_hours", hours);
  }

  function setTime(day: string, field: "start" | "end", value: string) {
    const hours = { ...data.business_hours };
    hours[day] = { ...hours[day], [field]: value };
    update("business_hours", hours);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">
          Channels & hours
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Where should KAGAN engage, and when?
        </p>
      </div>

      {/* Channels */}
      <div className="space-y-2">
        <label className="block text-sm font-medium pb-1">Channels</label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {CHANNELS.map((ch) => {
            const active = data.channels.includes(ch);
            return (
              <button
                key={ch}
                type="button"
                onClick={() => toggleChannel(ch)}
                className={`flex items-center gap-2 rounded-[var(--radius)] border px-4 py-2.5 text-sm transition-all cursor-pointer
                  ${
                    active
                      ? "border-primary bg-primary/5 text-foreground"
                      : "border-border/60 bg-card/40 text-muted-foreground hover:border-border hover:text-foreground"
                  }
                `}
              >
                <div
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors
                    ${active ? "border-primary bg-primary" : "border-muted-foreground/40"}
                  `}
                >
                  {active && <Check size={10} className="text-primary-foreground" />}
                </div>
                {ch}
              </button>
            );
          })}
        </div>
      </div>

      {/* Business hours */}
      <div className="space-y-2">
        <label className="block text-sm font-medium pb-1">Business hours</label>
        <div className="space-y-2">
          {DAYS.map((day) => {
            const h = data.business_hours[day];
            return (
              <div
                key={day}
                className="flex items-center gap-3 rounded-[var(--radius)] border border-border/60 bg-card/40 px-4 py-2.5"
              >
                {/* Day toggle */}
                <button
                  type="button"
                  onClick={() => toggleDay(day)}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <div
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors
                      ${h.enabled ? "border-primary bg-primary" : "border-muted-foreground/40"}
                    `}
                  >
                    {h.enabled && (
                      <Check size={10} className="text-primary-foreground" />
                    )}
                  </div>
                  <span
                    className={`w-12 text-sm font-medium ${
                      h.enabled ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {capitalize(day.slice(0, 3))}
                  </span>
                </button>

                {/* Time selectors */}
                {h.enabled ? (
                  <div className="ml-auto flex items-center gap-2">
                    <select
                      value={h.start}
                      onChange={(e) => setTime(day, "start", e.target.value)}
                      className="h-8 rounded-md border border-input bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer appearance-none"
                    >
                      {TIME_OPTIONS.map((t) => (
                        <option key={t} value={t}>
                          {formatTime(t)}
                        </option>
                      ))}
                    </select>
                    <span className="text-xs text-muted-foreground">–</span>
                    <select
                      value={h.end}
                      onChange={(e) => setTime(day, "end", e.target.value)}
                      className="h-8 rounded-md border border-input bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer appearance-none"
                    >
                      {TIME_OPTIONS.map((t) => (
                        <option key={t} value={t}>
                          {formatTime(t)}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <span className="ml-auto text-xs text-muted-foreground">
                    Closed
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Step 5: Review ───────────────────────────────────────────────────

function StepReview({ data }: { data: OnboardingData }) {
  const language = LANGUAGES.find((l) => l.value === data.default_language);
  const activeDays = DAYS.filter((d) => data.business_hours[d].enabled);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Review</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Confirm your setup before launching.
        </p>
      </div>

      <div className="space-y-4">
        <ReviewBlock label="Company">
          <ReviewRow name="Name" value={data.company_name} />
          <ReviewRow
            name="Industry"
            value={
              data.industry === "Other" ? data.industry_other : data.industry
            }
          />
          <ReviewRow name="Timezone" value={data.timezone.replace(/_/g, " ")} />
        </ReviewBlock>

        <ReviewBlock label="Goal">
          <ReviewRow
            name="Primary goal"
            value={
              data.primary_goal === "Other"
                ? data.primary_goal_other
                : data.primary_goal
            }
          />
        </ReviewBlock>

        <ReviewBlock label="Brand & Language">
          <ReviewRow name="Tone" value={data.brand_tone} />
          <ReviewRow name="Language" value={language?.label || data.default_language} />
        </ReviewBlock>

        <ReviewBlock label="Channels & Hours">
          <ReviewRow name="Channels" value={data.channels.join(", ")} />
          <ReviewRow
            name="Active days"
            value={activeDays.map((d) => capitalize(d.slice(0, 3))).join(", ")}
          />
          {activeDays.length > 0 && (
            <ReviewRow
              name="Hours"
              value={`${formatTime(data.business_hours[activeDays[0]].start)} – ${formatTime(data.business_hours[activeDays[0]].end)}`}
            />
          )}
        </ReviewBlock>
      </div>
    </div>
  );
}

function ReviewBlock({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[var(--radius)] border border-border/60 bg-card/40 p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
        {label}
      </p>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function ReviewRow({ name, value }: { name: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="text-sm text-muted-foreground">{name}</span>
      <span className="text-sm font-medium text-right">{value || "—"}</span>
    </div>
  );
}
