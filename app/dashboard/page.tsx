import Link from 'next/link';
import { ArrowRightLeft, Landmark, PiggyBank, WalletCards } from 'lucide-react';
import { BudgetAlerts } from '@/components/dashboard/budget-alerts';
import { BudgetList } from '@/components/dashboard/budget-list';
import { CashflowChart } from '@/components/dashboard/cashflow-chart';
import { DailySpendingChart } from '@/components/dashboard/daily-spending-chart';
import { ForecastChart } from '@/components/dashboard/forecast-chart';
import { FutureTimeline } from '@/components/dashboard/future-timeline';
import { GoalsList } from '@/components/dashboard/goals-list';
import { MoneyTimeline } from '@/components/dashboard/money-timeline';
import { HealthScore } from '@/components/dashboard/health-score';
import NotificationCenter from '@/components/dashboard/notification-center';
import { PeriodSwitcher } from '@/components/dashboard/period-switcher';
import { RecentTransactions } from '@/components/dashboard/recent-transactions';
import { RecurringBills } from '@/components/dashboard/recurring-bills';
import { SmartInsights } from '@/components/dashboard/smart-insights';
import { SpendingChart } from '@/components/dashboard/spending-chart';
import { SubscriptionList } from '@/components/dashboard/subscription-list';
import { SummaryCards } from '@/components/dashboard/summary-cards';
import QuickAddTransactionModal from '@/components/dashboard/quick-add-transaction-modal';
import { UpcomingCalendar } from '@/components/dashboard/upcoming-calendar';
import { InstallBanner } from '@/components/pwa/install-banner';
import { getDashboardData, DashboardPeriod } from '@/lib/dashboard';
import { formatCurrency } from '@/lib/utils';
import { createTransaction } from '@/app/dashboard/actions';

const validPeriods: DashboardPeriod[] = ['day', 'week', 'month', 'year'];

const quickActions = [
    { href: '/dashboard/accounts', label: 'Revisar cuentas', icon: Landmark },
  { href: '/dashboard/accounts#transfer', label: 'Mover dinero', icon: ArrowRightLeft },
  { href: '/dashboard/goals', label: 'Aportar a metas', icon: PiggyBank }
];

