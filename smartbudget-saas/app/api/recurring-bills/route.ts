import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const recurringBills = await prisma.recurringBill.findMany({ orderBy: { dueDate: "asc" } });
  return NextResponse.json(recurringBills);
}
