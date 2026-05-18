"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface GoalCardProps {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  monthlyTarget: number | null;
  status: string;
  onDeposit?: () => void;
}

export function GoalCard({
  id,
  name,
  targetAmount,
  currentAmount,
  deadline,
  monthlyTarget,
  status,
  onDeposit,
}: GoalCardProps) {
  const [showDeposit, setShowDeposit] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const progress = Math.min(100, (currentAmount / targetAmount) * 100);
  const isCompleted = status === "completed";

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);

  const handleDeposit = async () => {
    const amount = parseFloat(depositAmount);
    if (amount <= 0) return;

    setIsSubmitting(true);
    const res = await fetch(`/api/goals/${id}/deposit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount }),
    });

    if (res.ok) {
      setDepositAmount("");
      setShowDeposit(false);
      onDeposit?.();
    }
    setIsSubmitting(false);
  };

  return (
    <>
      <div className="rounded-xl border border-border p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium">{name}</h3>
          {isCompleted && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
              🎉 Hoàn thành!
            </span>
          )}
        </div>

        {/* Progress ring (simplified as bar) */}
        <div className="relative mb-3">
          <div className="h-3 rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-right text-xs text-muted-foreground mt-1">
            {progress.toFixed(0)}%
          </p>
        </div>

        <div className="flex justify-between text-sm mb-2">
          <span className="text-muted-foreground">Hiện tại</span>
          <span className="font-medium">{formatCurrency(currentAmount)}</span>
        </div>
        <div className="flex justify-between text-sm mb-2">
          <span className="text-muted-foreground">Mục tiêu</span>
          <span className="font-medium">{formatCurrency(targetAmount)}</span>
        </div>
        <div className="flex justify-between text-sm mb-2">
          <span className="text-muted-foreground">Hạn</span>
          <span>{new Date(deadline).toLocaleDateString("vi-VN")}</span>
        </div>
        {monthlyTarget && (
          <div className="flex justify-between text-sm mb-3">
            <span className="text-muted-foreground">Cần/tháng</span>
            <span className="text-primary font-medium">{formatCurrency(monthlyTarget)}</span>
          </div>
        )}

        {!isCompleted && (
          <Button onClick={() => setShowDeposit(true)} className="w-full" size="sm">
            Nạp tiền
          </Button>
        )}
      </div>

      <Dialog open={showDeposit} onOpenChange={setShowDeposit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nạp tiền vào "{name}"</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              type="number"
              placeholder="Số tiền"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              autoFocus
            />
            <Button onClick={handleDeposit} className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Đang nạp..." : "Xác nhận"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
