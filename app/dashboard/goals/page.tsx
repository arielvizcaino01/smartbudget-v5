import { requireCompletedUser } from "@/lib/auth";
import { createGoal, deleteGoal, updateGoal } from "@/app/dashboard/actions";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { PiggyBank, Search, Target, TrendingUp } from "lucide-react";

function getString(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value || "";
}

function dateInputValue(value: Date | string) {
  return new Date(value).toISOString().slice(0, 10);
}

export default async function GoalsPage({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const q = getString(params.q);

  const user = await requireCompletedUser();

  const goals = await prisma.goal.findMany({
    where: {
      userId: user.id,
      ...(q ? { name: { contains: q, mode: "insensitive" } } : {})
    },
    orderBy: { createdAt: "desc" }
  });

  const totalTarget = goals.reduce((sum, item) => sum + item.targetAmount, 0);
  const totalSaved = goals.reduce((sum, item) => sum + item.currentAmount, 0);
  const completion = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;
  const nearestGoal = goals
    .slice()
    .sort((a, b) => +new Date(a.targetDate) - +new Date(b.targetDate))[0];

  return (
    <div className="space-y-6">
      <section className="card overflow-hidden p-6 sm:p-7">
        <div className="grid gap-5 xl:grid-cols-[1.1fr_.9fr]">
          <div>
            <span className="badge mb-3">Metas y ahorro</span>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Tus objetivos con una vista más clara y accionable</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              Revisa cuánto has acumulado, cuánto te falta y qué meta conviene priorizar este mes.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-3">
            <div className="rounded-3xl bg-slate-950 p-5 text-white">
              <p className="text-xs uppercase tracking-wide text-slate-300">Total ahorrado</p>
              <p className="mt-2 text-2xl font-semibold">{formatCurrency(totalSaved)}</p>
            </div>
            <div className="rounded-3xl bg-brand-50 p-5">
              <p className="text-xs uppercase tracking-wide text-brand-700">Meta total</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{formatCurrency(totalTarget)}</p>
            </div>
            <div className="rounded-3xl bg-emerald-50 p-5">
              <p className="text-xs uppercase tracking-wide text-emerald-700">Avance global</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{completion.toFixed(0)}%</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[.95fr_1.05fr]">
        <div className="card p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-2xl bg-brand-50 p-3 text-brand-700"><Target className="h-5 w-5" /></div>
            <div>
              <h2 className="text-xl font-semibold">Nueva meta</h2>
              <p className="text-sm text-slate-500">Define una meta y el ahorro actual para seguirla desde el panel.</p>
            </div>
          </div>
          <form action={createGoal} className="grid gap-4 md:grid-cols-2">
            <input name="name" className="input" placeholder="Nombre" required />
            <input name="targetAmount" type="number" step="0.01" className="input" placeholder="Meta" required />
            <input name="currentAmount" type="number" step="0.01" className="input" placeholder="Acumulado" required />
            <input name="targetDate" type="date" className="input" required />
            <button className="btn-primary md:col-span-2 md:justify-self-end">Guardar meta</button>
          </form>
        </div>

        <div className="card p-6">
          <div className="mb-5 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
            <form className="grid gap-4 sm:grid-cols-[1fr_auto_auto] sm:items-end">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Buscar meta</label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input name="q" defaultValue={q} className="input pl-10" placeholder="Ej. Fondo de emergencia, viaje, carro" />
                </div>
              </div>
              <button className="btn-primary">Filtrar</button>
              <a href="/dashboard/goals" className="inline-flex items-center justify-center rounded-2xl border border-slate-200 px-4 py-3 font-medium text-slate-700 transition hover:bg-slate-50">Limpiar</a>
            </form>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-600"><PiggyBank className="h-4 w-4" /> Metas activas</div>
              <p className="mt-2 text-2xl font-semibold">{goals.length}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-600"><TrendingUp className="h-4 w-4" /> Meta líder</div>
              <p className="mt-2 text-base font-semibold">{nearestGoal?.name ?? "Sin datos"}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-600">Próxima fecha objetivo</p>
              <p className="mt-2 text-base font-semibold">{nearestGoal ? new Date(nearestGoal.targetDate).toLocaleDateString("es-ES") : "—"}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        {goals.map((item) => {
          const progress = item.targetAmount > 0 ? Math.min((item.currentAmount / item.targetAmount) * 100, 100) : 0;
          const remaining = Math.max(item.targetAmount - item.currentAmount, 0);
          return (
            <div key={item.id} className="card overflow-hidden p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold">{item.name}</h3>
                  <p className="mt-1 text-sm text-slate-500">Objetivo para {new Date(item.targetDate).toLocaleDateString("es-ES")}</p>
                </div>
                <span className="badge">{progress.toFixed(0)}%</span>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Acumulado</p>
                  <p className="mt-2 text-xl font-semibold">{formatCurrency(item.currentAmount)}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Meta</p>
                  <p className="mt-2 text-xl font-semibold">{formatCurrency(item.targetAmount)}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Falta</p>
                  <p className="mt-2 text-xl font-semibold">{formatCurrency(remaining)}</p>
                </div>
              </div>

              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between text-sm text-slate-500">
                  <span>Progreso</span>
                  <span>{progress.toFixed(0)}%</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-brand-500" style={{ width: `${progress}%` }} />
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <a href={`#edit-goal-${item.id}`} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50">Editar</a>
                <form action={deleteGoal}>
                  <input type="hidden" name="id" value={item.id} />
                  <button className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50">Eliminar</button>
                </form>
              </div>

              <div id={`edit-goal-${item.id}`} className="mt-5 rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <form action={updateGoal} className="grid gap-3 md:grid-cols-2">
                  <input type="hidden" name="id" value={item.id} />
                  <input name="name" defaultValue={item.name} className="input" required />
                  <input name="targetAmount" type="number" step="0.01" defaultValue={item.targetAmount} className="input" required />
                  <input name="currentAmount" type="number" step="0.01" defaultValue={item.currentAmount} className="input" required />
                  <input name="targetDate" type="date" defaultValue={dateInputValue(item.targetDate)} className="input" required />
                  <div className="flex items-center justify-end gap-3 md:col-span-2">
                    <a href="/dashboard/goals" className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50">Cerrar</a>
                    <button className="btn-primary">Guardar cambios</button>
                  </div>
                </form>
              </div>
            </div>
          );
        })}
        {goals.length === 0 && <div className="card p-8 text-center text-slate-500 lg:col-span-2">No hay metas con ese filtro.</div>}
      </section>
    </div>
  );
}
