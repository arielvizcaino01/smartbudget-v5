import { BudgetAlerts } from '@/components/dashboard/budget-alerts';
import { BudgetList } from '@/components/dashboard/budget-list';
import { CashflowChart } from '@/components/dashboard/cashflow-chart';
import { DailySpendingChart } from '@/components/dashboard/daily-spending-chart';
import { ForecastChart } from '@/components/dashboard/forecast-chart';
import { FutureTimeline } from '@/components/dashboard/future-timeline';
import { GoalsList } from '@/components/dashboard/goals-list';
import { HealthScore } from '@/components/dashboard/health-score';
import { NotificationCenter } from '@/components/dashboard/notification-center';
import { PeriodSwitcher } from '@/components/dashboard/period-switcher';
import { RecentTransactions } from '@/components/dashboard/recent-transactions';
import { RecurringBills } from '@/components/dashboard/recurring-bills';
import { SmartInsights } from '@/components/dashboard/smart-insights';
import { SpendingChart } from '@/components/dashboard/spending-chart';
import { SubscriptionList } from '@/components/dashboard/subscription-list';
import { SummaryCards } from '@/components/dashboard/summary-cards';
import { UpcomingCalendar } from '@/components/dashboard/upcoming-calendar';
import { InstallBanner } from '@/components/pwa/install-banner';
import { getDashboardData, DashboardPeriod } from '@/lib/dashboard';
import { formatCurrency } from '@/lib/utils';

const validPeriods: DashboardPeriod[] = ['day', 'week', 'month', 'year'];

export default async function DashboardPage({
  searchParams
}: {
  searchParams?: Promise<{ period?: string }>;
}) {
  const params = (await searchParams) || {};
  const requested = params.period;
  const period: DashboardPeriod = validPeriods.includes(requested as DashboardPeriod) ? (requested as DashboardPeriod) : 'month';

  const data = await getDashboardData(period);
  const firstName = data.user.name?.trim().split(' ')[0] || 'Usuario';

  return (
    <div className="space-y-5 sm:space-y-6">
      <InstallBanner />

      <section className="card overflow-hidden p-4 sm:p-6">
        <div className="grid gap-5 xl:grid-cols-[1.2fr_.8fr]">
          <div>
            <p className="badge mb-3">Vista general</p>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Bienvenido de nuevo, {firstName}</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">Cambia entre diario, semanal, mensual y anual para ver el avance real de tus finanzas y la proyección de cierre.</p>
            <div className="mt-4">
              <PeriodSwitcher current={period} />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <div className="rounded-3xl bg-slate-950 p-5 text-white">
              <p className="text-sm text-slate-300">Balance de {data.periodLabel.toLowerCase()}</p>
              <p className="mt-3 text-3xl font-semibold">{formatCurrency(data.summary.balance)}</p>
              <p className="mt-2 text-sm text-slate-300">Ingresos {formatCurrency(data.summary.totalIncome)} · Gastos {formatCurrency(data.summary.totalSpent)}</p>
            </div>
            <div className="rounded-3xl bg-brand-50 p-5">
              <p className="text-sm text-brand-700">Proyección de cierre</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{formatCurrency(data.summary.projectedNet)}</p>
              <p className="mt-2 text-sm text-slate-600">Estimado al ritmo actual: ingresos {formatCurrency(data.summary.projectedIncome)} · gastos {formatCurrency(data.summary.projectedExpense)}</p>
            </div>
          </div>
        </div>
      </section>

      <SummaryCards summary={data.summary} periodLabel={data.periodLabel} />

      <section className="grid gap-5 lg:grid-cols-2 xl:grid-cols-[1.05fr_.95fr]">
        <HealthScore score={data.healthScore} savingsRate={data.summary.savingsRate} recurringLoad={data.summary.recurringLoad} avgDailySpend={data.summary.avgDailySpend} />
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
        <UpcomingCalendar items={data.upcomingCalendar} />
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
        <SpendingChart data={data.categoryTrend.map((item) => ({ category: item.category, spent: item.spent, limit: item.limit, progress: item.limit ? (item.spent / item.limit) * 100 : 0, status: item.spent > item.limit ? 'over' : 'healthy', id: item.category, alertPercent: 80 }))} />
        <div className="card p-5 sm:p-6">
          <h2 className="text-lg font-semibold">Panorama general</h2>
          <p className="mt-1 text-sm text-slate-500">Una lectura rápida de tus pagos fijos, tus objetivos abiertos y el ritmo de tus finanzas.</p>
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
