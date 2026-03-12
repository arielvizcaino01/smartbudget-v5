import { BudgetAlerts } from '@/components/dashboard/budget-alerts';
import { BudgetList } from '@/components/dashboard/budget-list';
import { CashflowChart } from '@/components/dashboard/cashflow-chart';
import { DailySpendingChart } from '@/components/dashboard/daily-spending-chart';
import { FutureTimeline } from '@/components/dashboard/future-timeline';
import { GoalsList } from '@/components/dashboard/goals-list';
import { HealthScore } from '@/components/dashboard/health-score';
import { RecentTransactions } from '@/components/dashboard/recent-transactions';
import { RecurringBills } from '@/components/dashboard/recurring-bills';
import { SmartInsights } from '@/components/dashboard/smart-insights';
import { SpendingChart } from '@/components/dashboard/spending-chart';
import { SubscriptionList } from '@/components/dashboard/subscription-list';
import { SummaryCards } from '@/components/dashboard/summary-cards';
import { UpcomingCalendar } from '@/components/dashboard/upcoming-calendar';
import { getDashboardData } from '@/lib/dashboard';

export default async function DashboardPage() {
  const data = await getDashboardData();
  const firstName = data.user.name?.trim().split(' ')[0] || 'Usuario';

  return (
    <div className="space-y-6">
      <section className="card overflow-hidden p-6">
        <div className="grid gap-6 xl:grid-cols-[1.2fr_.8fr]">
          <div>
            <p className="badge mb-3">Resumen</p>
            <h2 className="text-2xl font-semibold tracking-tight">Bienvenido de nuevo, {firstName}</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">Aquí tienes el estado actual de tus ingresos, gastos, cargos próximos y objetivos de ahorro.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <div className="rounded-3xl bg-slate-950 p-5 text-white">
              <p className="text-sm text-slate-300">Cuenta activa desde</p>
              <p className="mt-3 text-2xl font-semibold">{new Date(data.user.createdAt).toLocaleDateString('es-ES')}</p>
            </div>
            <div className="rounded-3xl bg-brand-50 p-5">
              <p className="text-sm text-brand-700">Revisión sugerida</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{data.alerts.length ? 'Hay movimientos y alertas que conviene revisar hoy.' : 'Tus números están estables este mes.'}</p>
            </div>
          </div>
        </div>
      </section>

      <SummaryCards summary={data.summary} />

      <section className="grid gap-6 xl:grid-cols-[1.05fr_.95fr]">
        <HealthScore score={data.healthScore} savingsRate={data.summary.savingsRate} recurringLoad={data.summary.recurringLoad} avgDailySpend={data.summary.avgDailySpend} />
        <BudgetAlerts alerts={data.alerts} />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <CashflowChart data={data.cashflowTrend} />
        <SpendingChart data={data.spendingByCategory} />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <DailySpendingChart data={data.dailySpending} />
        <FutureTimeline data={data.futureTimeline} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_.8fr]">
        <BudgetList items={data.spendingByCategory} />
        <UpcomingCalendar items={data.upcomingCalendar} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_.8fr]">
        <SmartInsights insights={data.insights} />
        <GoalsList items={data.goals} />
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <RecentTransactions items={data.transactions} />
        </div>
        <RecurringBills items={data.recurringUpcoming} />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <SubscriptionList items={data.subscriptions} />
        <div className="card p-6">
          <h2 className="text-lg font-semibold">Panorama general</h2>
          <p className="mt-1 text-sm text-slate-500">Una vista rápida para entender cuánto representan tus cargos fijos y cómo avanzan tus objetivos.</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">Suscripciones activas</p>
              <p className="mt-2 text-2xl font-semibold">{data.subscriptions.length}</p>
              <p className="mt-1 text-sm text-slate-500">{data.summary.monthlySubscriptions.toFixed(2)} al mes</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">Objetivos abiertos</p>
              <p className="mt-2 text-2xl font-semibold">{data.goals.length}</p>
              <p className="mt-1 text-sm text-slate-500">{data.summary.totalSaved.toFixed(2)} ahorrados</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
