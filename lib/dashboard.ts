import { prisma } from '@/lib/prisma';
import { getCurrentAppUser } from '@/lib/app-data';

export type DashboardPeriod = 'day' | 'week' | 'month' | 'year';

function monthKey(date: Date | string) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function startOfDay(date = new Date()) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function startOfWeek(date = new Date()) {
  const copy = startOfDay(date);
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + diff);
  return copy;
}

function startOfMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function startOfYear(date = new Date()) {
  return new Date(date.getFullYear(), 0, 1);
}

function endOfDay(date = new Date()) {
  const copy = startOfDay(date);
  copy.setHours(23, 59, 59, 999);
  return copy;
}

function endOfMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

function endOfYear(date = new Date()) {
  return new Date(date.getFullYear(), 11, 31, 23, 59, 59, 999);
}

function addDays(date: Date, days: number) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function addMonths(date: Date, months: number) {
  const copy = new Date(date);
  copy.setMonth(copy.getMonth() + months);
  return copy;
}

function getPeriodRange(period: DashboardPeriod) {
  const now = new Date();

  switch (period) {
    case 'day':
      return { start: startOfDay(now), end: endOfDay(now), fullEnd: endOfDay(now), label: 'Hoy', totalUnits: 24 };
    case 'week':
      return { start: startOfWeek(now), end: endOfDay(now), fullEnd: endOfDay(addDays(startOfWeek(now), 6)), label: 'Esta semana', totalUnits: 7 };
    case 'year':
      return { start: startOfYear(now), end: endOfDay(now), fullEnd: endOfYear(now), label: 'Este año', totalUnits: 12 };
    case 'month':
    default: {
      const start = startOfMonth(now);
      const fullEnd = endOfMonth(now);
      return {
        start,
        end: endOfDay(now),
        fullEnd,
        label: 'Este mes',
        totalUnits: new Date(fullEnd.getFullYear(), fullEnd.getMonth() + 1, 0).getDate()
      };
    }
  }
}

function getComparisonText(period: DashboardPeriod) {
  switch (period) {
    case 'day':
      return 'movimientos registrados hoy';
    case 'week':
      return 'movimientos acumulados en la semana';
    case 'year':
      return 'movimientos acumulados en el año';
    case 'month':
    default:
      return 'movimientos acumulados en el mes';
  }
}

function average(values: number[]) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

