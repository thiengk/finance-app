import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { jars, transactions } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";

const allocateIncomeSchema = z.object({
  amount: z.number().positive("Số tiền phải lớn hơn 0"),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ code: "AUTH_ERROR", message: "Chưa đăng nhập" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = allocateIncomeSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { code: "VALIDATION_ERROR", message: "Dữ liệu không hợp lệ" },
      { status: 400 }
    );
  }

  const { amount } = parsed.data;

  // Get all jars for user
  const userJars = await db
    .select()
    .from(jars)
    .where(eq(jars.userId, session.user.id));

  if (userJars.length === 0) {
    return NextResponse.json(
      { code: "VALIDATION_ERROR", message: "Chưa có hũ nào. Vui lòng tạo hũ trước." },
      { status: 400 }
    );
  }

  // Allocate to each jar based on percentage
  const allocations = userJars.map((jar) => {
    const jarAmount = (amount * parseFloat(jar.percentage)) / 100;
    return { jarId: jar.id, jarName: jar.name, amount: jarAmount };
  });

  // Update balances
  for (const allocation of allocations) {
    await db
      .update(jars)
      .set({ balance: sql`${jars.balance}::numeric + ${allocation.amount}` })
      .where(eq(jars.id, allocation.jarId));
  }

  // Create income transaction
  await db.insert(transactions).values({
    userId: session.user.id,
    amount: amount.toString(),
    type: "income",
    category: "Thu nhập",
    description: "Phân bổ thu nhập vào hũ",
    transactionDate: new Date(),
  });

  return NextResponse.json({ allocations, total: amount });
}
