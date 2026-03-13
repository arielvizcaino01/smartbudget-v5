import { requireCompletedUser } from "@/lib/auth";
import { createBudget, deleteBudget, updateBudget } from "@/app/dashboard/actions";
import { getDashboardData } from "@/lib/dashboard";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { Fragment } from "react";

function getString(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value || "";
}

export default async function BudgetsPage({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const q = getString(params.q);

  const user = await requireCompletedUser();

  const [data, budgets] = await Promise.all([
    getDashboardData(),
    prisma.budgetCategory.findMany({
      where: {
        userId: user.id,
        ...(q ? { name: { contains: q, mode: "insensitive" } } : {})
      },
      orderBy: { name: "asc" }
    })
  ]);

  const cards = data.spendingByCategory.filter((item) => !q || item.category.toLowerCase().includes(q.toLowerCase()));
  const totalBudget = budgets.reduce((sum, item) => sum + item.limitAmount, 0);

  return (
    <div className="space-y-6">
      <section className="card p-6">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-xl font-semibold">Presupuestos por categoría</h2>
            <p className="text-sm text-slate-500">Una vista más visual de tus límites, progreso y alertas para que leas tu presupuesto de un vistazo.</p>
          </div>
          <div className="grid gap-2 text-sm text-slate-500 md:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 px-4 py-3"><span className="block text-xs uppercase tracking-wide">Categorías</span><span className="text-lg font-semibold text-slate-900">{budgets.length}</span></div>
            <div className="rounded-2xl bg-brand-50 px-4 py-3"><span className="block text-xs uppercase tracking-wide text-brand-700">Límite total</span><span className="text-lg font-semibold text-brand-700">{formatCurrency(totalBudget)}</span></div>
          </div>
        </div>
        <form action={createBudget} className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <input name="name" className="input" placeholder="Categoría" required />
          <input name="icon" className="input" placeholder="Ícono" defaultValue="Wallet" />
          <input name="limitAmount" type="number" step="0.01" className="input" placeholder="Límite mensual" required />
          <input name="alertPercent" type="number" className="input" defaultValue="80" min="1" max="100" />
          <button className="btn-primary xl:col-span-4 xl:justify-self-end">Guardar presupuesto</button>
        </form>
      </section>

      <section className="card p-6">
        <form className="grid gap-4 md:grid-cols-[1fr_auto_auto] md:items-end">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Buscar categoría</label>
            <input name="q" defaultValue={q} className="input" placeholder="Ej. Comida, Transporte, Hogar" />
          </div>
          <button className="btn-primary">Filtrar</button>
          <a href="/dashboard/budgets" className="inline-flex items-center justify-center rounded-2xl border border-slate-200 px-4 py-3 font-medium text-slate-700 transition hover:bg-slate-50">Limpiar</a>
        </form>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        {cards.map((item) => {
          const budget = budgets.find((budgetItem) => budgetItem.id === item.id);
          if (!budget) return null;

          return (
            <Fragment key={item.id}>
              <div className="card premium-card p-5">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold">{item.category}</h3>
                    <p className="text-sm text-slate-500">Alerta al {item.alertPercent}%</p>
                  </div>
                  <span className="badge">{item.progress.toFixed(0)}%</span>
                </div>
                <div className="grid gap-4 sm:grid-cols-[96px_1fr] sm:items-center">
                  <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full" style={{ background: `conic-gradient(#2563eb ${Math.min(item.progress, 100) * 3.6}deg, #e2e8f0 0deg)` }}><div className="flex h-[72px] w-[72px] flex-col items-center justify-center rounded-full bg-white"><span className="text-lg font-semibold text-slate-900">{item.progress.toFixed(0)}%</span><span className="text-[10px] uppercase tracking-wide text-slate-500">usado</span></div></div>
                  <div>
                    <p className="text-sm text-slate-500">Gastado {formatCurrency(item.spent)} de {formatCurrency(item.limit)}</p>
                    <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
                      <div className={`h-full rounded-full ${item.progress >= 100 ? "bg-rose-500" : item.progress >= item.alertPercent ? "bg-amber-500" : "bg-brand-500"}`} style={{ width: `${Math.min(item.progress, 100)}%` }} />
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                      <span className="rounded-full bg-slate-100 px-3 py-1">Disponible {formatCurrency(Math.max(item.limit - item.spent, 0))}</span>
                      <span className="rounded-full bg-slate-100 px-3 py-1">Alerta {item.alertPercent}%</span>
                    </div>
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-3">
                  <a href={`#edit-${item.id}`} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50">Editar</a>
                  <form action={deleteBudget}>
                    <input type="hidden" name="id" value={item.id} />
                    <button className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50">Eliminar</button>
                  </form>
                </div>
                <div id={`edit-${item.id}`} className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <form action={updateBudget} className="grid gap-3 md:grid-cols-2">
                    <input type="hidden" name="id" value={budget.id} />
                    <input name="name" defaultValue={budget.name} className="input" required />
                    <input name="icon" defaultValue={budget.icon} className="input" />
                    <input name="limitAmount" type="number" step="0.01" defaultValue={budget.limitAmount} className="input" required />
                    <input name="alertPercent" type="number" min="1" max="100" defaultValue={budget.alertPercent} className="input" required />
                    <div className="flex items-center justify-end gap-3 md:col-span-2">
                      <a href="/dashboard/budgets" className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50">Cerrar</a>
                      <button className="btn-primary">Guardar cambios</button>
                    </div>
                  </form>
                </div>
              </div>
            </Fragment>
          );
        })}
        {cards.length === 0 && <div className="card p-8 text-center text-slate-500 lg:col-span-2">No hay presupuestos con ese filtro.</div>}
      </section>
    </div>
  );
}
