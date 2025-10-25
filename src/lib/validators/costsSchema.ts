import { z } from "zod";

export const costSchema = z.object({
  employee_id: z.string().uuid("Empleado requerido"),
  period: z.string().min(1, "Período requerido"),
  bruto: z.number().min(0, "El bruto debe ser positivo"),
  coste_empresa: z.number().min(0, "El coste empresa debe ser positivo"),
});

export type CostFormData = z.infer<typeof costSchema>;

export const validateCost = (data: unknown) => {
  return costSchema.safeParse(data);
};
