"use client";

import { CircleCheck } from "lucide-react";
import { useState, useEffect } from "react";

export function VerifiedToast() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const showTimer = setTimeout(() => setVisible(true), 100);
    const hideTimer = setTimeout(() => setVisible(false), 4000);
    const cleanupTimer = setTimeout(() => {
      window.history.replaceState(null, "", "/onboarding");
    }, 4500);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
      clearTimeout(cleanupTimer);
    };
  }, []);

  return (
    <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
      <div
        className={`flex items-center gap-3 rounded-[var(--radius)] border border-border/60 bg-card px-4 py-3 shadow-lg transition-all duration-400
          ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
        `}
      >
        <CircleCheck size={18} className="shrink-0 text-green-500" />
        <p className="text-sm font-medium">Email verified successfully</p>
      </div>
    </div>
  );
}
