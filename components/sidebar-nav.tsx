"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Tổng quan", icon: "🏠" },
  { href: "/transactions", label: "Chi tiêu", icon: "💸" },
  { href: "/jars", label: "Hũ tài chính", icon: "🏺" },
  { href: "/goals", label: "Mục tiêu", icon: "🎯" },
  { href: "/reports", label: "Báo cáo", icon: "📊" },
  { href: "/ai", label: "Trợ lý AI", icon: "🤖" },
  { href: "/settings", label: "Cài đặt", icon: "⚙️" },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <aside className="hidden sm:flex sm:w-60 sm:flex-col sm:border-r sm:border-border sm:bg-background sm:p-4">
      <h2 className="mb-6 text-lg font-bold text-primary">💰 Tài chính</h2>
      <nav className="space-y-1" aria-label="Điều hướng chính">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
