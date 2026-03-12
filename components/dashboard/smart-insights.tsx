import { formatCurrency } from '@/lib/utils';

export function SmartInsights({
  insights
}: {
  insights: {
    topCategory: string;
    topCategoryAmount: number;
    spendVelocity: number;
    monthlyBurn: number;
    freeCashflow: number;
    nextCharges: Array<{ id: string; title: string; kind: string; amount: number; date: Date | string }>;
  };
}) {
  const cards = [
    { label: 'Categoría dominante', value: insights.topCategory, secondary: formatCurrency(insights.topCategoryAmount) },
    { label: 'Velocidad de gasto', value: formatCurrency(insights.spendVelocity), secondary: 'promedio diario' },
    { label: 'Flujo libre', value: formatCurrency(insights.freeCashflow), secondary: 'balance menos suscripciones' },
    { label: 'Burn mensual', value: formatCurrency(insights.monthlyBurn), secondary: 'si gastas más de lo que ingresas' }
  ];

  return (
    <section className="card p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Insights automáticos</h2>
          <p className="text-sm text-slate-500">Lecturas rápidas para decidir sin revisar todo el panel.</p>
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
