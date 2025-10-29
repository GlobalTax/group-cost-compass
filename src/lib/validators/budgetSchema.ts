import { z } from "zod";

export const budgetPeriodSchema = z.object({
  period: z.string().min(1, "El período es requerido"),
  company_id: z.string().uuid().optional().nullable(),
  status: z.enum(['draft', 'approved', 'closed']).default('draft'),
  notes: z.string().max(1000).optional().nullable(),
});

export const budgetIncomeSchema = z.object({
  budget_period_id: z.string().uuid("ID de período requerido"),
  category: z.enum(['billing', 'project', 'subsidy', 'other'], {
    required_error: "La categoría es requerida",
  }),
  subcategory: z.string().max(100).optional().nullable(),
  description: z.string().min(1, "La descripción es obligatoria").max(500),
  budgeted_amount: z.number().nonnegative("El importe debe ser mayor o igual a 0"),
  actual_amount: z.number().optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
});

export const budgetExpenseSchema = z.object({
  budget_period_id: z.string().uuid("ID de período requerido"),
  category: z.enum(['operational', 'investment', 'other'], {
    required_error: "La categoría es requerida",
  }),
  subcategory: z.string().max(100).optional().nullable(),
  description: z.string().min(1, "La descripción es obligatoria").max(500),
  budgeted_amount: z.number().nonnegative("El importe debe ser mayor o igual a 0"),
  actual_amount: z.number().optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
});

export type BudgetPeriodInput = z.infer<typeof budgetPeriodSchema>;
export type BudgetIncomeInput = z.infer<typeof budgetIncomeSchema>;
export type BudgetExpenseInput = z.infer<typeof budgetExpenseSchema>;
