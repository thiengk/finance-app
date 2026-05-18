import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { transactions } from "@/db/schema";
import { createTransactionSchema, transactionQuerySchema } from "@/lib/validations";
import { eq, and, desc, gte, lte, like, sql, count } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ code: "AUTH_ERROR", message: "Chưa đăng nhập" }, { status: 401 });
  }

  const searchParams = Object.fromEntries(req.nextUrl.searchParams);
  const query = transactionQuerySchema.safeParse(searchParams);

  if (!query.success) {
    return NextResponse.json(
      { code: "VALIDATION_ERROR", message: "Tham số không hợp lệ", details: query.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { period, category, page, limit } = query.data;
  const offset = (page - 1) * limit;

  const conditions = [eq(transactions.userId, session.user.id)];

  // Filter by period
  if (period) {
    const now = new Date();
    let startDate: Date;
    switch (period) {
      case "day":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "year":
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
    }
    conditions.push(gte(transactions.transactionDate, startDate));
  }

  // Filter by category
  if (category) {
    conditions.push(eq(transactions.category, category));
  }

  const [data, totalResult] = await Promise.all([
    db
      .select()
      .from(transactions)
      .where(and(...conditions))
      .orderBy(desc(transactions.transactionDate))
      .limit(limit)
      .offset(offset),
    db
      .select({ total: count() })
      .from(transactions)
      .where(and(...conditions)),
  ]);

  const total = totalResult[0]?.total ?? 0;

  return NextResponse.json({
    data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ code: "AUTH_ERROR", message: "Chưa đăng nhập" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = createTransactionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { code: "VALIDATION_ERROR", message: "Dữ liệu không hợp lệ", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { amount, type, category, description, transactionDate, jarId } = parsed.data;

  const [newTransaction] = await db
    .insert(transactions)
    .values({
      userId: session.user.id,
      amount: amount.toString(),
      type,
      category,
      description: description || null,
      transactionDate: transactionDate ? new Date(transactionDate) : new Date(),
      jarId: jarId || null,
    })
    .returning();

  return NextResponse.json(newTransaction, { status: 201 });
}
