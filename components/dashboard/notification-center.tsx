import { formatCurrency } from '@/lib/utils';

export function NotificationCenter({
  notifications
}: {
  notifications: Array<{
    id: string;
    title: string;
    detail: string;
    level: 'critical' | 'warning' | 'info';
    amount?: number;
    actionLabel?: string;
  }>;
}) {
  const toneMap = {
    critical: 'border-rose-200 bg-rose-50 text-rose-700',
    warning: 'border-amber-200 bg-amber-50 text-amber-700',
    info: 'border-sky-200 bg-sky-50 text-sky-700'
  } as const;

  return (
    <section className="card p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Centro de avisos</h2>
          <p className="text-sm text-slate-500">Recordatorios útiles para mantener el periodo bajo control.</p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">{notifications.length} avisos</span>
      </div>
      <div className="space-y-3">
        {notifications.length ? notifications.map((item) => (
          <div key={item.id} className={`rounded-2xl border p-4 ${toneMap[item.level]}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{item.title}</p>
                <p className="mt-1 text-sm opacity-90">{item.detail}</p>
              </div>
              {typeof item.amount === 'number' ? <span className="text-sm font-semibold">{formatCurrency(item.amount)}</span> : null}
            </div>
            {item.actionLabel ? <p className="mt-2 text-xs font-medium uppercase tracking-wide opacity-80">{item.actionLabel}</p> : null}
          </div>
        )) : (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">No hay avisos pendientes por ahora.</div>
        )}
      </div>
    </section>
  );
}
