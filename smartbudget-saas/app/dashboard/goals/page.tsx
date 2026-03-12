import { requireCompletedUser } from "@/lib/auth";
import { createGoal, deleteGoal, updateGoal } from "@/app/dashboard/actions";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";

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

  return (
    <div className="space-y-6">
      <section className="card p-6">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-xl font-semibold">Crear meta de ahorro</h2>
            <p className="text-sm text-slate-500">Fija un objetivo y registra cuánto llevas acumulado.</p>
          </div>
          <div className="grid gap-2 text-sm text-slate-500 md:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 px-4 py-3"><span className="block text-xs uppercase tracking-wide">Meta total</span><span className="text-lg font-semibold text-slate-900">{formatCurrency(totalTarget)}</span></div>
            <div className="rounded-2xl bg-emerald-50 px-4 py-3"><span className="block text-xs uppercase tracking-wide text-emerald-700">Acumulado</span><span className="text-lg font-semibold text-emerald-700">{formatCurrency(totalSaved)}</span></div>
          </div>
        </div>
        <form action={createGoal} className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <input name="name" className="input" placeholder="Nombre" required />
          <input name="targetAmount" type="number" step="0.01" className="input" placeholder="Meta" required />
          <input name="currentAmount" type="number" step="0.01" className="input" placeholder="Acumulado" required />
          <input name="targetDate" type="date" className="input" required />
          <button className="btn-primary xl:col-span-4 xl:justify-self-end">Guardar meta</button>
        </form>
      </section>

      <section className="card p-6">
        <form className="grid gap-4 md:grid-cols-[1fr_auto_auto] md:items-end">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Buscar meta</label>
            <input name="q" defaultValue={q} className="input" placeholder="Ej. Fondo de emergencia, viaje, carro" />
          </div>
          <button className="btn-primary">Filtrar</button>
          <a href="/dashboard/goals" className="inline-flex items-center justify-center rounded-2xl border border-slate-200 px-4 py-3 font-medium text-slate-700 transition hover:bg-slate-50">Limpiar</a>
        </form>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        {goals.map((item) => {
          const progress = item.targetAmount > 0 ? Math.min((item.currentAmount / item.targetAmount) * 100, 100) : 0;
          return (
            <div key={item.id} className="card p-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold">{item.name}</h3>
                  <p className="text-sm text-slate-500">Objetivo para {new Date(item.targetDate).toLocaleDateString("es-ES")}</p>
                </div>
                <span className="badge">{progress.toFixed(0)}%</span>
              </div>
              <p className="text-sm text-slate-500">Has acumulado {formatCurrency(item.currentAmount)} de {formatCurrency(item.targetAmount)}</p>
              <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-brand-500" style={{ width: `${progress}%` }} />
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <a href={`#edit-goal-${item.id}`} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50">Editar</a>
                <form action={deleteGoal}>
                  <input type="hidden" name="id" value={item.id} />
                  <button className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50">Eliminar</button>
                </form>
              </div>
              <div id={`edit-goal-${item.id}`} className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
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
