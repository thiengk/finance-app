import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { goals } from "@/db/schema";
import { depositGoalSchema } from "@/lib/validations";
import { eq, and, sql } from "drizzle-orm";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ code: "AUTH_ERROR", message: "Chưa đăng nhập" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = depositGoalSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { code: "VALIDATION_ERROR", message: "Dữ liệu không hợp lệ", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  // Update current amount
  const [updated] = await db
    .update(goals)
    .set({
      currentAmount: sql`${goals.currentAmount}::numeric + ${parsed.data.amount}`,
    })
    .where(and(eq(goals.id, id), eq(goals.userId, session.user.id)))
    .returning();

  if (!updated) {
    return NextResponse.json({ code: "NOT_FOUND", message: "Không tìm thấy mục tiêu" }, { status: 404 });
  }

  // Check if goal is completed
  if (parseFloat(updated.currentAmount) >= parseFloat(updated.targetAmount)) {
    await db
      .update(goals)
      .set({ status: "completed" })
      .where(eq(goals.id, id));
    updated.status = "completed";
  }

  return NextResponse.json(updated);
}
