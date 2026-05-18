import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { jars } from "@/db/schema";
import { createJarSchema } from "@/lib/validations";
import { eq, and, sql } from "drizzle-orm";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ code: "AUTH_ERROR", message: "Chưa đăng nhập" }, { status: 401 });
  }

  const data = await db
    .select()
    .from(jars)
    .where(eq(jars.userId, session.user.id));

  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ code: "AUTH_ERROR", message: "Chưa đăng nhập" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = createJarSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { code: "VALIDATION_ERROR", message: "Dữ liệu không hợp lệ", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  // Check total percentage doesn't exceed 100%
  const existingJars = await db
    .select({ totalPercentage: sql<number>`COALESCE(SUM(${jars.percentage}::numeric), 0)` })
    .from(jars)
    .where(eq(jars.userId, session.user.id));

  const currentTotal = existingJars[0]?.totalPercentage ?? 0;
  if (currentTotal + parsed.data.percentage > 100) {
    return NextResponse.json(
      { code: "VALIDATION_ERROR", message: `Tổng tỷ lệ vượt quá 100%. Hiện tại: ${currentTotal}%, còn lại: ${100 - currentTotal}%` },
      { status: 400 }
    );
  }

  const [newJar] = await db
    .insert(jars)
    .values({
      userId: session.user.id,
      name: parsed.data.name,
      percentage: parsed.data.percentage.toString(),
      color: parsed.data.color,
      icon: parsed.data.icon,
      warningThreshold: parsed.data.warningThreshold.toString(),
    })
    .returning();

  return NextResponse.json(newJar, { status: 201 });
}
