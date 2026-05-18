import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { jars } from "@/db/schema";
import { updateJarSchema } from "@/lib/validations";
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
  const parsed = updateJarSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { code: "VALIDATION_ERROR", message: "Dữ liệu không hợp lệ", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const updateData: Record<string, unknown> = {};
  if (parsed.data.name !== undefined) updateData.name = parsed.data.name;
  if (parsed.data.percentage !== undefined) updateData.percentage = parsed.data.percentage.toString();
  if (parsed.data.color !== undefined) updateData.color = parsed.data.color;
  if (parsed.data.icon !== undefined) updateData.icon = parsed.data.icon;
  if (parsed.data.warningThreshold !== undefined) updateData.warningThreshold = parsed.data.warningThreshold.toString();

  const [updated] = await db
    .update(jars)
    .set(updateData)
    .where(and(eq(jars.id, id), eq(jars.userId, session.user.id)))
    .returning();

  if (!updated) {
    return NextResponse.json({ code: "NOT_FOUND", message: "Không tìm thấy hũ" }, { status: 404 });
  }

  return NextResponse.json(updated);
}
