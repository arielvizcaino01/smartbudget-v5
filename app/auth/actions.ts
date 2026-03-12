"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { clearSession, createSession, getCurrentUser } from "@/lib/auth";

function textValue(value: FormDataEntryValue | null, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

function normalizeEmail(value: string) {
  return value.toLowerCase().trim();
}

export async function signUp(formData: FormData) {
  const name = textValue(formData.get("name"));
  const email = normalizeEmail(textValue(formData.get("email")));
  const password = textValue(formData.get("password"));

  if (!name || !email || password.length < 8) {
    redirect("/auth/signup?error=Datos%20inválidos");
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    redirect("/auth/signin?error=Ese%20correo%20ya%20existe");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash
    }
  });

  await createSession({ userId: user.id, email: user.email });
  redirect("/onboarding");
}

export async function signIn(formData: FormData) {
  const email = normalizeEmail(textValue(formData.get("email")));
  const password = textValue(formData.get("password"));

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    redirect("/auth/signin?error=Credenciales%20inválidas");
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    redirect("/auth/signin?error=Credenciales%20inválidas");
  }

  await createSession({ userId: user.id, email: user.email });
  redirect(user.onboardingComplete ? "/dashboard" : "/onboarding");
}

export async function signOut() {
  await clearSession();
  redirect("/auth/signin");
}

export async function completeOnboarding(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/signin");

  const name = textValue(formData.get("name"), user.name);
  const currency = textValue(formData.get("currency"), "USD");
  const monthlyIncome = Math.max(0, Number(formData.get("monthlyIncome")) || 0);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      name,
      currency,
      monthlyIncome,
      onboardingComplete: true
    }
  });

  const existingBudgets = await prisma.budgetCategory.count({ where: { userId: user.id } });
  if (!existingBudgets) {
    await prisma.budgetCategory.createMany({
      data: [
        { userId: user.id, name: "Comida", icon: "Utensils", limitAmount: monthlyIncome * 0.15 || 400, alertPercent: 80 },
        { userId: user.id, name: "Transporte", icon: "Car", limitAmount: monthlyIncome * 0.1 || 250, alertPercent: 80 },
        { userId: user.id, name: "Hogar", icon: "Home", limitAmount: monthlyIncome * 0.3 || 900, alertPercent: 85 },
        { userId: user.id, name: "Entretenimiento", icon: "Film", limitAmount: monthlyIncome * 0.08 || 180, alertPercent: 75 }
      ]
    });
  }

  redirect("/dashboard");
}
