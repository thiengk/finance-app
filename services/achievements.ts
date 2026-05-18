import { db } from "@/db";
import { achievements, transactions } from "@/db/schema";
import { eq, and, gte, sql, count } from "drizzle-orm";

export interface AchievementDef {
  type: string;
  title: string;
  description: string;
  check: (userId: string) => Promise<boolean>;
}

const ACHIEVEMENT_DEFINITIONS: AchievementDef[] = [
  {
    type: "first_transaction",
    title: "Bước đầu tiên",
    description: "Ghi chi tiêu đầu tiên",
    check: async (userId) => {
      const result = await db
        .select({ c: count() })
        .from(transactions)
        .where(eq(transactions.userId, userId));
      return (result[0]?.c ?? 0) >= 1;
    },
  },
  {
    type: "streak_7_days",
    title: "Kiên trì 7 ngày",
    description: "Ghi chép 7 ngày liên tiếp",
    check: async (userId) => {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const result = await db
        .select({
          distinctDays: sql<number>`COUNT(DISTINCT DATE(${transactions.transactionDate}))`,
        })
        .from(transactions)
        .where(
          and(
            eq(transactions.userId, userId),
            gte(transactions.transactionDate, sevenDaysAgo)
          )
        );
      return (result[0]?.distinctDays ?? 0) >= 7;
    },
  },
  {
    type: "ten_transactions",
    title: "Thói quen tốt",
    description: "Ghi 10 giao dịch",
    check: async (userId) => {
      const result = await db
        .select({ c: count() })
        .from(transactions)
        .where(eq(transactions.userId, userId));
      return (result[0]?.c ?? 0) >= 10;
    },
  },
  {
    type: "fifty_transactions",
    title: "Chuyên gia ghi chép",
    description: "Ghi 50 giao dịch",
    check: async (userId) => {
      const result = await db
        .select({ c: count() })
        .from(transactions)
        .where(eq(transactions.userId, userId));
      return (result[0]?.c ?? 0) >= 50;
    },
  },
];

export async function checkAndAwardAchievements(userId: string): Promise<string[]> {
  // Get existing achievements
  const existing = await db
    .select({ type: achievements.type })
    .from(achievements)
    .where(eq(achievements.userId, userId));

  const existingTypes = new Set(existing.map((a) => a.type));
  const newAchievements: string[] = [];

  for (const def of ACHIEVEMENT_DEFINITIONS) {
    if (existingTypes.has(def.type)) continue;

    const earned = await def.check(userId);
    if (earned) {
      await db.insert(achievements).values({
        userId,
        type: def.type,
        title: def.title,
        description: def.description,
      });
      newAchievements.push(def.title);
    }
  }

  return newAchievements;
}
