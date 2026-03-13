"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCompletedUser } from "@/lib/auth";
import { suggestCategory } from "@/lib/categorize";

function textValue(value: FormDataEntryValue | null, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

function numberValue(value: FormDataEntryValue | null) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function dateValue(value: FormDataEntryValue | null) {
  const raw = textValue(value);
  return raw ? new Date(raw) : new Date();
}

function refreshAll() {
  [
    "/dashboard",
    "/dashboard/transactions",
    "/dashboard/accounts",
    "/dashboard/budgets",
    "/dashboard/subscriptions",
    "/dashboard/goals",
    "/dashboard/settings"
  ].forEach((path) => revalidatePath(path));
}

async function changeAccountBalance(accountId: string | null | undefined, delta: number) {
  if (!accountId || !delta) return;
  await prisma.account.updateMany({
    where: { id: accountId },
    data: { currentBalance: { increment: delta } }
  });
}

function transactionDelta(type: string, amount: number) {
  return type === "income" ? Math.abs(amount) : -Math.abs(amount);
}

export async function createTransaction(formData: FormData) {
  const user = await requireCompletedUser();
  const amount = Math.abs(numberValue(formData.get("amount")));
  const type = textValue(formData.get("type"), "expense");
  const accountId = textValue(formData.get("accountId")) || null;

  await prisma.transaction.create({
    data: {
      userId: user.id,
      accountId,
      name: textValue(formData.get("name"), "Movimiento"),
      category: (() => {
        const explicitCategory = textValue(formData.get("category"));
        return explicitCategory && explicitCategory.toLowerCase() !== "auto"
          ? explicitCategory
          : suggestCategory({
              name: textValue(formData.get("name")),
              merchant: textValue(formData.get("merchant")),
              notes: textValue(formData.get("notes")),
              type
            });
      })(),
      amount,
      type,
      merchant: textValue(formData.get("merchant")) || null,
      date: dateValue(formData.get("date")),
      recurring: textValue(formData.get("recurring")) === "on",
      notes: textValue(formData.get("notes")) || null
    }
  });

  await changeAccountBalance(accountId, transactionDelta(type, amount));
  refreshAll();
}

export async function updateTransaction(formData: FormData) {
  const user = await requireCompletedUser();
  const id = textValue(formData.get("id"));
  if (!id) return;

  const existing = await prisma.transaction.findFirst({ where: { id, userId: user.id } });
  if (!existing) return;

  const amount = Math.abs(numberValue(formData.get("amount")));
  const type = textValue(formData.get("type"), "expense");
  const accountId = textValue(formData.get("accountId")) || null;

  await prisma.transaction.updateMany({
    where: { id, userId: user.id },
    data: {
      accountId,
      name: textValue(formData.get("name"), "Movimiento"),
      category: (() => {
        const explicitCategory = textValue(formData.get("category"));
        return explicitCategory && explicitCategory.toLowerCase() !== "auto"
          ? explicitCategory
          : suggestCategory({
              name: textValue(formData.get("name")),
              merchant: textValue(formData.get("merchant")),
              notes: textValue(formData.get("notes")),
              type
            });
      })(),
      amount,
      type,
      merchant: textValue(formData.get("merchant")) || null,
      date: dateValue(formData.get("date")),
      recurring: textValue(formData.get("recurring")) === "on",
      notes: textValue(formData.get("notes")) || null
    }
  });

  await changeAccountBalance(existing.accountId, -transactionDelta(existing.type, existing.amount));
  await changeAccountBalance(accountId, transactionDelta(type, amount));
  refreshAll();
}

export async function deleteTransaction(formData: FormData) {
  const user = await requireCompletedUser();
  const id = textValue(formData.get("id"));
  if (!id) return;
  const existing = await prisma.transaction.findFirst({ where: { id, userId: user.id } });
  if (!existing) return;
  await prisma.transaction.deleteMany({ where: { id, userId: user.id } });
  await changeAccountBalance(existing.accountId, -transactionDelta(existing.type, existing.amount));
  refreshAll();
}

export async function createAccount(formData: FormData) {
  const user = await requireCompletedUser();
  const opening = Math.abs(numberValue(formData.get("initialBalance")));
  await prisma.account.create({
    data: {
      userId: user.id,
      name: textValue(formData.get("name"), "Nueva cuenta"),
      type: textValue(formData.get("type"), "bank"),
      currency: textValue(formData.get("currency"), user.currency || "USD"),
      initialBalance: opening,
      currentBalance: opening,
      icon: textValue(formData.get("icon")) || null,
      color: textValue(formData.get("color")) || null,
      isActive: textValue(formData.get("isActive")) !== "off"
    }
  });
  refreshAll();
}

export async function updateAccount(formData: FormData) {
  const user = await requireCompletedUser();
  const id = textValue(formData.get("id"));
  if (!id) return;
  const existing = await prisma.account.findFirst({ where: { id, userId: user.id } });
  if (!existing) return;

  const nextInitialBalance = Math.abs(numberValue(formData.get("initialBalance")));
  const diff = nextInitialBalance - existing.initialBalance;

  await prisma.account.updateMany({
    where: { id, userId: user.id },
    data: {
      name: textValue(formData.get("name"), existing.name),
      type: textValue(formData.get("type"), existing.type),
      currency: textValue(formData.get("currency"), existing.currency),
      initialBalance: nextInitialBalance,
      currentBalance: { increment: diff },
      icon: textValue(formData.get("icon")) || null,
      color: textValue(formData.get("color")) || null,
      isActive: textValue(formData.get("isActive")) !== "off"
    }
  });
  refreshAll();
}

export async function deleteAccount(formData: FormData) {
  const user = await requireCompletedUser();
  const id = textValue(formData.get("id"));
  if (!id) return;
  await prisma.transaction.updateMany({ where: { accountId: id, userId: user.id }, data: { accountId: null } });
  await prisma.transfer.deleteMany({ where: { userId: user.id, OR: [{ fromAccountId: id }, { toAccountId: id }] } });
  await prisma.account.deleteMany({ where: { id, userId: user.id } });
  refreshAll();
}

export async function createTransfer(formData: FormData) {
  const user = await requireCompletedUser();
  const fromAccountId = textValue(formData.get("fromAccountId"));
  const toAccountId = textValue(formData.get("toAccountId"));
  const amount = Math.abs(numberValue(formData.get("amount")));
  if (!fromAccountId || !toAccountId || fromAccountId === toAccountId || amount <= 0) return;

  await prisma.transfer.create({
    data: {
      userId: user.id,
      fromAccountId,
      toAccountId,
      amount,
      date: dateValue(formData.get("date")),
      note: textValue(formData.get("note")) || null
    }
  });

  await changeAccountBalance(fromAccountId, -amount);
  await changeAccountBalance(toAccountId, amount);
  refreshAll();
}

export async function reconcileAccount(formData: FormData) {
  const user = await requireCompletedUser();
  const accountId = textValue(formData.get("accountId"));
  const actualBalance = numberValue(formData.get("actualBalance"));
  const note = textValue(formData.get("note")) || null;
  if (!accountId) return;

  const account = await prisma.account.findFirst({ where: { id: accountId, userId: user.id } });
  if (!account) return;

  const adjustment = actualBalance - account.currentBalance;

  await prisma.$transaction(async (tx) => {
    await tx.accountReconciliation.create({
      data: {
        userId: user.id,
        accountId: account.id,
        balanceBefore: account.currentBalance,
        actualBalance,
        adjustment,
        note
      }
    });

    await tx.account.update({
      where: { id: account.id },
      data: { currentBalance: actualBalance }
    });

    if (adjustment !== 0) {
      await tx.transaction.create({
        data: {
          userId: user.id,
          accountId: account.id,
          name: adjustment > 0 ? 'Ajuste de conciliación a favor' : 'Ajuste de conciliación',
          category: 'Ajuste',
          amount: Math.abs(adjustment),
          type: adjustment > 0 ? 'income' : 'expense',
          merchant: 'Conciliación',
          date: new Date(),
          recurring: false,
          notes: note || 'Ajuste generado por conciliación de cuenta'
        }
      });
    }
  });

  refreshAll();
}

export async function createBudget(formData: FormData) {
  const user = await requireCompletedUser();
  await prisma.budgetCategory.create({
    data: {
      userId: user.id,
      name: textValue(formData.get("name"), "Nueva categoría"),
      icon: textValue(formData.get("icon"), "Wallet"),
      limitAmount: Math.abs(numberValue(formData.get("limitAmount"))),
      alertPercent: Math.max(1, Math.min(100, Math.round(numberValue(formData.get("alertPercent")) || 80)))
    }
  });
  refreshAll();
}

export async function updateBudget(formData: FormData) {
  const user = await requireCompletedUser();
  const id = textValue(formData.get("id"));
  if (!id) return;
  await prisma.budgetCategory.updateMany({
    where: { id, userId: user.id },
    data: {
      name: textValue(formData.get("name"), "Nueva categoría"),
      icon: textValue(formData.get("icon"), "Wallet"),
      limitAmount: Math.abs(numberValue(formData.get("limitAmount"))),
      alertPercent: Math.max(1, Math.min(100, Math.round(numberValue(formData.get("alertPercent")) || 80)))
    }
  });
  refreshAll();
}

export async function deleteBudget(formData: FormData) {
  const user = await requireCompletedUser();
  const id = textValue(formData.get("id"));
  if (!id) return;
  await prisma.budgetCategory.deleteMany({ where: { id, userId: user.id } });
  refreshAll();
}

export async function createSubscription(formData: FormData) {
  const user = await requireCompletedUser();
  await prisma.subscription.create({
    data: {
      userId: user.id,
      name: textValue(formData.get("name"), "Nueva suscripción"),
      category: textValue(formData.get("category"), "General"),
      monthlyCost: Math.abs(numberValue(formData.get("monthlyCost"))),
      status: textValue(formData.get("status"), "active"),
      renewalType: textValue(formData.get("renewalType"), "monthly"),
      nextBillingDate: dateValue(formData.get("nextBillingDate"))
    }
  });
  refreshAll();
}

export async function updateSubscription(formData: FormData) {
  const user = await requireCompletedUser();
  const id = textValue(formData.get("id"));
  if (!id) return;
  await prisma.subscription.updateMany({
    where: { id, userId: user.id },
    data: {
      name: textValue(formData.get("name"), "Nueva suscripción"),
      category: textValue(formData.get("category"), "General"),
      monthlyCost: Math.abs(numberValue(formData.get("monthlyCost"))),
      status: textValue(formData.get("status"), "active"),
      renewalType: textValue(formData.get("renewalType"), "monthly"),
      nextBillingDate: dateValue(formData.get("nextBillingDate"))
    }
  });
  refreshAll();
}

export async function deleteSubscription(formData: FormData) {
  const user = await requireCompletedUser();
  const id = textValue(formData.get("id"));
  if (!id) return;
  await prisma.subscription.deleteMany({ where: { id, userId: user.id } });
  refreshAll();
}

export async function createGoal(formData: FormData) {
  const user = await requireCompletedUser();
  await prisma.goal.create({
    data: {
      userId: user.id,
      name: textValue(formData.get("name"), "Nueva meta"),
      targetAmount: Math.abs(numberValue(formData.get("targetAmount"))),
      currentAmount: Math.abs(numberValue(formData.get("currentAmount"))),
      targetDate: dateValue(formData.get("targetDate"))
    }
  });
  refreshAll();
}

export async function updateGoal(formData: FormData) {
  const user = await requireCompletedUser();
  const id = textValue(formData.get("id"));
  if (!id) return;
  await prisma.goal.updateMany({
    where: { id, userId: user.id },
    data: {
      name: textValue(formData.get("name"), "Nueva meta"),
      targetAmount: Math.abs(numberValue(formData.get("targetAmount"))),
      currentAmount: Math.abs(numberValue(formData.get("currentAmount"))),
      targetDate: dateValue(formData.get("targetDate"))
    }
  });
  refreshAll();
}

export async function deleteGoal(formData: FormData) {
  const user = await requireCompletedUser();
  const id = textValue(formData.get("id"));
  if (!id) return;
  await prisma.goal.deleteMany({ where: { id, userId: user.id } });
  refreshAll();
}

export async function createRecurringBill(formData: FormData) {
  const user = await requireCompletedUser();
  await prisma.recurringBill.create({
    data: {
      userId: user.id,
      name: textValue(formData.get("name"), "Nuevo pago"),
      amount: Math.abs(numberValue(formData.get("amount"))),
      dueDate: dateValue(formData.get("dueDate")),
      frequency: textValue(formData.get("frequency"), "monthly"),
      isPaid: textValue(formData.get("isPaid")) === "on"
    }
  });
  refreshAll();
}

export async function updateRecurringBill(formData: FormData) {
  const user = await requireCompletedUser();
  const id = textValue(formData.get("id"));
  if (!id) return;
  await prisma.recurringBill.updateMany({
    where: { id, userId: user.id },
    data: {
      name: textValue(formData.get("name"), "Nuevo pago"),
      amount: Math.abs(numberValue(formData.get("amount"))),
      dueDate: dateValue(formData.get("dueDate")),
      frequency: textValue(formData.get("frequency"), "monthly"),
      isPaid: textValue(formData.get("isPaid")) === "on"
    }
  });
  refreshAll();
}

export async function deleteRecurringBill(formData: FormData) {
  const user = await requireCompletedUser();
  const id = textValue(formData.get("id"));
  if (!id) return;
  await prisma.recurringBill.deleteMany({ where: { id, userId: user.id } });
  refreshAll();
}
