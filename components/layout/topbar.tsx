import Link from "next/link";
import { Plus } from "lucide-react";
import { signOut } from '@/app/auth/actions';
import { requireCompletedUser } from '@/lib/auth';

export async function Topbar() {
  const user = await requireCompletedUser();
  const firstName = user.name?.trim().split(' ')[0] || 'Usuario';

  return (
    <header className="mb-5 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-soft">
      <div className="flex flex-col gap-4 p-4 sm:p-5 md:flex-row md:items-center md:justify-between md:p-6">
        <div>
          <p className="badge mb-2">Panel personal</p>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Bienvenido de nuevo, {firstName}</h1>
          <p className="mt-1 text-sm text-slate-500">Controla ingresos, gastos, presupuestos y pagos recurrentes desde un solo lugar.</p>
        </div>
        <div className="flex flex-col items-start gap-3 md:items-end">
          <div className="flex flex-wrap items-center gap-3 md:justify-end">
            <div className="grid grid-cols-2 gap-3 text-sm text-slate-500 md:text-right">
              <div>
                <p className="font-semibold text-slate-900">Moneda</p>
                <p>{user.currency}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-900">Ingreso mensual</p>
                <p>{new Intl.NumberFormat('en-US', { style: 'currency', currency: user.currency || 'USD', maximumFractionDigits: 0 }).format(user.monthlyIncome || 0)}</p>
              </div>
            </div>
            <Link href="/dashboard/transactions#quick-add" className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800">
              <Plus className="h-4 w-4" />
              Nuevo movimiento
            </Link>
          </div>
          <form action={signOut}>
            <button className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">Cerrar sesión</button>
          </form>
        </div>
      </div>
    </header>
  );
}
