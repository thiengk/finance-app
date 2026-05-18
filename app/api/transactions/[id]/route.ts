import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { transactions } from "@/db/schema";
import { updateTransactionSchema } from "@/lib/validations";
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
  const parsed = updateTransactionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { code: "VALIDATION_ERROR", message: "Dữ liệu không hợp lệ", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const updateData: Record<string, unknown> = {};
  if (parsed.data.amount !== undefined) updateData.amount = parsed.data.amount.toString();
  if (parsed.data.type !== undefined) updateData.type = parsed.data.type;
  if (parsed.data.category !== undefined) updateData.category = parsed.data.category;
  if (parsed.data.description !== undefined) updateData.description = parsed.data.description;
  if (parsed.data.transactionDate !== undefined) updateData.transactionDate = new Date(parsed.data.transactionDate);
  if (parsed.data.jarId !== undefined) updateData.jarId = parsed.data.jarId;

  const [updated] = await db
    .update(transactions)
    .set(updateData)
    .where(and(eq(transactions.id, id), eq(transactions.userId, session.user.id)))
    .returning();

  if (!updated) {
    return NextResponse.json({ code: "NOT_FOUND", message: "Không tìm thấy giao dịch" }, { status: 404 });
  }

  return NextResponse.json(updated);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ code: "AUTH_ERROR", message: "Chưa đăng nhập" }, { status: 401 });
  }

  const { id } = await params;

  const [deleted] = await db
    .delete(transactions)
    .where(and(eq(transactions.id, id), eq(transactions.userId, session.user.id)))
    .returning();

  if (!deleted) {
    return NextResponse.json({ code: "NOT_FOUND", message: "Không tìm thấy giao dịch" }, { status: 404 });
  }

  return NextResponse.json({ message: "Đã xóa giao dịch" });
}
