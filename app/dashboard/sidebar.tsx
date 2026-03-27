"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  GitBranch,
  Plug,
  BarChart3,
  Settings,
  CreditCard,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { ProfilePanel } from "./profile-panel";

type NavItem = {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

const NAV: NavGroup[] = [
  {
    title: "Pipeline",
    items: [
      { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
      { label: "Leads", href: "/dashboard/leads", icon: Users },
      { label: "Conversations", href: "/dashboard/conversations", icon: MessageSquare },
    ],
  },
  {
    title: "Automation",
    items: [
      { label: "Workflows", href: "/dashboard/workflows", icon: GitBranch },
      { label: "Integrations", href: "/dashboard/integrations", icon: Plug },
      { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
    ],
  },
  {
    title: "Workspace",
    items: [
      { label: "Settings", href: "/dashboard/settings", icon: Settings },
      { label: "Billing", href: "/dashboard/billing", icon: CreditCard },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [user, setUser] = useState<{
    firstName: string;
    lastName: string;
    email: string;
  } | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUser({
          firstName: user.user_metadata?.first_name || "",
          lastName: user.user_metadata?.last_name || "",
          email: user.email || ""
        });
        setAvatarUrl(user.user_metadata?.avatar_url || null);
      }
    });
  }, []);

  const initials = user
    ? (user.firstName?.[0] || "").toUpperCase() +
      (user.lastName?.[0] || "").toUpperCase()
    : "";

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex h-14 items-center px-5 border-b border-border/60">
        <Link href="/dashboard" className="text-lg font-semibold tracking-tight">
          KAGAN
        </Link>
      </div>

      {/* Nav groups */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {NAV.map((group) => (
          <div key={group.title}>
            <p className="px-2 mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {group.title}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 rounded-[var(--radius)] px-2.5 py-2 text-sm font-medium transition-colors
                      ${
                        active
                          ? "bg-accent text-accent-foreground"
                          : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                      }
                    `}
                  >
                    <Icon size={16} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="border-t border-border/60 p-3">
        {user ? (
          <button
            type="button"
            onClick={() => setProfileOpen(true)}
            className="flex w-full items-center gap-3 rounded-[var(--radius)] px-2.5 py-2 transition-colors hover:bg-accent/50 cursor-pointer text-left"
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Avatar"
                className="h-8 w-8 shrink-0 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold">
                {initials || "?"}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium">
                {user.firstName} {user.lastName}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {user.email}
              </p>
            </div>
          </button>
        ) : (
          <div className="flex items-center gap-3 px-2.5 py-2 animate-pulse">
            <div className="h-8 w-8 rounded-full bg-muted/40" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 w-24 rounded bg-muted/30" />
              <div className="h-2.5 w-32 rounded bg-muted/20" />
            </div>
          </div>
        )}
        <form action="/auth/signout" method="post" className="mt-1">
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-[var(--radius)] px-2.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground cursor-pointer"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </form>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-3.5 left-4 z-50 p-1.5 rounded-md text-muted-foreground hover:text-foreground lg:hidden"
        aria-label="Open sidebar"
      >
        <Menu size={20} />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border/60 bg-background transition-transform duration-300 lg:hidden
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-3.5 right-3 p-1.5 text-muted-foreground hover:text-foreground"
          aria-label="Close sidebar"
        >
          <X size={18} />
        </button>
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-border/60 bg-card/30">
        {sidebarContent}
      </aside>

      {/* Profile panel */}
      <ProfilePanel open={profileOpen} onClose={() => setProfileOpen(false)} />
    </>
  );
}
