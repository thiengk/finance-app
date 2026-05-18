"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { JarCard } from "@/components/jar-card";
import { createJarSchema, type CreateJarInput } from "@/lib/validations";

type Jar = {
  id: string;
  name: string;
  icon: string;
  color: string;
  balance: string;
  percentage: string;
  warningThreshold: string;
};

const JAR_ICONS = ["💰", "🏠", "🎓", "🎮", "✈️", "🚗", "💊", "👗", "🍜", "📱"];
const JAR_COLORS = ["#f97316", "#3b82f6", "#ec4899", "#8b5cf6", "#10b981", "#eab308", "#06b6d4", "#ef4444"];

export default function JarsPage() {
  const [jars, setJars] = useState<Jar[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedIcon, setSelectedIcon] = useState("💰");
  const [selectedColor, setSelectedColor] = useState("#3b82f6");

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<CreateJarInput>({
    resolver: zodResolver(createJarSchema),
    defaultValues: { icon: "💰", color: "#3b82f6", warningThreshold: 10 },
  });

  const fetchJars = async () => {
    setLoading(true);
    const res = await fetch("/api/jars");
    if (res.ok) setJars(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchJars(); }, []);

  const onSubmit = async (data: CreateJarInput) => {
    const res = await fetch("/api/jars", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      reset();
      setShowForm(false);
      fetchJars();
    }
  };

  const totalPercentage = jars.reduce((sum, j) => sum + parseFloat(j.percentage), 0);

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Hũ tài chính</h1>
        <Button onClick={() => setShowForm(true)} size="sm">+ Tạo hũ</Button>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        Đã phân bổ: {totalPercentage}% / 100%
      </p>

      {loading ? (
        <p className="text-center text-muted-foreground py-8">Đang tải...</p>
      ) : jars.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">Chưa có hũ nào. Tạo hũ đầu tiên!</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {jars.map((jar) => (
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
      )}

      {/* Create Jar Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tạo hũ mới</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Input placeholder="Tên hũ" {...register("name")} />
              {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div>
              <Input type="number" placeholder="Tỷ lệ (%)" {...register("percentage", { valueAsNumber: true })} />
              {errors.percentage && <p className="mt-1 text-xs text-destructive">{errors.percentage.message}</p>}
              <p className="mt-1 text-xs text-muted-foreground">Còn lại: {100 - totalPercentage}%</p>
            </div>

            {/* Icon selector */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">Icon</p>
              <div className="flex flex-wrap gap-2">
                {JAR_ICONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => { setSelectedIcon(icon); setValue("icon", icon); }}
                    className={`h-10 w-10 rounded-lg text-xl flex items-center justify-center ${selectedIcon === icon ? "ring-2 ring-primary bg-primary/10" : "hover:bg-secondary"}`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            {/* Color selector */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">Màu</p>
              <div className="flex flex-wrap gap-2">
                {JAR_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => { setSelectedColor(color); setValue("color", color); }}
                    className={`h-8 w-8 rounded-full ${selectedColor === color ? "ring-2 ring-offset-2 ring-primary" : ""}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <Button type="submit" className="w-full">Tạo hũ</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
