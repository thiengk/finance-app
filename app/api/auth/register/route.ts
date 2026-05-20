import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(2, "Tên ít nhất 2 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu ít nhất 6 ký tự"),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { code: "VALIDATION_ERROR", message: "Dữ liệu không hợp lệ", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { name, email, password } = parsed.data;

  // Check email exists
  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing) {
    return NextResponse.json(
      { code: "VALIDATION_ERROR", message: "Email đã được sử dụng" },
      { status: 409 }
    );
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const [newUser] = await db
    .insert(users)
    .values({
      name,
      email,
      password: hashedPassword,
    })
    .returning({ id: users.id, name: users.name, email: users.email });

  return NextResponse.json(newUser, { status: 201 });
}
