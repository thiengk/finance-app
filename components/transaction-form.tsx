"use client";

import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createTransactionSchema, type CreateTransactionInput } from "@/lib/validations";
import { DEFAULT_CATEGORIES } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface TransactionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function TransactionForm({ open, onOpenChange, onSuccess }: TransactionFormProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [aiSuggestion, setAiSuggestion] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CreateTransactionInput>({
    resolver: zodResolver(createTransactionSchema),
    defaultValues: {
      type: "expense",
      category: "",
    },
  });

  // AI categorization with 2s timeout
  const handleDescriptionBlur = useCallback(async (e: React.FocusEvent<HTMLInputElement>) => {
    const description = e.target.value.trim();
    if (!description || selectedCategory) return;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);

    try {
      const res = await fetch("/api/ai/categorize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (res.ok) {
        const { category } = await res.json();
        if (category && !selectedCategory) {
          setAiSuggestion(category);
        }
      }
    } catch {
      // Timeout or error — user picks manually
    }
  }, [selectedCategory]);

  const onSubmit = async (data: CreateTransactionInput) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        reset();
        setSelectedCategory("");
        onOpenChange(false);
        onSuccess?.();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCategorySelect = (categoryName: string) => {
    setSelectedCategory(categoryName);
    setAiSuggestion("");
    setValue("category", categoryName);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ghi chi tiêu</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Amount input */}
          <div>
            <Input
              type="number"
              placeholder="Số tiền (VNĐ)"
              className="text-lg h-12"
              {...register("amount", { valueAsNumber: true })}
              autoFocus
            />
            {errors.amount && (
              <p className="mt-1 text-xs text-destructive">{errors.amount.message}</p>
            )}
          </div>

          {/* Category grid */}
          <div>
            <p className="text-sm text-muted-foreground mb-2">Danh mục</p>
            <div className="grid grid-cols-4 gap-2">
              {DEFAULT_CATEGORIES.map((cat) => (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => handleCategorySelect(cat.name)}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-lg p-2 text-xs transition-colors",
                    selectedCategory === cat.name
                      ? "bg-primary/10 ring-2 ring-primary"
                      : "hover:bg-secondary"
                  )}
                >
                  <span className="text-2xl">{cat.icon}</span>
                  <span className="truncate w-full text-center">{cat.name}</span>
                </button>
              ))}
            </div>
            {errors.category && (
              <p className="mt-1 text-xs text-destructive">{errors.category.message}</p>
            )}
          </div>

          {/* Description (optional) */}
          <Input
            placeholder="Ghi chú (tùy chọn)"
            {...register("description")}
            onBlur={handleDescriptionBlur}
          />

          {/* AI suggestion */}
          {aiSuggestion && !selectedCategory && (
            <button
              type="button"
              onClick={() => handleCategorySelect(aiSuggestion)}
              className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs text-primary transition-colors hover:bg-primary/20"
            >
              ✨ AI gợi ý: {aiSuggestion} — Nhấn để chọn
            </button>
          )}

          {/* Type toggle */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setValue("type", "expense")}
            >
              Chi tiêu
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setValue("type", "income")}
            >
              Thu nhập
            </Button>
          </div>

          {/* Submit */}
          <Button type="submit" className="w-full h-12" disabled={isSubmitting}>
            {isSubmitting ? "Đang lưu..." : "Lưu"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