export async function getDashboardData(period: DashboardPeriod = 'month') {
  const user = await getCurrentAppUser();
  const { start, end, fullEnd, label, totalUnits } = getPeriodRange(period);

  const [transactions, budgets, subscriptions, goals, recurringBills] = await Promise.all([
    prisma.transaction.findMany({ where: { userId: user.id }, orderBy: { date: 'desc' }, take: 365 }),
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

  const filteredTransactions = transactions.filter((item: TransactionItem) => {
    const time = new Date(item.date).getTime();
    return time >= start.getTime() && time <= end.getTime();
  });

  const expenses = filteredTransactions.filter((item: TransactionItem) => item.type === 'expense');
  const incomes = filteredTransactions.filter((item: TransactionItem) => item.type === 'income');
  const totalSpent = expenses.reduce((sum: number, item: TransactionItem) => sum + item.amount, 0);
  const totalIncome = incomes.reduce((sum: number, item: TransactionItem) => sum + item.amount, 0);
  const balance = totalIncome - totalSpent;
  const totalBudget = budgets.reduce((sum: number, item: BudgetItem) => sum + item.limitAmount, 0);
  const totalSaved = goals.reduce((sum: number, item: GoalItem) => sum + item.currentAmount, 0);
  const monthlySubscriptions = subscriptions.reduce((sum: number, item: SubscriptionItem) => sum + item.monthlyCost, 0);
  const recurringUpcoming = recurringBills.filter((item: RecurringBillItem) => !item.isPaid).slice(0, 5);
  const savingsRate = totalIncome > 0 ? Math.max(0, ((totalIncome - totalSpent) / totalIncome) * 100) : 0;
  const recurringLoad = totalIncome > 0 ? ((monthlySubscriptions + recurringBills.reduce((sum: number, item: RecurringBillItem) => sum + item.amount, 0)) / totalIncome) * 100 : 0;

  const spendingByCategory = budgets.map((budget: BudgetItem) => {
    const spent = expenses
      .filter((item: TransactionItem) => item.category === budget.name)
      .reduce((sum: number, item: TransactionItem) => sum + item.amount, 0);

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

  let chartData: Array<{ label: string; income: number; expense: number; net: number }> = [];
  let spendData: Array<{ label: string; amount: number }> = [];

  if (period === 'day') {
    chartData = Array.from({ length: 24 }, (_, hour) => {
      const label = `${String(hour).padStart(2, '0')}:00`;
      const hourIncome = incomes
        .filter((item: TransactionItem) => new Date(item.date).getHours() === hour)
        .reduce((sum: number, item: TransactionItem) => sum + item.amount, 0);
      const hourExpense = expenses
        .filter((item: TransactionItem) => new Date(item.date).getHours() === hour)
        .reduce((sum: number, item: TransactionItem) => sum + item.amount, 0);

      return { label, income: hourIncome, expense: hourExpense, net: hourIncome - hourExpense };
    });

    spendData = chartData.map((item) => ({ label: item.label, amount: item.expense }));
  } else if (period === 'week') {
    chartData = Array.from({ length: 7 }, (_, index) => {
      const day = addDays(start, index);
      const label = new Intl.DateTimeFormat('es-ES', { weekday: 'short' }).format(day);
      const dayIncome = incomes
        .filter((item: TransactionItem) => startOfDay(new Date(item.date)).getTime() === startOfDay(day).getTime())
        .reduce((sum: number, item: TransactionItem) => sum + item.amount, 0);
      const dayExpense = expenses
        .filter((item: TransactionItem) => startOfDay(new Date(item.date)).getTime() === startOfDay(day).getTime())
        .reduce((sum: number, item: TransactionItem) => sum + item.amount, 0);

      return { label, income: dayIncome, expense: dayExpense, net: dayIncome - dayExpense };
    });

    spendData = chartData.map((item) => ({ label: item.label, amount: item.expense }));
  } else if (period === 'year') {
    const monthMap = new Map<string, { label: string; income: number; expense: number; net: number }>();

    for (let i = 0; i < 12; i += 1) {
      const ref = new Date(start.getFullYear(), i, 1);
      const key = monthKey(ref);
      monthMap.set(key, {
        label: new Intl.DateTimeFormat('es-ES', { month: 'short' }).format(ref),
        income: 0,
        expense: 0,
        net: 0
      });
    }

    for (const tx of filteredTransactions.slice().reverse()) {
      const key = monthKey(tx.date);
      const bucket = monthMap.get(key);
      if (!bucket) continue;
      if (tx.type === 'income') bucket.income += tx.amount;
      if (tx.type === 'expense') bucket.expense += tx.amount;
      bucket.net = bucket.income - bucket.expense;
    }

    chartData = Array.from(monthMap.values());
    spendData = chartData.map((item) => ({ label: item.label, amount: item.expense }));
  } else {
    const daysInMonth = new Date(fullEnd.getFullYear(), fullEnd.getMonth() + 1, 0).getDate();

    chartData = Array.from({ length: daysInMonth }, (_, index) => {
      const day = addDays(start, index);
      const label = `${day.getDate()}`;
      const dayIncome = incomes
        .filter((item: TransactionItem) => startOfDay(new Date(item.date)).getTime() === startOfDay(day).getTime())
        .reduce((sum: number, item: TransactionItem) => sum + item.amount, 0);
      const dayExpense = expenses
        .filter((item: TransactionItem) => startOfDay(new Date(item.date)).getTime() === startOfDay(day).getTime())
        .reduce((sum: number, item: TransactionItem) => sum + item.amount, 0);

      return { label, income: dayIncome, expense: dayExpense, net: dayIncome - dayExpense };
    });

    spendData = chartData.map((item) => ({ label: item.label, amount: item.expense }));
  }

  const topCategory = [...spendingByCategory].sort((a, b) => b.spent - a.spent)[0];
  const unitsElapsed = Math.max(
    1,
    chartData.filter((item) => item.income > 0 || item.expense > 0).length ||
      Math.ceil((end.getTime() - start.getTime() + 1) / (1000 * 60 * 60 * 24))
  );

  const avgDailySpend = expenses.length
    ? totalSpent / Math.max(1, Math.ceil((end.getTime() - start.getTime() + 1) / (1000 * 60 * 60 * 24)))
    : 0;

  const overspend = Math.max(0, totalSpent - totalIncome);

  const projectionMultiplier = Math.max(1, totalUnits / unitsElapsed);
  const projectedIncome = Math.round(totalIncome * projectionMultiplier);
  const projectedExpense = Math.round(totalSpent * projectionMultiplier);
  const projectedNet = projectedIncome - projectedExpense;

  const alerts = [
    ...spendingByCategory
      .filter((item) => item.progress >= item.alertPercent)
      .map((item) => ({
        id: `budget-${item.id}`,
        title: item.progress >= 100 ? `${item.category} superó su límite` : `${item.category} está cerca del límite`,
        detail: `${item.progress.toFixed(0)}% usado de ${item.limit.toFixed(0)}.`,
        level: (item.progress >= 100 ? 'critical' : 'warning') as const
      })),
    ...subscriptions
      .filter((item: SubscriptionItem) => new Date(item.nextBillingDate) <= addDays(new Date(), 7))
      .slice(0, 3)
      .map((item: SubscriptionItem) => ({
        id: `sub-${item.id}`,
        title: `${item.name} cobra pronto`,
        detail: `Se renueva el ${new Date(item.nextBillingDate).toLocaleDateString('es-ES')}.`,
        level: 'info' as const
      })),
    ...goals
      .filter((item: GoalItem) => item.currentAmount < item.targetAmount * 0.4 && new Date(item.targetDate) <= addDays(new Date(), 90))
      .slice(0, 2)
      .map((item: GoalItem) => ({
        id: `goal-${item.id}`,
        title: `${item.name} necesita más impulso`,
        detail: `Solo llevas ${Math.round((item.currentAmount / Math.max(item.targetAmount, 1)) * 100)}% de avance.`,
        level: 'warning' as const
      }))
  ].slice(0, 6);

  const upcomingCalendar = [
    ...subscriptions.map((item: SubscriptionItem) => ({
      id: item.id,
      title: item.name,
      kind: 'Suscripción',
      amount: item.monthlyCost,
      date: item.nextBillingDate
    })),
    ...recurringBills.map((item: RecurringBillItem) => ({
      id: item.id,
      title: item.name,
      kind: 'Pago',
      amount: item.amount,
      date: item.dueDate
    }))
  ]
    .sort((a, b) => +new Date(a.date) - +new Date(b.date))
    .slice(0, 10);

  const futureTimeline = Array.from({ length: 6 }, (_, index) => {
    const ref = addMonths(new Date(), index);
    const label = new Intl.DateTimeFormat('es-ES', { month: 'short', year: '2-digit' }).format(ref);
    const subscriptionTotal = subscriptions.reduce((sum: number, item: SubscriptionItem) => sum + item.monthlyCost, 0);
    const recurringTotal = recurringBills.reduce((sum: number, item: RecurringBillItem) => sum + item.amount, 0);

    return {
      month: label,
      fixed: subscriptionTotal + recurringTotal,
      projectedCash: (user.monthlyIncome || totalIncome || 0) - (subscriptionTotal + recurringTotal + avgDailySpend * 30)
    };
  });

  const notificationCenter = [
    ...spendingByCategory
      .filter((item) => item.progress >= 85)
      .map((item) => ({
        id: `notice-budget-${item.id}`,
        title: `${item.category} se está acelerando`,
        detail: `Llevas ${item.progress.toFixed(0)}% del límite definido para esta categoría.`,
        level: (item.progress >= 100 ? 'critical' : 'warning') as const,
        amount: item.spent,
        actionLabel: item.progress >= 100 ? 'Reduce gastos o ajusta el límite' : 'Revisa compras pendientes'
      })),
    ...upcomingCalendar.slice(0, 3).map((item) => ({
      id: `notice-upcoming-${item.id}`,
      title: `${item.title} vence pronto`,
      detail: `${item.kind} programado para el ${new Date(item.date).toLocaleDateString('es-ES')}.`,
      level: 'info' as const,
      amount: item.amount,
      actionLabel: 'Confirma saldo disponible'
    })),
    ...(projectedNet < 0
      ? [
          {
            id: 'notice-projection',
            title: 'La proyección del periodo cierra en negativo',
            detail: 'Si mantienes este ritmo, el saldo neto terminaría por debajo de cero.',
            level: 'critical' as const,
            amount: projectedNet,
            actionLabel: 'Recorta gastos variables esta semana'
          }
        ]
      : [
          {
            id: 'notice-projection-positive',
            title: 'La proyección del periodo se mantiene saludable',
            detail: 'Tu ritmo actual apunta a cerrar con saldo positivo.',
            level: 'info' as const,
            amount: projectedNet,
            actionLabel: 'Mantén el ritmo actual'
          }
        ])
  ].slice(0, 6);

  const forecastData = Array.from(
    { length: Math.min(chartData.length, period === 'year' ? 12 : Math.max(4, chartData.length)) },
    (_, index) => {
      const visible = chartData.slice(0, index + 1);
      const avgIncome = average(visible.map((item) => item.income));
      const avgExpense = average(visible.map((item) => item.expense));
      const observedIncome = visible.reduce((sum, item) => sum + item.income, 0);
      const observedExpense = visible.reduce((sum, item) => sum + item.expense, 0);
      const remaining = Math.max(0, totalUnits - (index + 1));
      const projectedIncomeValue = Math.round(observedIncome + avgIncome * remaining);
      const projectedExpenseValue = Math.round(observedExpense + avgExpense * remaining);

      return {
        label: chartData[index]?.label ?? `${index + 1}`,
        projectedIncome: projectedIncomeValue,
        projectedExpense: projectedExpenseValue,
        projectedNet: projectedIncomeValue - projectedExpenseValue
      };
    }
  );

  const categoryTrend = spendingByCategory
    .filter((item) => item.spent > 0 || item.limit > 0)
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 6)
    .map((item) => ({
      category: item.category,
      spent: item.spent,
      limit: item.limit,
      remaining: Math.max(item.limit - item.spent, 0)
    }));

  const healthScore = Math.max(
    0,
    Math.min(
      100,
      100 -
        recurringLoad * 0.6 -
        Math.max(0, 100 - savingsRate * 3) -
        alerts.filter((item) => item.level !== 'info').length * 5 +
        (goals.length ? 8 : 0)
    )
  );

  return {
    user,
    period,
    periodLabel: label,
    summary: {
      totalSpent,
      totalIncome,
      totalBudget,
      totalSaved,
      monthlySubscriptions,
      balance,
      savingsRate,
      recurringLoad,
      avgDailySpend,
      budgetRiskCount: spendingByCategory.filter((item) => item.status !== 'healthy').length,
      transactionCount: filteredTransactions.length,
      comparisonText: getComparisonText(period),
      projectedIncome,
      projectedExpense,
      projectedNet
    },
    transactions: filteredTransactions,
    allTransactions: transactions,
    budgets,
    subscriptions,
    goals,
    recurringBills,
    recurringUpcoming,
    spendingByCategory,
    categoryTrend,
    cashflowTrend: chartData,
    periodSpending: spendData,
    forecastData,
    alerts,
    notificationCenter,
    upcomingCalendar,
    futureTimeline,
    healthScore,
    insights: {
      topCategory: topCategory?.category ?? 'Sin datos',
      topCategoryAmount: topCategory?.spent ?? 0,
      spendVelocity: avgDailySpend,
      overspend,
      freeCashflow: balance - monthlySubscriptions,
      nextCharges: upcomingCalendar.slice(0, 3)
    }
  };
}