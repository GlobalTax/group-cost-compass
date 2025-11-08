import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createRevenueItem,
  updateRevenueItem,
  deleteRevenueItem,
  createRevenueAllocation,
  bulkCreateRevenueAllocations,
  deleteRevenueAllocation,
  bulkApplyAllocations,
  fetchRevenueTotalAmount,
  deleteRevenueAllocations,
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
    mutationFn: async ({ 
      revenueItemIds, 
      templateId, 
      customAllocations,
      mode = 'add'
    }: { 
      revenueItemIds: string[]; 
      templateId?: string; 
      customAllocations?: any[];
      mode?: 'replace' | 'add';
    }) => {
      if (templateId) {
        const promises = revenueItemIds.map(async (itemId) => {
          const totalAmount = await fetchRevenueTotalAmount(itemId);
          return applyTemplateToRevenue(templateId, itemId, totalAmount);
        });
        await Promise.all(promises);
      } else if (customAllocations) {
        if (mode === 'replace') {
          await deleteRevenueAllocations(revenueItemIds);
        }
        
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

  const bulkDeleteRevenues = useMutation({
    mutationFn: async (revenueItemIds: string[]) => {
      const promises = revenueItemIds.map(id => deleteRevenueItem(id));
      await Promise.all(promises);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["revenues"] });
      queryClient.invalidateQueries({ queryKey: ["revenue-analytics"] });
      toast.success(`${variables.length} ${variables.length === 1 ? 'ingreso eliminado' : 'ingresos eliminados'}`);
    },
    onError: (error: Error) => {
      toast.error(`Error al eliminar: ${error.message}`);
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
    bulkDeleteRevenues,
  };
};
