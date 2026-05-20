"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Email hoặc mật khẩu không đúng");
    } else {
      router.push(callbackUrl);
    }
    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Đăng ký thất bại");
        setLoading(false);
        return;
      }

      // Auto login after register
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Đăng ký thành công nhưng đăng nhập thất bại. Thử đăng nhập lại.");
      } else {
        router.push("/");
      }
    } catch {
      setError("Có lỗi xảy ra. Vui lòng thử lại.");
    }
    setLoading(false);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">💰 Quản lý Tài chính</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {isRegister ? "Tạo tài khoản mới" : "Đăng nhập để tiếp tục"}
          </p>
        </div>

        <form onSubmit={isRegister ? handleRegister : handleLogin} className="space-y-4">
          {isRegister && (
            <input
              type="text"
              placeholder="Họ tên"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={2}
              className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />

          <input
            type="password"
            placeholder="Mật khẩu (ít nhất 6 ký tự)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? "Đang xử lý..." : isRegister ? "Đăng ký" : "Đăng nhập"}
          </button>
        </form>

        <div className="text-center">
          <button
            onClick={() => { setIsRegister(!isRegister); setError(""); }}
            className="text-sm text-primary hover:underline"
          >
            {isRegister ? "Đã có tài khoản? Đăng nhập" : "Chưa có tài khoản? Đăng ký"}
          </button>
        </div>
      </div>
    </main>
  );
}
