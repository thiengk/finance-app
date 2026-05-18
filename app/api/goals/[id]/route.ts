import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { goals } from "@/db/schema";
import { updateGoalSchema } from "@/lib/validations";
import { eq, and } from "drizzle-orm";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ code: "AUTH_ERROR", message: "Chưa đăng nhập" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = updateGoalSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { code: "VALIDATION_ERROR", message: "Dữ liệu không hợp lệ", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const updateData: Record<string, unknown> = {};
  if (parsed.data.name !== undefined) updateData.name = parsed.data.name;
  if (parsed.data.targetAmount !== undefined) updateData.targetAmount = parsed.data.targetAmount.toString();
  if (parsed.data.deadline !== undefined) updateData.deadline = parsed.data.deadline;

  const [updated] = await db
    .update(goals)
    .set(updateData)
    .where(and(eq(goals.id, id), eq(goals.userId, session.user.id)))
    .returning();

  if (!updated) {
    return NextResponse.json({ code: "NOT_FOUND", message: "Không tìm thấy mục tiêu" }, { status: 404 });
  }

  return NextResponse.json(updated);
}
