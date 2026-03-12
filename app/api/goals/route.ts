import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const goals = await prisma.goal.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(goals);
}
