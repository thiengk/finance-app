import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { goals } from "@/db/schema";
import { createGoalSchema } from "@/lib/validations";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ code: "AUTH_ERROR", message: "Chưa đăng nhập" }, { status: 401 });
  }

  const data = await db
    .select()
    .from(goals)
    .where(eq(goals.userId, session.user.id))
    .orderBy(desc(goals.createdAt));

  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ code: "AUTH_ERROR", message: "Chưa đăng nhập" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = createGoalSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { code: "VALIDATION_ERROR", message: "Dữ liệu không hợp lệ", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  // Calculate monthly target
  const deadline = new Date(parsed.data.deadline);
  const now = new Date();
  const monthsRemaining = Math.max(
    1,
    (deadline.getFullYear() - now.getFullYear()) * 12 + (deadline.getMonth() - now.getMonth())
  );
  const monthlyTarget = parsed.data.targetAmount / monthsRemaining;

  const [newGoal] = await db
    .insert(goals)
    .values({
      userId: session.user.id,
      name: parsed.data.name,
      targetAmount: parsed.data.targetAmount.toString(),
      deadline: parsed.data.deadline,
      monthlyTarget: monthlyTarget.toFixed(2),
    })
    .returning();

  return NextResponse.json(newGoal, { status: 201 });
}
