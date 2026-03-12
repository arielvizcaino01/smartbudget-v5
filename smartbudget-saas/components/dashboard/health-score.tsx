import { formatCurrency } from '@/lib/utils';

export function HealthScore({
  score,
  savingsRate,
  recurringLoad,
  avgDailySpend
}: {
  score: number;
  savingsRate: number;
  recurringLoad: number;
  avgDailySpend: number;
}) {
  const tone = score >= 75 ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : score >= 55 ? 'text-amber-600 bg-amber-50 border-amber-100' : 'text-rose-600 bg-rose-50 border-rose-100';

  return (
    <section className="card p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="badge mb-3">Estado general</p>
          <h2 className="text-xl font-semibold">Estado financiero</h2>
          <p className="mt-1 text-sm text-slate-500">Una lectura rápida del ahorro, la carga fija y el ritmo de gasto del mes.</p>
        </div>
        <div className={`rounded-3xl border px-5 py-4 text-center ${tone}`}>
          <div className="text-xs uppercase tracking-[0.18em]">Nivel</div>
          <div className="text-3xl font-bold">{Math.round(score)}</div>
        </div>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Tasa de ahorro</p>
          <p className="mt-2 text-2xl font-semibold">{savingsRate.toFixed(0)}%</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Carga recurrente</p>
          <p className="mt-2 text-2xl font-semibold">{recurringLoad.toFixed(0)}%</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Gasto diario promedio</p>
          <p className="mt-2 text-2xl font-semibold">{formatCurrency(avgDailySpend)}</p>
        </div>
      </div>
    </section>
  );
}
