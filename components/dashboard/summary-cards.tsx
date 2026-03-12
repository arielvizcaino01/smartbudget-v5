import { formatCurrency } from '@/lib/utils';

export function SummaryCards({
  summary
}: {
  summary: {
    monthSpent: number;
    monthIncome: number;
    totalBudget: number;
    totalSaved: number;
    monthlySubscriptions: number;
    balance: number;
    savingsRate: number;
    budgetRiskCount: number;
  };
}) {
  const cards = [
    { label: 'Balance neto', value: formatCurrency(summary.balance), note: 'lo que te queda este mes' },
    { label: 'Ingresos', value: formatCurrency(summary.monthIncome), note: 'entradas registradas' },
    { label: 'Gastos', value: formatCurrency(summary.monthSpent), note: 'salidas acumuladas' },
    { label: 'Presupuesto', value: formatCurrency(summary.totalBudget), note: 'capacidad total' },
    { label: 'Ahorro', value: formatCurrency(summary.totalSaved), note: `${summary.savingsRate.toFixed(0)}% de ahorro` },
    { label: 'Riesgos', value: String(summary.budgetRiskCount), note: 'categorías en alerta' }
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
      {cards.map((card) => (
        <div key={card.label} className="card p-5">
          <p className="text-sm text-slate-500">{card.label}</p>
          <p className="mt-3 text-2xl font-bold tracking-tight">{card.value}</p>
          <p className="mt-2 text-xs text-slate-500">{card.note}</p>
        </div>
      ))}
    </section>
  );
}
