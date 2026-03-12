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
    "/dashboard/budgets",
    "/dashboard/subscriptions",
    "/dashboard/goals",
    "/dashboard/settings",
  ].forEach((path) => revalidatePath(path));
}

export async function createTransaction(formData: FormData) {
  const user = await requireCompletedUser();
  await prisma.transaction.create({
    data: {
      userId: user.id,
      name: textValue(formData.get("name"), "Movimiento"),
      category: (() => {
        const explicitCategory = textValue(formData.get("category"));
        return explicitCategory && explicitCategory.toLowerCase() !== "auto"
          ? explicitCategory
          : suggestCategory({
              name: textValue(formData.get("name")),
              merchant: textValue(formData.get("merchant")),
              notes: textValue(formData.get("notes")),
              type: textValue(formData.get("type"), "expense")
            });
      })(),
      amount: Math.abs(numberValue(formData.get("amount"))),
      type: textValue(formData.get("type"), "expense"),
      merchant: textValue(formData.get("merchant")) || null,
      date: dateValue(formData.get("date")),
      recurring: textValue(formData.get("recurring")) === "on",
      notes: textValue(formData.get("notes")) || null
    }
  });
  refreshAll();
}

export async function updateTransaction(formData: FormData) {
  const user = await requireCompletedUser();
  const id = textValue(formData.get("id"));
  if (!id) return;

  await prisma.transaction.updateMany({
    where: { id, userId: user.id },
    data: {
      name: textValue(formData.get("name"), "Movimiento"),
      category: (() => {
        const explicitCategory = textValue(formData.get("category"));
        return explicitCategory && explicitCategory.toLowerCase() !== "auto"
          ? explicitCategory
          : suggestCategory({
              name: textValue(formData.get("name")),
              merchant: textValue(formData.get("merchant")),
              notes: textValue(formData.get("notes")),
              type: textValue(formData.get("type"), "expense")
            });
      })(),
      amount: Math.abs(numberValue(formData.get("amount"))),
      type: textValue(formData.get("type"), "expense"),
      merchant: textValue(formData.get("merchant")) || null,
      date: dateValue(formData.get("date")),
      recurring: textValue(formData.get("recurring")) === "on",
      notes: textValue(formData.get("notes")) || null
    }
  });
  refreshAll();
}

export async function deleteTransaction(formData: FormData) {
  const user = await requireCompletedUser();
  const id = textValue(formData.get("id"));
  if (!id) return;
  await prisma.transaction.deleteMany({ where: { id, userId: user.id } });
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
