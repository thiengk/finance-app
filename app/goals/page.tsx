"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { GoalCard } from "@/components/goal-card";
import { createGoalSchema, type CreateGoalInput } from "@/lib/validations";

type Goal = {
  id: string;
  name: string;
  targetAmount: string;
  currentAmount: string;
  deadline: string;
  monthlyTarget: string | null;
  status: string;
};

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<CreateGoalInput>({
    resolver: zodResolver(createGoalSchema),
  });

  const watchTarget = watch("targetAmount");
  const watchDeadline = watch("deadline");

  const fetchGoals = async () => {
    setLoading(true);
    const res = await fetch("/api/goals");
    if (res.ok) setGoals(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchGoals(); }, []);

  const onSubmit = async (data: CreateGoalInput) => {
    const res = await fetch("/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      reset();
      setShowForm(false);
      fetchGoals();
    }
  };

  // Calculate preview monthly target
  const previewMonthly = (() => {
    if (!watchTarget || !watchDeadline) return null;
    const deadline = new Date(watchDeadline);
    const now = new Date();
    const months = Math.max(1, (deadline.getFullYear() - now.getFullYear()) * 12 + (deadline.getMonth() - now.getMonth()));
    return watchTarget / months;
  })();

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Mục tiêu tiết kiệm</h1>
        <Button onClick={() => setShowForm(true)} size="sm">+ Tạo mục tiêu</Button>
      </div>

      {loading ? (
        <p className="text-center text-muted-foreground py-8">Đang tải...</p>
      ) : goals.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">Chưa có mục tiêu nào. Tạo mục tiêu đầu tiên!</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              id={goal.id}
              name={goal.name}
              targetAmount={parseFloat(goal.targetAmount)}
              currentAmount={parseFloat(goal.currentAmount)}
              deadline={goal.deadline}
              monthlyTarget={goal.monthlyTarget ? parseFloat(goal.monthlyTarget) : null}
              status={goal.status}
              onDeposit={fetchGoals}
            />
          ))}
        </div>
      )}

      {/* Create Goal Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tạo mục tiêu mới</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Input placeholder="Tên mục tiêu (VD: Mua laptop)" {...register("name")} />
              {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div>
              <Input type="number" placeholder="Số tiền mục tiêu (VNĐ)" {...register("targetAmount", { valueAsNumber: true })} />
              {errors.targetAmount && <p className="mt-1 text-xs text-destructive">{errors.targetAmount.message}</p>}
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Thời hạn</label>
              <Input type="date" {...register("deadline")} />
              {errors.deadline && <p className="mt-1 text-xs text-destructive">{errors.deadline.message}</p>}
            </div>

            {previewMonthly && (
              <p className="text-sm text-primary font-medium">
                → Cần tiết kiệm {formatCurrency(previewMonthly)}/tháng
              </p>
            )}

            <Button type="submit" className="w-full">Tạo mục tiêu</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
