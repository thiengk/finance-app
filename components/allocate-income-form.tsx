"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Jar {
  id: string;
  name: string;
  icon: string;
  percentage: string;
}

interface AllocateIncomeFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AllocateIncomeForm({ open, onOpenChange, onSuccess }: AllocateIncomeFormProps) {
  const [amount, setAmount] = useState("");
  const [jars, setJars] = useState<Jar[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      fetch("/api/jars").then((r) => r.json()).then(setJars);
    }
  }, [open]);

  const numAmount = parseFloat(amount) || 0;

  const preview = jars.map((jar) => ({
    ...jar,
    allocated: (numAmount * parseFloat(jar.percentage)) / 100,
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (numAmount <= 0) return;

    setIsSubmitting(true);
    const res = await fetch("/api/jars/allocate-income", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: numAmount }),
    });

    if (res.ok) {
      setAmount("");
      onOpenChange(false);
      onSuccess?.();
    }
    setIsSubmitting(false);
  };

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Phân bổ thu nhập</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="number"
            placeholder="Nhập số tiền thu nhập"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="text-lg h-12"
            autoFocus
          />

          {/* Preview allocation */}
          {numAmount > 0 && jars.length > 0 && (
            <div className="space-y-2 rounded-lg bg-secondary p-3">
              <p className="text-sm font-medium mb-2">Phân bổ dự kiến:</p>
              {preview.map((jar) => (
                <div key={jar.id} className="flex items-center justify-between text-sm">
                  <span>{jar.icon} {jar.name} ({jar.percentage}%)</span>
                  <span className="font-medium text-green-600">
                    +{formatCurrency(jar.allocated)}
                  </span>
                </div>
              ))}
            </div>
          )}

          <Button type="submit" className="w-full h-12" disabled={isSubmitting || numAmount <= 0}>
            {isSubmitting ? "Đang phân bổ..." : "Xác nhận phân bổ"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
