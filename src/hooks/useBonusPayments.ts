import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  fetchBonusPayments,
  createBonusPayment,
  fetchEmployeeTotalBonus,
  fetchBonusSummaryByType,
  deleteBonusPayment,
} from "@/lib/supabase/repositories/bonusPayments.repo";
import type { Database } from "@/integrations/supabase/types";

type BonusPaymentInsert = Database["public"]["Tables"]["bonus_payments"]["Insert"];

export const useBonusPayments = (filters?: {
  employeeId?: string;
  fiscalYear?: number;
}) => {
  return useQuery({
    queryKey: ["bonus-payments", filters],
    queryFn: () => fetchBonusPayments(filters),
    staleTime: 30000,
  });
};

export const useEmployeeTotalBonus = (employeeId?: string, fiscalYear?: number) => {
  return useQuery({
    queryKey: ["employee-total-bonus", employeeId, fiscalYear],
    queryFn: () =>
      employeeId && fiscalYear
        ? fetchEmployeeTotalBonus(employeeId, fiscalYear)
        : 0,
    enabled: !!employeeId && !!fiscalYear,
    staleTime: 30000,
  });
};

export const useBonusSummaryByType = (employeeId?: string, fiscalYear?: number) => {
  return useQuery({
    queryKey: ["bonus-summary-by-type", employeeId, fiscalYear],
    queryFn: () =>
      employeeId && fiscalYear
        ? fetchBonusSummaryByType(employeeId, fiscalYear)
        : {},
    enabled: !!employeeId && !!fiscalYear,
    staleTime: 30000,
  });
};

export const useCreateBonusPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payment: BonusPaymentInsert) => createBonusPayment(payment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bonus-payments"] });
      queryClient.invalidateQueries({ queryKey: ["employee-total-bonus"] });
      queryClient.invalidateQueries({ queryKey: ["bonus-summary-by-type"] });
      toast.success("Bonus registrado correctamente");
    },
    onError: (error: Error) => {
      toast.error("Error al registrar bonus: " + error.message);
    },
  });
};

export const useDeleteBonusPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteBonusPayment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bonus-payments"] });
      queryClient.invalidateQueries({ queryKey: ["employee-total-bonus"] });
      queryClient.invalidateQueries({ queryKey: ["bonus-summary-by-type"] });
      toast.success("Bonus eliminado correctamente");
    },
    onError: (error: Error) => {
      toast.error("Error al eliminar bonus: " + error.message);
    },
  });
};
