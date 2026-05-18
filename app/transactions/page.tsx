"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DEFAULT_CATEGORIES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { QuickAddButton } from "@/components/quick-add-button";

type Transaction = {
  id: string;
  amount: string;
  type: "income" | "expense";
  category: string;
  description: string | null;
  transactionDate: string;
};

type Period = "day" | "week" | "month" | "year";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [period, setPeriod] = useState<Period>("month");
  const [category, setCategory] = useState<string>("");
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("period", period);
    if (category) params.set("category", category);

    const res = await fetch(`/api/transactions?${params}`);
    if (res.ok) {
      const json = await res.json();
      setTransactions(json.data);
      setTotal(json.pagination.total);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTransactions();
  }, [period, category]);

  const filteredTransactions = search
    ? transactions.filter((t) =>
        t.description?.toLowerCase().includes(search.toLowerCase()) ||
        t.category.toLowerCase().includes(search.toLowerCase())
      )
    : transactions;

  const totalExpense = filteredTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const totalIncome = filteredTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const getCategoryIcon = (name: string) =>
    DEFAULT_CATEGORIES.find((c) => c.name === name)?.icon ?? "📌";

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

  const periodLabels: Record<Period, string> = {
    day: "Hôm nay",
    week: "Tuần này",
    month: "Tháng này",
    year: "Năm nay",
  };

  return (
    <div className="min-h-screen bg-background p-4 pb-24 sm:p-6">
      <h1 className="text-xl font-bold mb-4">Lịch sử chi tiêu</h1>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="rounded-lg bg-red-50 p-3 dark:bg-red-950">
          <p className="text-xs text-muted-foreground">Chi tiêu</p>
          <p className="text-lg font-bold text-red-600">{formatCurrency(totalExpense)}</p>
        </div>
        <div className="rounded-lg bg-green-50 p-3 dark:bg-green-950">
          <p className="text-xs text-muted-foreground">Thu nhập</p>
          <p className="text-lg font-bold text-green-600">{formatCurrency(totalIncome)}</p>
        </div>
      </div>

      {/* Period filter */}
      <div className="flex gap-2 mb-4 overflow-x-auto">
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

      {/* Category filter */}
      <div className="flex gap-2 mb-4 overflow-x-auto">
        <Button
          variant={category === "" ? "default" : "outline"}
          size="sm"
          onClick={() => setCategory("")}
        >
          Tất cả
        </Button>
        {DEFAULT_CATEGORIES.map((cat) => (
          <Button
            key={cat.name}
            variant={category === cat.name ? "default" : "outline"}
            size="sm"
            onClick={() => setCategory(cat.name)}
          >
            {cat.icon} {cat.name}
          </Button>
        ))}
      </div>

      {/* Search */}
      <Input
        placeholder="Tìm kiếm theo mô tả..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4"
      />

      {/* Transaction list */}
      {loading ? (
        <p className="text-center text-muted-foreground py-8">Đang tải...</p>
      ) : filteredTransactions.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">Chưa có giao dịch nào</p>
      ) : (
        <div className="space-y-2">
          {filteredTransactions.map((t) => (
            <div
              key={t.id}
              className="flex items-center gap-3 rounded-lg border border-border p-3"
            >
              <span className="text-2xl">{getCategoryIcon(t.category)}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {t.description || t.category}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(t.transactionDate).toLocaleDateString("vi-VN")}
                </p>
              </div>
              <p
                className={cn(
                  "text-sm font-semibold",
                  t.type === "expense" ? "text-red-600" : "text-green-600"
                )}
              >
                {t.type === "expense" ? "-" : "+"}
                {formatCurrency(parseFloat(t.amount))}
              </p>
            </div>
          ))}
        </div>
      )}

      <QuickAddButton />
    </div>
  );
}
