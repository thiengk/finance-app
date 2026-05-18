"use client";

import { useEffect, useState } from "react";
import { QuickAddButton } from "@/components/quick-add-button";
import { JarCard } from "@/components/jar-card";
import Link from "next/link";

type Summary = { income: number; expense: number; balance: number };
type Transaction = { id: string; amount: string; type: string; category: string; description: string | null; transactionDate: string };
type Jar = { id: string; name: string; icon: string; color: string; balance: string; percentage: string; warningThreshold: string };
type Goal = { id: string; name: string; targetAmount: string; currentAmount: string; deadline: string; status: string };

export default function DashboardPage() {
  const [summary, setSummary] = useState<Summary>({ income: 0, expense: 0, balance: 0 });
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [jars, setJars] = useState<Jar[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const [summaryRes, txRes, jarsRes, goalsRes] = await Promise.all([
      fetch("/api/reports/summary?period=month"),
      fetch("/api/transactions?limit=5"),
      fetch("/api/jars"),
      fetch("/api/goals"),
    ]);

    if (summaryRes.ok) setSummary(await summaryRes.json());
    if (txRes.ok) {
      const json = await txRes.json();
      setRecentTransactions(json.data);
    }
    if (jarsRes.ok) setJars(await jarsRes.json());
    if (goalsRes.ok) setGoals((await goalsRes.json()).filter((g: Goal) => g.status === "active").slice(0, 2));
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 pb-24 sm:p-6">
      {/* Header */}
      <h1 className="text-xl font-bold mb-4">Tổng quan</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="rounded-xl bg-green-50 p-3 dark:bg-green-950">
          <p className="text-xs text-muted-foreground">Thu nhập</p>
          <p className="text-sm font-bold text-green-600">{formatCurrency(summary.income)}</p>
        </div>
        <div className="rounded-xl bg-red-50 p-3 dark:bg-red-950">
          <p className="text-xs text-muted-foreground">Chi tiêu</p>
          <p className="text-sm font-bold text-red-600">{formatCurrency(summary.expense)}</p>
        </div>
        <div className="rounded-xl bg-blue-50 p-3 dark:bg-blue-950">
          <p className="text-xs text-muted-foreground">Còn lại</p>
          <p className="text-sm font-bold text-blue-600">{formatCurrency(summary.balance)}</p>
        </div>
      </div>

      {/* Jars mini */}
      {jars.length > 0 && (
        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Hũ tài chính</h2>
            <Link href="/jars" className="text-xs text-primary">Xem tất cả →</Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {jars.slice(0, 4).map((jar) => (
              <JarCard
                key={jar.id}
                name={jar.name}
                icon={jar.icon}
                color={jar.color}
                balance={parseFloat(jar.balance)}
                percentage={parseFloat(jar.percentage)}
                warningThreshold={parseFloat(jar.warningThreshold)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Goals */}
      {goals.length > 0 && (
        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Mục tiêu tiết kiệm</h2>
            <Link href="/goals" className="text-xs text-primary">Xem tất cả →</Link>
          </div>
          <div className="space-y-3">
            {goals.map((goal) => {
              const progress = (parseFloat(goal.currentAmount) / parseFloat(goal.targetAmount)) * 100;
              return (
                <div key={goal.id} className="rounded-lg border border-border p-3">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">{goal.name}</span>
                    <span className="text-xs text-muted-foreground">{progress.toFixed(0)}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Recent transactions */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Giao dịch gần đây</h2>
          <Link href="/transactions" className="text-xs text-primary">Xem tất cả →</Link>
        </div>
        {recentTransactions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">Chưa có giao dịch nào</p>
        ) : (
          <div className="space-y-2">
            {recentTransactions.map((t) => (
              <div key={t.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <p className="text-sm font-medium">{t.description || t.category}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(t.transactionDate).toLocaleDateString("vi-VN")}
                  </p>
                </div>
                <p className={`text-sm font-semibold ${t.type === "expense" ? "text-red-600" : "text-green-600"}`}>
                  {t.type === "expense" ? "-" : "+"}{formatCurrency(parseFloat(t.amount))}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      <QuickAddButton />
    </div>
  );
}
