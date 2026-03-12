import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const budgets = await prisma.budgetCategory.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(budgets);
}
