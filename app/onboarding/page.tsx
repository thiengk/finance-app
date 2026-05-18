"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const STEPS = [
  {
    title: "Chào mừng! 👋",
    description: "Ứng dụng giúp bạn theo dõi chi tiêu, quản lý hũ tài chính, và lập kế hoạch tiết kiệm một cách dễ dàng.",
    emoji: "💰",
  },
  {
    title: "Hũ tài chính 🏺",
    description: "Phân bổ thu nhập vào các hũ theo tỷ lệ. Ví dụ: 50% Chi tiêu, 20% Tiết kiệm, 10% Giáo dục...",
    emoji: "📊",
  },
  {
    title: "Bắt đầu thôi! 🚀",
    description: "Tạo mục tiêu tiết kiệm đầu tiên và bắt đầu ghi chép chi tiêu ngay hôm nay.",
    emoji: "🎯",
  },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [goalName, setGoalName] = useState("");
  const [goalAmount, setGoalAmount] = useState("");
  const router = useRouter();

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      handleFinish();
    }
  };

  const handleSkip = () => {
    router.push("/");
  };

  const handleFinish = async () => {
    // Optionally create first goal
    if (goalName && goalAmount) {
      const deadline = new Date();
      deadline.setMonth(deadline.getMonth() + 6);

      await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: goalName,
          targetAmount: parseFloat(goalAmount),
          deadline: deadline.toISOString().split("T")[0],
        }),
      });
    }

    router.push("/");
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-background">
      <div className="w-full max-w-sm">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-8">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-2 w-2 rounded-full transition-colors ${
                i === step ? "bg-primary" : "bg-secondary"
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="text-center mb-8">
          <span className="text-5xl mb-4 block">{STEPS[step].emoji}</span>
          <h1 className="text-2xl font-bold mb-2">{STEPS[step].title}</h1>
          <p className="text-muted-foreground">{STEPS[step].description}</p>
        </div>

        {/* Step 3: Optional goal creation */}
        {step === 2 && (
          <div className="space-y-3 mb-6">
            <Input
              placeholder="Tên mục tiêu (VD: Du lịch Đà Lạt)"
              value={goalName}
              onChange={(e) => setGoalName(e.target.value)}
            />
            <Input
              type="number"
              placeholder="Số tiền mục tiêu (VNĐ)"
              value={goalAmount}
              onChange={(e) => setGoalAmount(e.target.value)}
            />
            <p className="text-xs text-muted-foreground text-center">
              Bạn có thể bỏ qua và tạo sau
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <Button onClick={handleNext} className="w-full">
            {step === STEPS.length - 1 ? "Bắt đầu" : "Tiếp tục"}
          </Button>
          <Button onClick={handleSkip} variant="ghost" className="w-full">
            Bỏ qua
          </Button>
        </div>
      </div>
    </main>
  );
}
