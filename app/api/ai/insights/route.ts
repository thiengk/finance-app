import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { transactions } from "@/db/schema";
import { eq, and, gte, sql } from "drizzle-orm";
import { generateInsights } from "@/services/ai";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ code: "AUTH_ERROR", message: "Chưa đăng nhập" }, { status: 401 });
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [currentMonth, lastMonth, breakdown] = await Promise.all([
    db
      .select({ total: sql<number>`COALESCE(SUM(${transactions.amount}::numeric), 0)` })
      .from(transactions)
      .where(and(eq(transactions.userId, session.user.id), eq(transactions.type, "expense"), gte(transactions.transactionDate, startOfMonth))),
    db
      .select({ total: sql<number>`COALESCE(SUM(${transactions.amount}::numeric), 0)` })
      .from(transactions)
      .where(and(eq(transactions.userId, session.user.id), eq(transactions.type, "expense"), gte(transactions.transactionDate, startOfLastMonth))),
    db
      .select({ category: transactions.category, total: sql<number>`SUM(${transactions.amount}::numeric)` })
      .from(transactions)
      .where(and(eq(transactions.userId, session.user.id), eq(transactions.type, "expense"), gte(transactions.transactionDate, startOfMonth)))
      .groupBy(transactions.category),
  ]);

  const insights = await generateInsights({
    totalExpense: Number(currentMonth[0]?.total ?? 0),
    categoryBreakdown: breakdown.map((b) => ({ category: b.category, total: Number(b.total) })),
    previousMonthExpense: Number(lastMonth[0]?.total ?? 0),
  });

  return NextResponse.json({ insights });
}
