import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { transactions } from "@/db/schema";
import { eq, and, gte, sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ code: "AUTH_ERROR", message: "Chưa đăng nhập" }, { status: 401 });
  }

  const months = parseInt(req.nextUrl.searchParams.get("months") || "6");
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth() - months, 1);

  const result = await db
    .select({
      month: sql<string>`TO_CHAR(${transactions.transactionDate}, 'YYYY-MM')`,
      type: transactions.type,
      total: sql<number>`COALESCE(SUM(${transactions.amount}::numeric), 0)`,
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, session.user.id),
        gte(transactions.transactionDate, startDate)
      )
    )
    .groupBy(sql`TO_CHAR(${transactions.transactionDate}, 'YYYY-MM')`, transactions.type)
    .orderBy(sql`TO_CHAR(${transactions.transactionDate}, 'YYYY-MM')`);

  // Transform into chart-friendly format
  const monthMap = new Map<string, { month: string; income: number; expense: number }>();

  for (const row of result) {
    if (!monthMap.has(row.month)) {
      monthMap.set(row.month, { month: row.month, income: 0, expense: 0 });
    }
    const entry = monthMap.get(row.month)!;
    if (row.type === "income") entry.income = Number(row.total);
    else entry.expense = Number(row.total);
  }

  return NextResponse.json(Array.from(monthMap.values()));
}
