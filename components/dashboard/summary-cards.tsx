import { formatCurrency } from '@/lib/utils';

export function SummaryCards({
  summary,
  periodLabel
}: {
  summary: {
    totalSpent: number;
    totalIncome: number;
    totalBudget: number;
    totalSaved: number;
    monthlySubscriptions: number;
    balance: number;
    accountBalance: number;
    cashBalance: number;
    bankBalance: number;
    accountCount: number;
    savingsRate: number;
    budgetRiskCount: number;
    transactionCount: number;
    comparisonText: string;
  };
  periodLabel: string;
}) {
  const cards = [
    { label: 'Patrimonio líquido', value: formatCurrency(summary.accountBalance), note: `${summary.accountCount} cuentas y wallets activas` },
    { label: 'Banco y digital', value: formatCurrency(summary.bankBalance), note: 'saldo fuera del efectivo' },
    { label: 'Efectivo', value: formatCurrency(summary.cashBalance), note: 'dinero físico disponible' },
    { label: 'Balance del periodo', value: formatCurrency(summary.balance), note: `${periodLabel.toLowerCase()} entre ingresos y gastos` },
    { label: 'Ingresos', value: formatCurrency(summary.totalIncome), note: summary.comparisonText },
    { label: 'Gastos', value: formatCurrency(summary.totalSpent), note: `${summary.transactionCount} movimientos en el periodo` }
  ];

  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
      {cards.map((card) => (
        <div key={card.label} className="card p-4 sm:p-5">
          <p className="text-sm text-slate-500">{card.label}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight">{card.value}</p>
          <p className="mt-2 text-xs text-slate-500">{card.note}</p>
        </div>
      ))}
    </section>
  );
}
