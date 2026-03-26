"use client";

import { CircleCheck, type LucideIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

function Toast({
  message,
  icon: Icon = CircleCheck,
  iconClass = "text-green-500",
}: {
  message: string;
  icon?: LucideIcon;
  iconClass?: string;
}) {
  const [visible, setVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const showTimer = setTimeout(() => setVisible(true), 100);
    const hideTimer = setTimeout(() => setVisible(false), 4000);
    const cleanupTimer = setTimeout(() => {
      window.history.replaceState(null, "", "/dashboard");
      router.refresh();
    }, 4500);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
      clearTimeout(cleanupTimer);
    };
  }, [router]);

  return (
    <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
      <div
        className={`flex items-center gap-3 rounded-[var(--radius)] border border-border/60 bg-card px-4 py-3 shadow-lg transition-all duration-400
          ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
        `}
      >
        <Icon size={18} className={`shrink-0 ${iconClass}`} />
        <p className="text-sm font-medium">{message}</p>
      </div>
    </div>
  );
}

export function VerifiedToast() {
  return <Toast message="Email verified successfully" />;
}

export function WelcomeToast() {
  return <Toast message="Signed in successfully" />;
}
