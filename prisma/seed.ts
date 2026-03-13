import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

async function main() {
  const email = process.env.DEFAULT_USER_EMAIL ?? process.env.DEMO_USER_EMAIL ?? "owner@smartbudget.app";
  const password = process.env.DEFAULT_USER_PASSWORD ?? process.env.DEMO_USER_PASSWORD ?? "change-this-password";
  const name = process.env.DEFAULT_USER_NAME ?? "Cuenta principal";
  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name,
      passwordHash,
      currency: "USD",
      monthlyIncome: 5200,
      onboardingComplete: true
    },
    create: {
      email,
      name,
      passwordHash,
      currency: "USD",
      monthlyIncome: 5200,
      onboardingComplete: true
    }
  });

  await prisma.transaction.deleteMany({ where: { userId: user.id } });
  await prisma.transfer.deleteMany({ where: { userId: user.id } });
  await prisma.account.deleteMany({ where: { userId: user.id } });
  await prisma.budgetCategory.deleteMany({ where: { userId: user.id } });
  await prisma.subscription.deleteMany({ where: { userId: user.id } });
  await prisma.goal.deleteMany({ where: { userId: user.id } });
  await prisma.recurringBill.deleteMany({ where: { userId: user.id } });

  await prisma.budgetCategory.createMany({
    data: [
      { userId: user.id, name: "Comida", icon: "Utensils", limitAmount: 650, alertPercent: 80 },
      { userId: user.id, name: "Transporte", icon: "Car", limitAmount: 300, alertPercent: 80 },
      { userId: user.id, name: "Hogar", icon: "Home", limitAmount: 1400, alertPercent: 85 },
      { userId: user.id, name: "Entretenimiento", icon: "Film", limitAmount: 250, alertPercent: 75 },
      { userId: user.id, name: "Salud", icon: "HeartPulse", limitAmount: 180, alertPercent: 75 }
    ]
  });

  const bank = await prisma.account.create({
    data: { userId: user.id, name: "Banco principal", type: "bank", currency: "USD", initialBalance: 2400, currentBalance: 2400 }
  });
  const cash = await prisma.account.create({
    data: { userId: user.id, name: "Efectivo", type: "cash", currency: "USD", initialBalance: 180, currentBalance: 180 }
  });
  const savings = await prisma.account.create({
    data: { userId: user.id, name: "Ahorros", type: "savings", currency: "USD", initialBalance: 3200, currentBalance: 3200 }
  });

  const transactions = [
    { userId: user.id, accountId: bank.id, name: "Pago semanal", category: "Ingresos", amount: 1250, type: "income", merchant: "Trabajo", date: new Date("2026-03-02") },
    { userId: user.id, accountId: bank.id, name: "Ingreso extra", category: "Ingresos", amount: 890, type: "income", merchant: "Servicios", date: new Date("2026-03-05") },
    { userId: user.id, accountId: cash.id, name: "Supermercado", category: "Comida", amount: 142.6, type: "expense", merchant: "Trader Joe's", date: new Date("2026-03-03") },
    { userId: user.id, accountId: bank.id, name: "Carga del auto", category: "Transporte", amount: 41.25, type: "expense", merchant: "Supercharger", date: new Date("2026-03-04") },
    { userId: user.id, accountId: bank.id, name: "Renta", category: "Hogar", amount: 1200, type: "expense", merchant: "Arrendador", date: new Date("2026-03-01"), recurring: true },
    { userId: user.id, accountId: bank.id, name: "Netflix", category: "Entretenimiento", amount: 18.99, type: "expense", merchant: "Netflix", date: new Date("2026-03-06"), recurring: true },
    { userId: user.id, accountId: cash.id, name: "Gimnasio", category: "Salud", amount: 45, type: "expense", merchant: "Gym", date: new Date("2026-03-07"), recurring: true }
  ] as const;

  await prisma.transaction.createMany({ data: transactions as any });

  const deltaByAccount = new Map<string, number>();
  for (const item of transactions) {
    const current = deltaByAccount.get(item.accountId) ?? 0;
    deltaByAccount.set(item.accountId, current + (item.type === "income" ? item.amount : -item.amount));
  }
  for (const [accountId, delta] of deltaByAccount.entries()) {
    await prisma.account.update({ where: { id: accountId }, data: { currentBalance: { increment: delta } } });
  }

  await prisma.transfer.create({
    data: { userId: user.id, fromAccountId: bank.id, toAccountId: cash.id, amount: 120, date: new Date("2026-03-08"), note: "Dinero para la semana" }
  });
  await prisma.account.update({ where: { id: bank.id }, data: { currentBalance: { decrement: 120 } } });
  await prisma.account.update({ where: { id: cash.id }, data: { currentBalance: { increment: 120 } } });

  await prisma.subscription.createMany({
    data: [
      { userId: user.id, name: "Netflix", category: "Streaming", monthlyCost: 18.99, status: "active", renewalType: "monthly", nextBillingDate: new Date("2026-03-20") },
      { userId: user.id, name: "Spotify", category: "Música", monthlyCost: 11.99, status: "active", renewalType: "monthly", nextBillingDate: new Date("2026-03-24") },
      { userId: user.id, name: "Google One", category: "Cloud", monthlyCost: 2.99, status: "active", renewalType: "monthly", nextBillingDate: new Date("2026-03-28") }
    ]
  });

  await prisma.goal.createMany({
    data: [
      { userId: user.id, name: "Fondo de emergencia", targetAmount: 10000, currentAmount: 3400, targetDate: new Date("2026-12-31") },
      { userId: user.id, name: "Cuenta de inversión", targetAmount: 5000, currentAmount: 1450, targetDate: new Date("2026-08-31") }
    ]
  });

  await prisma.recurringBill.createMany({
    data: [
      { userId: user.id, name: "Internet", amount: 69.99, dueDate: new Date("2026-03-18"), frequency: "monthly", isPaid: false },
      { userId: user.id, name: "Seguro del auto", amount: 162.35, dueDate: new Date("2026-03-25"), frequency: "monthly", isPaid: false }
    ]
  });

  console.log(`Seed listo para ${email}`);
  console.log(`Banco principal: ${bank.name}, Efectivo: ${cash.name}, Ahorros: ${savings.name}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
