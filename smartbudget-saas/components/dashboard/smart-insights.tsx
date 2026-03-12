import { formatCurrency } from '@/lib/utils';

export function SmartInsights({
  insights,
  periodLabel
}: {
  insights: {
    topCategory: string;
    topCategoryAmount: number;
    spendVelocity: number;
    overspend: number;
    freeCashflow: number;
    nextCharges: Array<{ id: string; title: string; kind: string; amount: number; date: Date | string }>;
  };
  periodLabel: string;
}) {
  const cards = [
    { label: 'Categoría principal', value: insights.topCategory, secondary: formatCurrency(insights.topCategoryAmount) },
    { label: 'Promedio diario', value: formatCurrency(insights.spendVelocity), secondary: `gasto promedio en ${periodLabel.toLowerCase()}` },
    { label: 'Saldo libre', value: formatCurrency(insights.freeCashflow), secondary: 'balance luego de pagos fijos' },
    { label: 'Sobregasto', value: formatCurrency(insights.overspend), secondary: 'solo aparece cuando gastas más de lo que ingresas' }
  ];

  return (
    <section className="card p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Lectura rápida</h2>
          <p className="text-sm text-slate-500">Señales clave para entender cómo van tus finanzas en {periodLabel.toLowerCase()}.</p>
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {cards.map((card) => (
          <div key={card.label} className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">{card.label}</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">{card.value}</p>
            <p className="mt-1 text-sm text-slate-500">{card.secondary}</p>
          </div>
        ))}
      </div>
      <div className="mt-5 rounded-2xl border border-slate-200 p-4">
        <p className="text-sm font-semibold text-slate-900">Próximos cargos</p>
        <div className="mt-3 space-y-3">
          {insights.nextCharges.length ? (
            insights.nextCharges.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-3 text-sm">
                <div>
                  <p className="font-medium text-slate-900">{item.title}</p>
                  <p className="text-slate-500">{item.kind} · {new Date(item.date).toLocaleDateString('es-ES')}</p>
                </div>
                <p className="font-semibold text-slate-900">{formatCurrency(item.amount)}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500">No hay cargos cercanos.</p>
          )}
        </div>
      </div>
    </section>
  );
}
