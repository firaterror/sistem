"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, ArrowLeft } from "lucide-react";

const navItems = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/customers", label: "Customers", icon: Users },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="flex w-56 shrink-0 flex-col border-r border-border/60 bg-card/20">
        {/* Header */}
        <div className="border-b border-border/60 px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Staff Panel
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            KAGAN Admin
          </p>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 px-2 py-3">
          {navItems.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 rounded-[var(--radius)] px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                }`}
              >
                <item.icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Back to dashboard */}
        <div className="border-t border-border/60 px-2 py-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 rounded-[var(--radius)] px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
