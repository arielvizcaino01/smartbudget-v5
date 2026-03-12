"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChartColumnBig, Goal, LayoutDashboard, Repeat2, Settings, WalletCards } from "lucide-react";

const items = [
  { href: "/dashboard", label: "Resumen", icon: LayoutDashboard },
  { href: "/dashboard/transactions", label: "Movimientos", icon: WalletCards },
  { href: "/dashboard/budgets", label: "Presup.", icon: ChartColumnBig },
  { href: "/dashboard/subscriptions", label: "Subs.", icon: Repeat2 },
  { href: "/dashboard/goals", label: "Metas", icon: Goal },
  { href: "/dashboard/settings", label: "Ajustes", icon: Settings }
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2 backdrop-blur lg:hidden">
      <div className="grid grid-cols-6 gap-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center rounded-2xl px-1 py-2 text-[11px] font-medium transition ${active ? 'bg-brand-50 text-brand-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
            >
              <Icon className="mb-1 h-4 w-4" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
