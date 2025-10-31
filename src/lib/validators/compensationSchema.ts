import { z } from "zod";

export const compensationBandSchema = z.object({
  level: z.string().min(1, "Nivel requerido"),
  department: z.string().min(1, "Departamento requerido"),
  min_salary: z.coerce.number().min(0, "El salario mínimo debe ser mayor a 0"),
  max_salary: z.coerce.number().min(0, "El salario máximo debe ser mayor a 0"),
  target_bonus_pct: z.coerce.number().min(0).max(200, "El bonus objetivo debe estar entre 0 y 200%"),
  max_bonus_pct: z.coerce.number().min(0).max(300, "El bonus máximo debe estar entre 0 y 300%"),
  success_fee_base_pct: z.coerce.number().min(0).max(100, "El % de success fee debe estar entre 0 y 100%"),
  description: z.string().optional(),
  is_active: z.boolean().default(true),
}).refine(
  (data) => data.max_salary >= data.min_salary,
  {
    message: "El salario máximo debe ser mayor o igual al mínimo",
    path: ["max_salary"],
  }
).refine(
  (data) => data.max_bonus_pct >= data.target_bonus_pct,
  {
    message: "El bonus máximo debe ser mayor o igual al objetivo",
    path: ["max_bonus_pct"],
  }
);

export const dealSchema = z.object({
  deal_name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  client_name: z.string().optional(),
  deal_type: z.string().optional(),
  status: z.enum(["pipeline", "active", "closed", "lost"]),
  total_fees: z.coerce.number().min(0, "Los honorarios deben ser mayores a 0"),
  success_fee_pool: z.coerce.number().min(0, "El success fee pool debe ser mayor a 0"),
  close_date: z.string().optional().nullable(),
  fiscal_year: z.coerce.number().int().min(2020).max(2100).optional().nullable(),
  lead_partner_id: z.string().uuid().optional().nullable(),
  notes: z.string().optional(),
});

export const dealParticipantSchema = z.object({
  deal_id: z.string().uuid("ID de deal inválido"),
  employee_id: z.string().uuid("ID de empleado inválido"),
  role_in_deal: z.string().optional(),
  participation_pct: z.coerce.number().min(0).max(100, "El % debe estar entre 0 y 100"),
});

export const bonusPaymentSchema = z.object({
  employee_id: z.string().uuid("ID de empleado inválido"),
  payment_date: z.string().min(1, "Fecha de pago requerida"),
  fiscal_year: z.coerce.number().int().min(2020).max(2100, "Año fiscal inválido"),
  bonus_type: z.enum(["performance", "success_fee", "extra"], {
    errorMap: () => ({ message: "Tipo de bonus inválido" }),
  }),
  amount: z.coerce.number().min(0, "El monto debe ser mayor a 0"),
  deal_id: z.string().uuid().optional().nullable(),
  notes: z.string().optional(),
});

export const performanceReviewSchema = z.object({
  employee_id: z.string().min(1, "Empleado requerido"),
  review_period: z.string().min(1, "Período de evaluación requerido"),
  reviewer_id: z.string().optional(),
  performance_score: z.coerce.number().min(0).max(10, "La puntuación debe estar entre 0 y 10").optional(),
  bonus_multiplier: z.coerce.number().min(0).max(2, "El multiplicador debe estar entre 0 y 2").default(1.0),
  strengths: z.string().optional(),
  areas_improvement: z.string().optional(),
  review_date: z.string().optional(),
});

export type CompensationBandFormData = z.infer<typeof compensationBandSchema>;
export type DealFormData = z.infer<typeof dealSchema>;
export type DealParticipantFormData = z.infer<typeof dealParticipantSchema>;
export type BonusPaymentFormData = z.infer<typeof bonusPaymentSchema>;
export type PerformanceReviewFormData = z.infer<typeof performanceReviewSchema>;
