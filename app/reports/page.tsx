"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { DEFAULT_CATEGORIES } from "@/lib/constants";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

type CategoryData = { category: string; total: number; count: number };
type TrendData = { month: string; income: number; expense: number };
type Period = "day" | "week" | "month" | "year";

export default function ReportsPage() {
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [period, setPeriod] = useState<Period>("month");
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const [catRes, trendRes] = await Promise.all([
      fetch(`/api/reports/category-breakdown?period=${period}`),
      fetch("/api/reports/trend?months=6"),
    ]);

    if (catRes.ok) setCategoryData(await catRes.json());
    if (trendRes.ok) setTrendData(await trendRes.json());
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [period]);

  const getCategoryColor = (name: string) =>
    DEFAULT_CATEGORIES.find((c) => c.name === name)?.color ?? "#a3a3a3";

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("vi-VN", { notation: "compact", compactDisplay: "short" }).format(n);

  const totalExpense = categoryData.reduce((sum, c) => sum + Number(c.total), 0);

  const periodLabels: Record<Period, string> = {
    day: "Hôm nay",
    week: "Tuần này",
    month: "Tháng này",
    year: "Năm nay",
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <h1 className="text-xl font-bold mb-4">Báo cáo</h1>

      {/* Period filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {(Object.keys(periodLabels) as Period[]).map((p) => (
          <Button
            key={p}
            variant={period === p ? "default" : "outline"}
            size="sm"
            onClick={() => setPeriod(p)}
          >
            {periodLabels[p]}
          </Button>
        ))}
      </div>

      {/* Pie chart - Category breakdown */}
      <section className="mb-8">
        <h2 className="font-semibold mb-3">Chi tiêu theo danh mục</h2>
        {categoryData.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">Chưa có dữ liệu</p>
        ) : (
          <>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="total"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ category, percent }) =>
                      `${category} ${(percent * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                  >
                    {categoryData.map((entry) => (
                      <Cell key={entry.category} fill={getCategoryColor(entry.category)} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Category list */}
            <div className="space-y-2 mt-4">
              {categoryData.map((cat) => (
                <div key={cat.category} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: getCategoryColor(cat.category) }}
                    />
                    <span>{cat.category}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-medium">{formatCurrency(Number(cat.total))}</span>
                    <span className="text-muted-foreground ml-2">
                      ({((Number(cat.total) / totalExpense) * 100).toFixed(0)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      {/* Line chart - Trend */}
      <section>
        <h2 className="font-semibold mb-3">Xu hướng 6 tháng</h2>
        {trendData.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">Chưa có dữ liệu</p>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={formatCurrency} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
                <Line type="monotone" dataKey="income" stroke="#10b981" name="Thu nhập" strokeWidth={2} />
                <Line type="monotone" dataKey="expense" stroke="#ef4444" name="Chi tiêu" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>
    </div>
  );
}
