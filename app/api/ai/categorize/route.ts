import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { categorizeTransaction } from "@/services/ai";
import { z } from "zod";

const schema = z.object({ description: z.string().min(1) });

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ code: "AUTH_ERROR", message: "Chưa đăng nhập" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ code: "VALIDATION_ERROR", message: "Thiếu mô tả" }, { status: 400 });
  }

  const category = await categorizeTransaction(parsed.data.description);
  return NextResponse.json({ category });
}
