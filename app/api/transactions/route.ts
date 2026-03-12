import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const transactions = await prisma.transaction.findMany({ orderBy: { date: "desc" } });
  return NextResponse.json(transactions);
}
