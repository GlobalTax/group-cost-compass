import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  createRevenueItem,
  updateRevenueItem,
  deleteRevenueItem,
  createRevenueAllocation,
  bulkCreateRevenueAllocations,
  deleteRevenueAllocation,
  bulkApplyAllocations,
} from "@/lib/supabase/repositories/revenue.repo";
import { applyTemplateToRevenue } from "@/lib/supabase/repositories/allocationTemplates.repo";

export const useRevenueManagement = () => {
  const queryClient = useQueryClient();

  const createRevenue = useMutation({
    mutationFn: createRevenueItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["revenues"] });
      queryClient.invalidateQueries({ queryKey: ["revenue-analytics"] });
      toast.success("Ingreso creado correctamente");
    },
    onError: (error: Error) => {
      toast.error(`Error al crear ingreso: ${error.message}`);
    },
  });

  const updateRevenue = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateRevenueItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["revenues"] });
      queryClient.invalidateQueries({ queryKey: ["revenue-analytics"] });
      toast.success("Ingreso actualizado");
    },
    onError: (error: Error) => {
      toast.error(`Error al actualizar: ${error.message}`);
    },
  });

  const deleteRevenue = useMutation({
    mutationFn: deleteRevenueItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["revenues"] });
      queryClient.invalidateQueries({ queryKey: ["revenue-analytics"] });
      toast.success("Ingreso eliminado");
    },
    onError: (error: Error) => {
      toast.error(`Error al eliminar: ${error.message}`);
    },
  });

  const addAllocation = useMutation({
    mutationFn: createRevenueAllocation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["revenues"] });
      toast.success("Asignación agregada");
    },
    onError: (error: Error) => {
      toast.error(`Error al asignar: ${error.message}`);
    },
  });

  const bulkAddAllocations = useMutation({
    mutationFn: bulkCreateRevenueAllocations,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["revenues"] });
      toast.success("Asignaciones creadas");
    },
    onError: (error: Error) => {
      toast.error(`Error al crear asignaciones: ${error.message}`);
    },
  });

  const removeAllocation = useMutation({
    mutationFn: deleteRevenueAllocation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["revenues"] });
      toast.success("Asignación eliminada");
    },
    onError: (error: Error) => {
      toast.error(`Error al eliminar: ${error.message}`);
    },
  });

  const bulkAssignRevenues = useMutation({
    mutationFn: async ({ revenueItemIds, templateId, customAllocations }: { revenueItemIds: string[]; templateId?: string; customAllocations?: any[] }) => {
      if (templateId) {
        const promises = revenueItemIds.map(async (itemId) => {
          const { data, error } = await supabase.from("revenue_items").select("total_amount").eq("id", itemId).single();
          if (error) throw error;
          return applyTemplateToRevenue(templateId, itemId, data.total_amount);
        });
        await Promise.all(promises);
      } else if (customAllocations) {
        await bulkApplyAllocations(revenueItemIds, customAllocations);
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["revenues"] });
      toast.success(`Asignaciones aplicadas a ${variables.revenueItemIds.length} items`);
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  return {
    createRevenue,
    updateRevenue,
    deleteRevenue,
    addAllocation,
    bulkAddAllocations,
    removeAllocation,
    bulkAssignRevenues,
  };
};
