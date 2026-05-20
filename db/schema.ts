import {
    pgTable,
    uuid,
    text,
    decimal,
    timestamp,
    boolean,
    jsonb,
    date,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ==================== USERS ====================
export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull().unique(),
    name: text("name").notNull(),
    password: text("password"),
    avatarUrl: text("avatar_url"),
    preferences: jsonb("preferences").default({}),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
    transactions: many(transactions),
    jars: many(jars),
    goals: many(goals),
    achievements: many(achievements),
    categories: many(categories),
}));

// ==================== CATEGORIES ====================
export const categories = pgTable("categories", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    icon: text("icon").notNull(),
    color: text("color").notNull(),
    isDefault: boolean("is_default").default(false).notNull(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const categoriesRelations = relations(categories, ({ one }) => ({
    user: one(users, {
        fields: [categories.userId],
        references: [users.id],
    }),
}));

// ==================== JARS ====================
export const jars = pgTable("jars", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
        .references(() => users.id, { onDelete: "cascade" })
        .notNull(),
    name: text("name").notNull(),
    percentage: decimal("percentage", { precision: 5, scale: 2 }).notNull(),
    balance: decimal("balance", { precision: 12, scale: 2 })
        .default("0")
        .notNull(),
    warningThreshold: decimal("warning_threshold", { precision: 5, scale: 2 })
        .default("10")
        .notNull(),
    color: text("color").notNull(),
    icon: text("icon").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const jarsRelations = relations(jars, ({ one, many }) => ({
    user: one(users, {
        fields: [jars.userId],
        references: [users.id],
    }),
    transactions: many(transactions),
}));

// ==================== TRANSACTIONS ====================
export const transactions = pgTable("transactions", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
        .references(() => users.id, { onDelete: "cascade" })
        .notNull(),
    jarId: uuid("jar_id").references(() => jars.id, { onDelete: "set null" }),
    amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
    type: text("type", { enum: ["income", "expense"] }).notNull(),
    category: text("category").notNull(),
    description: text("description"),
    transactionDate: timestamp("transaction_date").notNull(),
    isSynced: boolean("is_synced").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const transactionsRelations = relations(transactions, ({ one }) => ({
    user: one(users, {
        fields: [transactions.userId],
        references: [users.id],
    }),
    jar: one(jars, {
        fields: [transactions.jarId],
        references: [jars.id],
    }),
}));

// ==================== GOALS ====================
export const goals = pgTable("goals", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
        .references(() => users.id, { onDelete: "cascade" })
        .notNull(),
    name: text("name").notNull(),
    targetAmount: decimal("target_amount", { precision: 12, scale: 2 }).notNull(),
    currentAmount: decimal("current_amount", { precision: 12, scale: 2 })
        .default("0")
        .notNull(),
    deadline: date("deadline").notNull(),
    status: text("status", { enum: ["active", "completed", "cancelled"] })
        .default("active")
        .notNull(),
    monthlyTarget: decimal("monthly_target", { precision: 12, scale: 2 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const goalsRelations = relations(goals, ({ one }) => ({
    user: one(users, {
        fields: [goals.userId],
        references: [users.id],
    }),
}));

// ==================== ACHIEVEMENTS ====================
export const achievements = pgTable("achievements", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
        .references(() => users.id, { onDelete: "cascade" })
        .notNull(),
    type: text("type").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    earnedAt: timestamp("earned_at").defaultNow().notNull(),
});

export const achievementsRelations = relations(achievements, ({ one }) => ({
    user: one(users, {
        fields: [achievements.userId],
        references: [users.id],
    }),
}));

// ==================== NEXTAUTH TABLES ====================
export const accounts = pgTable("accounts", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
        .references(() => users.id, { onDelete: "cascade" })
        .notNull(),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refreshToken: text("refresh_token"),
    accessToken: text("access_token"),
    expiresAt: timestamp("expires_at"),
    tokenType: text("token_type"),
    scope: text("scope"),
    idToken: text("id_token"),
    sessionState: text("session_state"),
});

export const sessions = pgTable("sessions", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
        .references(() => users.id, { onDelete: "cascade" })
        .notNull(),
    sessionToken: text("session_token").notNull().unique(),
    expires: timestamp("expires").notNull(),
});

export const verificationTokens = pgTable("verification_tokens", {
    identifier: text("identifier").notNull(),
    token: text("token").notNull().unique(),
    expires: timestamp("expires").notNull(),
});