export default async function DashboardPage({
  searchParams
}: {
  searchParams?: Promise<{ period?: string }>;
}) {
  const params = (await searchParams) || {};
  const requested = params.period;
  const period: DashboardPeriod = validPeriods.includes(requested as DashboardPeriod)
    ? (requested as DashboardPeriod)
    : 'month';

  const data = await getDashboardData(period);
  const quickAccounts = data.accounts.map((item) => ({ id: item.id, name: item.name, type: item.type, currentBalance: item.currentBalance }));
  const firstName = data.user.name?.trim().split(' ')[0] || 'Usuario';

  const timelineItems = [
    ...data.transactions.slice(0, 4).map((item) => ({
      id: `tx-${item.id}`,
      title: item.name,
      subtitle: item.account?.name || item.category || 'Movimiento',
      dateLabel: new Date(item.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
      amount: item.amount,
      tone: item.type === 'income' ? 'income' as const : 'expense' as const
    })),
    ...data.upcomingCalendar.slice(0, 4).map((item) => ({
      id: `up-${item.id}`,
      title: item.title,
      subtitle: item.kind,
      dateLabel: new Date(item.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
      amount: item.amount,
      tone: 'upcoming' as const
    }))
  ]
    .sort((a, b) => a.dateLabel.localeCompare(b.dateLabel))
    .slice(0, 6);

  return (
    <div className="space-y-5 sm:space-y-6">
      <InstallBanner />

      <section className="card overflow-hidden p-4 sm:p-6">
        <div className="grid gap-5 xl:grid-cols-[1.15fr_.85fr]">
          <div>
            <p className="badge mb-3">Vista general</p>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Bienvenido de nuevo, {firstName}
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              Mira cuánto tienes disponible, cómo se están moviendo tus cuentas y qué proyecta tu cierre.
            </p>
            <div className="mt-4">
              <PeriodSwitcher current={period} />
            </div>
            <div className="mt-5 flex items-center justify-between gap-3">
              <div className="grid flex-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link key={action.href} href={action.href} className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-white px-4 py-4 text-sm font-medium text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span>{action.label}</span>
                  </Link>
                );
              })}
              </div>
              <QuickAddTransactionModal categories={data.budgets} accounts={quickAccounts} action={createTransaction as never} />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <div className="rounded-3xl bg-slate-950 p-5 text-white">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-300">Disponible en cuentas</p>
                <WalletCards className="h-5 w-5 text-slate-400" />
              </div>
              <p className="mt-3 text-3xl font-semibold">{formatCurrency(data.summary.accountBalance)}</p>
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-300">
                <div className="rounded-2xl bg-white/10 px-3 py-2">Banco y digital<br /><span className="text-sm font-semibold text-white">{formatCurrency(data.summary.bankBalance)}</span></div>
                <div className="rounded-2xl bg-white/10 px-3 py-2">Efectivo<br /><span className="text-sm font-semibold text-white">{formatCurrency(data.summary.cashBalance)}</span></div>
              </div>
            </div>
            <div className="rounded-3xl bg-brand-50 p-5">
              <p className="text-sm text-brand-700">Proyección de cierre</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{formatCurrency(data.summary.projectedNet)}</p>
              <p className="mt-2 text-sm text-slate-600">
                Estimado al ritmo actual: ingresos {formatCurrency(data.summary.projectedIncome)} · gastos {formatCurrency(data.summary.projectedExpense)}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-soft">
          <p className="text-xs uppercase tracking-wide text-slate-500">Balance del periodo</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{formatCurrency(data.summary.balance)}</p>
          <p className="mt-1 text-sm text-slate-500">{data.periodLabel}</p>
        </div>
        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-soft">
          <p className="text-xs uppercase tracking-wide text-slate-500">Gasto del periodo</p>
          <p className="mt-2 text-2xl font-semibold text-rose-600">{formatCurrency(data.summary.totalSpent)}</p>
          <p className="mt-1 text-sm text-slate-500">{data.summary.transactionCount} movimientos</p>
        </div>
        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-soft">
          <p className="text-xs uppercase tracking-wide text-slate-500">Suscripciones</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{formatCurrency(data.summary.monthlySubscriptions)}</p>
          <p className="mt-1 text-sm text-slate-500">cargo mensual recurrente</p>
        </div>
        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-soft">
          <p className="text-xs uppercase tracking-wide text-slate-500">Ahorro y metas</p>
          <p className="mt-2 text-2xl font-semibold text-emerald-600">{formatCurrency(data.summary.totalSaved)}</p>
          <p className="mt-1 text-sm text-slate-500">guardados en objetivos</p>
        </div>
      </section>

      <SummaryCards summary={data.summary} periodLabel={data.periodLabel} />

      <section className="grid gap-5 lg:grid-cols-2 xl:grid-cols-[1.05fr_.95fr]">
        <HealthScore
          score={data.healthScore}
          savingsRate={data.summary.savingsRate}
          recurringLoad={data.summary.recurringLoad}
          avgDailySpend={data.summary.avgDailySpend}
        />
        <NotificationCenter notifications={data.notificationCenter} />
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <CashflowChart
          data={data.cashflowTrend}
          title={`Ingresos vs gastos · ${data.periodLabel}`}
          description={`Comparación de entradas y salidas para ${data.periodLabel.toLowerCase()}.`}
        />
        <ForecastChart data={data.forecastData} />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.2fr_.8fr]">
        <DailySpendingChart
          data={data.periodSpending}
          title={`Distribución del gasto · ${data.periodLabel}`}
          description={`Así se reparte el gasto dentro de ${data.periodLabel.toLowerCase()}.`}
        />
        <BudgetAlerts alerts={data.alerts} />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.2fr_.8fr]">
        <SmartInsights insights={data.insights} periodLabel={data.periodLabel} />
        <FutureTimeline data={data.futureTimeline} />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.2fr_.8fr]">
        <BudgetList items={data.spendingByCategory} />
        <MoneyTimeline items={timelineItems} />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.2fr_.8fr]">
        <div className="xl:col-span-1">
          <RecentTransactions items={data.transactions} />
        </div>
        <GoalsList items={data.goals} />
      </section>

      <section className="grid gap-5 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <SubscriptionList items={data.subscriptions} />
        </div>
        <RecurringBills items={data.recurringUpcoming} />
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <SpendingChart
          data={data.categoryTrend.map((item) => ({
            category: item.category,
            spent: item.spent,
            limit: item.limit,
            progress: item.limit ? (item.spent / item.limit) * 100 : 0,
            status: item.spent > item.limit ? 'over' : 'healthy',
            id: item.category,
            alertPercent: 80
          }))}
        />
        <div className="card p-5 sm:p-6">
          <h2 className="text-lg font-semibold">Panorama general</h2>
          <p className="mt-1 text-sm text-slate-500">
            Una lectura rápida de tus pagos fijos, tus objetivos abiertos y el ritmo de tus finanzas.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">Suscripciones activas</p>
              <p className="mt-2 text-2xl font-semibold">{data.subscriptions.length}</p>
              <p className="mt-1 text-sm text-slate-500">{formatCurrency(data.summary.monthlySubscriptions)} al mes</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">Objetivos abiertos</p>
              <p className="mt-2 text-2xl font-semibold">{data.goals.length}</p>
              <p className="mt-1 text-sm text-slate-500">{formatCurrency(data.summary.totalSaved)} ahorrados</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
