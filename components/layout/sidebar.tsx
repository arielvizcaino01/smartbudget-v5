import Link from "next/link";
import type { Route } from "next";
import type { LucideIcon } from "lucide-react";
import {
  BadgeDollarSign,
  ChartColumnBig,
  Goal,
  LayoutDashboard,
  Receipt,
  Repeat2,
  Settings,
  WalletCards,
} from "lucide-react";

type NavItem = {
  href: Route;
  label: string;
  icon: LucideIcon;
};

const items: NavItem[] = [
  { href: "/dashboard", label: "Resumen", icon: LayoutDashboard },
  { href: "/dashboard/transactions", label: "Movimientos", icon: WalletCards },
  { href: "/dashboard/budgets", label: "Presupuestos", icon: ChartColumnBig },
  { href: "/dashboard/subscriptions", label: "Suscripciones", icon: Repeat2 },
  { href: "/dashboard/goals", label: "Objetivos", icon: Goal },
  { href: "/dashboard/settings", label: "Configuración", icon: Settings },
];

export default function Sidebar() {
  return (
    <aside className="hidden w-72 shrink-0 border-r border-slate-200 bg-white p-6 lg:block">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-100 text-brand-700">
          <BadgeDollarSign className="h-6 w-6" />
        </div>
        <div>
          <p className="text-lg font-bold">SmartBudget</p>
          <p className="text-sm text-slate-500">Control financiero personal</p>
        </div>
      </div>

      <nav className="space-y-2">
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

      <div className="card mt-8 p-5">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
          <Receipt className="h-4 w-4 text-brand-600" />
          Vista general
        </div>
        <p className="text-sm text-slate-500">
          Revisa cómo va tu dinero por día, semana, mes o año, sin salir del panel principal.
        </p>
      </div>
    </aside>
  );
}