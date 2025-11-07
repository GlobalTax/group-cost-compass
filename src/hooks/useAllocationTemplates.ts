import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  fetchAllocationTemplates,
  fetchAllocationTemplateById,
  createTemplateWithItems,
  updateAllocationTemplate,
  deleteAllocationTemplate,
  applyTemplateToRevenue,
} from "@/lib/supabase/repositories/allocationTemplates.repo";

export const useAllocationTemplates = () => {
  return useQuery({
    queryKey: ["allocation-templates"],
    queryFn: fetchAllocationTemplates,
  });
};

export const useAllocationTemplateDetail = (id: string | null) => {
  return useQuery({
    queryKey: ["allocation-template", id],
    queryFn: () => (id ? fetchAllocationTemplateById(id) : null),
    enabled: !!id,
  });
};

export const useAllocationTemplateManagement = () => {
  const queryClient = useQueryClient();

  const createTemplate = useMutation({
    mutationFn: ({ templateData, items }: { templateData: any; items: any[] }) =>
      createTemplateWithItems(templateData, items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allocation-templates"] });
      toast.success("Template creado correctamente");
    },
    onError: (error: Error) => {
      toast.error(`Error al crear template: ${error.message}`);
    },
  });

  const updateTemplate = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateAllocationTemplate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allocation-templates"] });
      toast.success("Template actualizado");
    },
    onError: (error: Error) => {
      toast.error(`Error al actualizar: ${error.message}`);
    },
  });

  const deleteTemplate = useMutation({
    mutationFn: deleteAllocationTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allocation-templates"] });
      toast.success("Template eliminado");
    },
    onError: (error: Error) => {
      toast.error(`Error al eliminar: ${error.message}`);
    },
  });

  const applyTemplate = useMutation({
    mutationFn: ({ templateId, revenueItemId, totalAmount }: { 
      templateId: string; 
      revenueItemId: string; 
      totalAmount: number 
    }) => applyTemplateToRevenue(templateId, revenueItemId, totalAmount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["revenues"] });
      toast.success("Template aplicado correctamente");
    },
    onError: (error: Error) => {
      toast.error(`Error al aplicar template: ${error.message}`);
    },
  });

  return {
    createTemplate,
    updateTemplate,
    deleteTemplate,
    applyTemplate,
  };
};
