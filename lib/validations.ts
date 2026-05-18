import { z } from "zod";

export const createTransactionSchema = z.object({
  amount: z.number().positive("Số tiền phải lớn hơn 0"),
  type: z.enum(["income", "expense"]),
  category: z.string().min(1, "Vui lòng chọn danh mục"),
  description: z.string().optional(),
  transactionDate: z.string().datetime().optional(),
  jarId: z.string().uuid().optional().nullable(),
});

export const updateTransactionSchema = createTransactionSchema.partial();

export const transactionQuerySchema = z.object({
  period: z.enum(["day", "week", "month", "year"]).optional(),
  category: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

export const createJarSchema = z.object({
  name: z.string().min(1, "Vui lòng nhập tên hũ"),
  percentage: z.number().min(0).max(100, "Tỷ lệ không được vượt quá 100%"),
  color: z.string().min(1),
  icon: z.string().min(1),
  warningThreshold: z.number().min(0).max(100).optional().default(10),
});

export const updateJarSchema = createJarSchema.partial();

export const allocateJarSchema = z.object({
  amount: z.number().positive("Số tiền phải lớn hơn 0"),
});

export const createGoalSchema = z.object({
  name: z.string().min(1, "Vui lòng nhập tên mục tiêu"),
  targetAmount: z.number().positive("Số tiền mục tiêu phải lớn hơn 0"),
  deadline: z.string().min(1, "Vui lòng chọn thời hạn"),
});

export const updateGoalSchema = createGoalSchema.partial();

export const depositGoalSchema = z.object({
  amount: z.number().positive("Số tiền phải lớn hơn 0"),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
export type TransactionQuery = z.infer<typeof transactionQuerySchema>;
export type CreateJarInput = z.infer<typeof createJarSchema>;
export type UpdateJarInput = z.infer<typeof updateJarSchema>;
export type CreateGoalInput = z.infer<typeof createGoalSchema>;
export type DepositGoalInput = z.infer<typeof depositGoalSchema>;
