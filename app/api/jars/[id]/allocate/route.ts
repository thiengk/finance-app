import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { jars, transactions } from "@/db/schema";
import { allocateJarSchema } from "@/lib/validations";
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
  const parsed = allocateJarSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { code: "VALIDATION_ERROR", message: "Dữ liệu không hợp lệ", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  // Update jar balance
  const [updated] = await db
    .update(jars)
    .set({
      balance: sql`${jars.balance}::numeric + ${parsed.data.amount}`,
    })
    .where(and(eq(jars.id, id), eq(jars.userId, session.user.id)))
    .returning();

  if (!updated) {
    return NextResponse.json({ code: "NOT_FOUND", message: "Không tìm thấy hũ" }, { status: 404 });
  }

  return NextResponse.json(updated);
}
