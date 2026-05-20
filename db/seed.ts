import "dotenv/config";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { categories } from "./schema";

const DEFAULT_CATEGORIES = [
  { name: "Ăn uống", icon: "🍜", color: "#f97316", isDefault: true },
  { name: "Di chuyển", icon: "🚗", color: "#3b82f6", isDefault: true },
  { name: "Mua sắm", icon: "🛍️", color: "#ec4899", isDefault: true },
  { name: "Giải trí", icon: "🎮", color: "#8b5cf6", isDefault: true },
  { name: "Hóa đơn", icon: "📄", color: "#6b7280", isDefault: true },
  { name: "Sức khỏe", icon: "💊", color: "#10b981", isDefault: true },
  { name: "Giáo dục", icon: "📚", color: "#0ea5e9", isDefault: true },
  { name: "Khác", icon: "📌", color: "#a3a3a3", isDefault: true },
];

async function seed() {
  const client = postgres(process.env.DATABASE_URL!);
  const db = drizzle(client);

  console.log("Seeding default categories...");

  await db.insert(categories).values(
    DEFAULT_CATEGORIES.map((cat) => ({
      name: cat.name,
      icon: cat.icon,
      color: cat.color,
      isDefault: cat.isDefault,
      userId: null,
    }))
  );

  console.log("Seed completed!");
  await client.end();
}

seed().catch(console.error);
