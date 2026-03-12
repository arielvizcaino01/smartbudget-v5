export function BudgetAlerts({
  alerts
}: {
  alerts: Array<{ id: string; title: string; detail: string; level: string }>;
}) {
  const toneMap: Record<string, string> = {
    critical: 'border-rose-200 bg-rose-50 text-rose-700',
    warning: 'border-amber-200 bg-amber-50 text-amber-700',
    info: 'border-sky-200 bg-sky-50 text-sky-700'
  };

  return (
    <section className="card p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Alertas y seguimiento</h2>
          <p className="text-sm text-slate-500">Detecta categorías calientes y cobros cercanos.</p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">{alerts.length} activas</span>
      </div>
      <div className="space-y-3">
        {alerts.length ? (
          alerts.map((alert) => (
            <div key={alert.id} className={`rounded-2xl border p-4 ${toneMap[alert.level] ?? toneMap.info}`}>
              <p className="font-semibold">{alert.title}</p>
              <p className="mt-1 text-sm opacity-90">{alert.detail}</p>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">Todo se ve estable por ahora. No hay alertas urgentes.</div>
        )}
      </div>
    </section>
  );
}
