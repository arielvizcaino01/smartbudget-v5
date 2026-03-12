import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const subscriptions = await prisma.subscription.findMany({ orderBy: { nextBillingDate: "asc" } });
  return NextResponse.json(subscriptions);
}
