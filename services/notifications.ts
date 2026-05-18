// Web Push notification utilities
// Note: Full push notification requires VAPID keys and service worker registration
// This provides the server-side logic for determining when to send notifications

import { db } from "@/db";
import { jars, goals, transactions } from "@/db/schema";
import { eq, and, gte, sql } from "drizzle-orm";

export interface NotificationPayload {
  title: string;
  body: string;
  type: "reminder" | "warning" | "achievement" | "goal";
}

// Check if user hasn't logged any transaction in 2 days
export async function checkInactivityReminder(userId: string): Promise<NotificationPayload | null> {
  const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);

  const recent = await db
    .select({ id: transactions.id })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        gte(transactions.createdAt, twoDaysAgo)
      )
    )
    .limit(1);

  if (recent.length === 0) {
    return {
      title: "Nhớ ghi chép nhé! 📝",
      body: "Bạn chưa ghi chi tiêu 2 ngày rồi. Mở app ghi lại nào!",
      type: "reminder",
    };
  }
  return null;
}

// Check jars with low balance
export async function checkLowJarWarnings(userId: string): Promise<NotificationPayload[]> {
  const userJars = await db
    .select()
    .from(jars)
    .where(eq(jars.userId, userId));

  const warnings: NotificationPayload[] = [];

  for (const jar of userJars) {
    const balance = parseFloat(jar.balance);
    const threshold = parseFloat(jar.warningThreshold);
    // If balance is below threshold percentage of some reference (simplified: below 0 or very low)
    if (balance <= 0) {
      warnings.push({
        title: `Hũ "${jar.name}" đã hết! ⚠️`,
        body: `Số dư hũ ${jar.name} đã về 0. Cân nhắc phân bổ thêm.`,
        type: "warning",
      });
    }
  }

  return warnings;
}

// Check goals that need deposits
export async function checkGoalReminders(userId: string): Promise<NotificationPayload[]> {
  const activeGoals = await db
    .select()
    .from(goals)
    .where(and(eq(goals.userId, userId), eq(goals.status, "active")));

  const reminders: NotificationPayload[] = [];
  const now = new Date();

  for (const goal of activeGoals) {
    const deadline = new Date(goal.deadline);
    const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const progress = parseFloat(goal.currentAmount) / parseFloat(goal.targetAmount);

    if (daysLeft <= 30 && progress < 0.8) {
      reminders.push({
        title: `Mục tiêu "${goal.name}" sắp đến hạn 🎯`,
        body: `Còn ${daysLeft} ngày, đã đạt ${(progress * 100).toFixed(0)}%. Nạp thêm nhé!`,
        type: "goal",
      });
    }
  }

  return reminders;
}
