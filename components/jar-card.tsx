"use client";

import { cn } from "@/lib/utils";

interface JarCardProps {
  name: string;
  icon: string;
  color: string;
  balance: number;
  percentage: number;
  warningThreshold: number;
  initialBalance?: number;
}

export function JarCard({
  name,
  icon,
  color,
  balance,
  percentage,
  warningThreshold,
}: JarCardProps) {
  const isLow = percentage > 0 && balance <= 0;
  const usagePercent = 100; // Will be calculated based on allocated amount

  return (
    <div
      className={cn(
        "rounded-xl border p-4 transition-colors",
        isLow ? "border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950" : "border-border"
      )}
    >
      <div className="flex items-center gap-3 mb-3">
        <span
          className="flex h-10 w-10 items-center justify-center rounded-lg text-xl"
          style={{ backgroundColor: `${color}20` }}
        >
          {icon}
        </span>
        <div className="flex-1">
          <p className="font-medium text-sm">{name}</p>
          <p className="text-xs text-muted-foreground">{percentage}%</p>
        </div>
      </div>

      <p className="text-lg font-bold">
        {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(balance)}
      </p>

      {/* Progress bar */}
      <div className="mt-2 h-2 rounded-full bg-secondary overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${Math.min(100, Math.max(0, balance > 0 ? 100 : 0))}%`,
            backgroundColor: color,
          }}
        />
      </div>

      {isLow && (
        <p className="mt-2 text-xs text-red-600 font-medium">⚠️ Hũ sắp hết!</p>
      )}
    </div>
  );
}
