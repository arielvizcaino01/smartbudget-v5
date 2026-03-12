import { prisma } from '@/lib/prisma';
import { getCurrentAppUser } from '@/lib/app-data';

function monthKey(date: Date | string) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function startOfDay(date = new Date()) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function addDays(date: Date, days: number) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

export async function getDashboardData() {
  const user = await getCurrentAppUser();

  const [transactions, budgets, subscriptions, goals, recurringBills] = await Promise.all([
    prisma.transaction.findMany({ where: { userId: user.id }, orderBy: { date: 'desc' }, take: 180 }),
    prisma.budgetCategory.findMany({ where: { userId: user.id }, orderBy: { name: 'asc' } }),
    prisma.subscription.findMany({ where: { userId: user.id }, orderBy: { nextBillingDate: 'asc' } }),
    prisma.goal.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' } }),
    prisma.recurringBill.findMany({ where: { userId: user.id }, orderBy: { dueDate: 'asc' } })
  ]);

  type TransactionItem = (typeof transactions)[number];
  type BudgetItem = (typeof budgets)[number];
  type SubscriptionItem = (typeof subscriptions)[number];
  type GoalItem = (typeof goals)[number];
  type RecurringBillItem = (typeof recurringBills)[number];

  const expenses = transactions.filter((item: TransactionItem) => item.type === 'expense');
  const incomes = transactions.filter((item: TransactionItem) => item.type === 'income');
  const monthSpent = expenses.reduce((sum: number, item: TransactionItem) => sum + item.amount, 0);
  const monthIncome = incomes.reduce((sum: number, item: TransactionItem) => sum + item.amount, 0);
  const balance = monthIncome - monthSpent;
  const totalBudget = budgets.reduce((sum: number, item: BudgetItem) => sum + item.limitAmount, 0);
  const totalSaved = goals.reduce((sum: number, item: GoalItem) => sum + item.currentAmount, 0);
  const monthlySubscriptions = subscriptions.reduce((sum: number, item: SubscriptionItem) => sum + item.monthlyCost, 0);
  const recurringUpcoming = recurringBills.filter((item: RecurringBillItem) => !item.isPaid).slice(0, 5);
  const savingsRate = monthIncome > 0 ? Math.max(0, ((monthIncome - monthSpent) / monthIncome) * 100) : 0;
  const recurringLoad = monthIncome > 0 ? ((monthlySubscriptions + recurringBills.reduce((sum: number, item: RecurringBillItem) => sum + item.amount, 0)) / monthIncome) * 100 : 0;

  const spendingByCategory = budgets.map((budget: BudgetItem) => {
    const spent = expenses.filter((item: TransactionItem) => item.category === budget.name).reduce((sum: number, item: TransactionItem) => sum + item.amount, 0);
    const progress = budget.limitAmount ? Math.min((spent / budget.limitAmount) * 100, 999) : 0;
    return {
      id: budget.id,
      category: budget.name,
      spent,
      limit: budget.limitAmount,
      alertPercent: budget.alertPercent,
      progress,
      status: progress >= 100 ? 'over' : progress >= budget.alertPercent ? 'warning' : 'healthy'
    };
  });

  const monthMap = new Map<string, { month: string; income: number; expense: number; net: number }>();
  for (const tx of transactions.slice().reverse()) {
    const key = monthKey(tx.date);
    const label = new Intl.DateTimeFormat('es-ES', { month: 'short', year: '2-digit' }).format(new Date(tx.date));
    const bucket = monthMap.get(key) ?? { month: label, income: 0, expense: 0, net: 0 };
    if (tx.type === 'income') bucket.income += tx.amount;
    if (tx.type === 'expense') bucket.expense += tx.amount;
    bucket.net = bucket.income - bucket.expense;
    monthMap.set(key, bucket);
  }
  const cashflowTrend = Array.from(monthMap.values()).slice(-6);

  const last14Days = Array.from({ length: 14 }, (_, index) => {
    const day = addDays(startOfDay(), -13 + index);
    const label = new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short' }).format(day);
    const total = expenses
      .filter((item: TransactionItem) => {
        const d = startOfDay(new Date(item.date));
        return d.getTime() === day.getTime();
      })
      .reduce((sum: number, item: TransactionItem) => sum + item.amount, 0);
    return { day: label, amount: total };
  });

  const topCategory = [...spendingByCategory].sort((a, b) => b.spent - a.spent)[0];
  const avgDailySpend = expenses.length ? monthSpent / 30 : 0;
  const monthlyBurn = Math.max(0, monthSpent - monthIncome);

  const alerts = [
    ...spendingByCategory
      .filter((item) => item.progress >= item.alertPercent)
      .map((item) => ({
        id: `budget-${item.id}`,
        title: item.progress >= 100 ? `${item.category} superó su límite` : `${item.category} está cerca del límite`,
        detail: `${item.progress.toFixed(0)}% usado de ${item.limit.toFixed(0)}.`,
        level: item.progress >= 100 ? 'critical' : 'warning'
      })),
    ...subscriptions
      .filter((item: SubscriptionItem) => new Date(item.nextBillingDate) <= addDays(new Date(), 7))
      .slice(0, 3)
      .map((item: SubscriptionItem) => ({
        id: `sub-${item.id}`,
        title: `${item.name} cobra pronto`,
        detail: `Se renueva el ${new Date(item.nextBillingDate).toLocaleDateString('es-ES')}.`,
        level: 'info'
      })),
    ...goals
      .filter((item: GoalItem) => item.currentAmount < item.targetAmount * 0.4 && new Date(item.targetDate) <= addDays(new Date(), 90))
      .slice(0, 2)
      .map((item: GoalItem) => ({
        id: `goal-${item.id}`,
        title: `${item.name} necesita más impulso`,
        detail: `Solo llevas ${Math.round((item.currentAmount / Math.max(item.targetAmount, 1)) * 100)}% de avance.`,
        level: 'warning'
      }))
  ].slice(0, 6);

  const upcomingCalendar = [
    ...subscriptions.map((item: SubscriptionItem) => ({ id: item.id, title: item.name, kind: 'Suscripción', amount: item.monthlyCost, date: item.nextBillingDate })),
    ...recurringBills.map((item: RecurringBillItem) => ({ id: item.id, title: item.name, kind: 'Pago', amount: item.amount, date: item.dueDate }))
  ]
    .sort((a, b) => +new Date(a.date) - +new Date(b.date))
    .slice(0, 10);

  const futureTimeline = Array.from({ length: 6 }, (_, index) => {
    const ref = new Date();
    ref.setMonth(ref.getMonth() + index);
    const label = new Intl.DateTimeFormat('es-ES', { month: 'short', year: '2-digit' }).format(ref);
    const subscriptionTotal = subscriptions.reduce((sum: number, item: SubscriptionItem) => sum + item.monthlyCost, 0);
    const recurringTotal = recurringBills.reduce((sum: number, item: RecurringBillItem) => sum + item.amount, 0);
    return {
      month: label,
      fixed: subscriptionTotal + recurringTotal,
      projectedCash: (user.monthlyIncome || monthIncome || 0) - (subscriptionTotal + recurringTotal + avgDailySpend * 30)
    };
  });

  const healthScore = Math.max(
    0,
    Math.min(
      100,
      100 - recurringLoad * 0.6 - Math.max(0, 100 - savingsRate * 3) - alerts.filter((item) => item.level !== 'info').length * 5 + (goals.length ? 8 : 0)
    )
  );

  return {
    user,
    summary: {
      monthSpent,
      monthIncome,
      totalBudget,
      totalSaved,
      monthlySubscriptions,
      balance,
      savingsRate,
      recurringLoad,
      avgDailySpend,
      budgetRiskCount: spendingByCategory.filter((item) => item.status !== 'healthy').length
    },
    transactions,
    budgets,
    subscriptions,
    goals,
    recurringBills,
    recurringUpcoming,
    spendingByCategory,
    cashflowTrend,
    dailySpending: last14Days,
    alerts,
    upcomingCalendar,
    futureTimeline,
    healthScore,
    insights: {
      topCategory: topCategory?.category ?? 'Sin datos',
      topCategoryAmount: topCategory?.spent ?? 0,
      spendVelocity: avgDailySpend,
      monthlyBurn,
      freeCashflow: balance - monthlySubscriptions,
      nextCharges: upcomingCalendar.slice(0, 3)
    }
  };
}
