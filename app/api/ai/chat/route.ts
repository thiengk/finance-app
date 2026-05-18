import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { transactions } from "@/db/schema";
import { eq, and, gte, sql } from "drizzle-orm";
import { chatWithAI } from "@/services/ai";
import { z } from "zod";

const schema = z.object({ message: z.string().min(1) });

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ code: "AUTH_ERROR", message: "Chưa đăng nhập" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ code: "VALIDATION_ERROR", message: "Thiếu tin nhắn" }, { status: 400 });
  }

  // Get user context
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [summaryResult, categoryResult] = await Promise.all([
    db
      .select({ total: sql<number>`COALESCE(SUM(${transactions.amount}::numeric), 0)` })
      .from(transactions)
      .where(and(eq(transactions.userId, session.user.id), eq(transactions.type, "expense"), gte(transactions.transactionDate, startOfMonth))),
    db
      .select({ category: transactions.category, total: sql<number>`SUM(${transactions.amount}::numeric)` })
      .from(transactions)
      .where(and(eq(transactions.userId, session.user.id), eq(transactions.type, "expense"), gte(transactions.transactionDate, startOfMonth)))
      .groupBy(transactions.category)
      .orderBy(sql`SUM(${transactions.amount}::numeric) DESC`)
      .limit(5),
  ]);

  const totalExpense = Number(summaryResult[0]?.total ?? 0);
  const topCategories = categoryResult.map((c) => `${c.category}: ${Number(c.total).toLocaleString()}đ`).join(", ");

  const reply = await chatWithAI(parsed.data.message, {
    totalExpense,
    topCategories,
    recentSummary: `Tổng chi tháng này: ${totalExpense.toLocaleString()}đ. Top: ${topCategories}`,
  });

  return NextResponse.json({ reply });
}
