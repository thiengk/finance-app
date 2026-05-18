import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { transactions } from "@/db/schema";
import { eq, and, gte, lte, sql } from "drizzle-orm";
import { suggestBudget } from "@/services/ai";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ code: "AUTH_ERROR", message: "Chưa đăng nhập" }, { status: 401 });
  }

  const now = new Date();
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  const breakdown = await db
    .select({
      category: transactions.category,
      total: sql<number>`SUM(${transactions.amount}::numeric)`,
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, session.user.id),
        eq(transactions.type, "expense"),
        gte(transactions.transactionDate, startOfLastMonth),
        lte(transactions.transactionDate, endOfLastMonth)
      )
    )
    .groupBy(transactions.category);

  const suggestion = await suggestBudget(
    breakdown.map((b) => ({ category: b.category, total: Number(b.total) }))
  );

  return NextResponse.json({ suggestion });
}
