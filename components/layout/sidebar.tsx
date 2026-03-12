"use client";

import Link from "next/link";
import type { Route } from "next";
import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Receipt,
  Wallet,
  Repeat,
  Target,
  Settings,
} from "lucide-react";

type NavItem = {
  label: string;
  href: Route;
  icon: LucideIcon;
};

const items: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Transactions", href: "/dashboard/transactions", icon: Receipt },
  { label: "Budgets", href: "/dashboard/budgets", icon: Wallet },
  { label: "Subscriptions", href: "/dashboard/subscriptions", icon: Repeat },
  { label: "Goals", href: "/dashboard/goals", icon: Target },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function Sidebar() {
  return (
    <aside className="hidden w-64 border-r border-slate-200 bg-white p-6 lg:block">
      <div className="mb-10">
        <h1 className="text-xl font-semibold tracking-tight">SmartBudget</h1>
      </div>

      <nav className="flex flex-col gap-2">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-950"
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}