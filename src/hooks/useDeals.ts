import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  fetchDeals,
  fetchDealById,
  createDeal,
  updateDeal,
  deleteDeal,
  addDealParticipant,
  updateDealParticipant,
  removeDealParticipant,
  fetchEmployeeDeals,
} from "@/lib/supabase/repositories/deals.repo";
import type { Database } from "@/integrations/supabase/types";

type DealInsert = Database["public"]["Tables"]["deals"]["Insert"];
type DealUpdate = Database["public"]["Tables"]["deals"]["Update"];
type DealParticipantInsert = Database["public"]["Tables"]["deal_participants"]["Insert"];

export const useDeals = (filters?: { status?: string; fiscalYear?: number }) => {
  return useQuery({
    queryKey: ["deals", filters],
    queryFn: () => fetchDeals(filters),
    staleTime: 30000,
  });
};

export const useDeal = (id?: string) => {
  return useQuery({
    queryKey: ["deal", id],
    queryFn: () => (id ? fetchDealById(id) : null),
    enabled: !!id,
    staleTime: 30000,
  });
};

export const useEmployeeDeals = (employeeId?: string) => {
  return useQuery({
    queryKey: ["employee-deals", employeeId],
    queryFn: () => (employeeId ? fetchEmployeeDeals(employeeId) : []),
    enabled: !!employeeId,
    staleTime: 30000,
  });
};

export const useCreateDeal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (deal: DealInsert) => createDeal(deal),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deals"] });
      toast.success("Operación creada correctamente");
    },
    onError: (error: Error) => {
      toast.error("Error al crear operación: " + error.message);
    },
  });
};

export const useUpdateDeal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: DealUpdate }) =>
      updateDeal(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deals"] });
      queryClient.invalidateQueries({ queryKey: ["deal"] });
      toast.success("Operación actualizada correctamente");
    },
    onError: (error: Error) => {
      toast.error("Error al actualizar operación: " + error.message);
    },
  });
};

export const useDeleteDeal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteDeal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deals"] });
      toast.success("Operación eliminada correctamente");
    },
    onError: (error: Error) => {
      toast.error("Error al eliminar operación: " + error.message);
    },
  });
};

export const useAddDealParticipant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (participant: DealParticipantInsert) => addDealParticipant(participant),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deals"] });
      queryClient.invalidateQueries({ queryKey: ["deal"] });
      queryClient.invalidateQueries({ queryKey: ["employee-deals"] });
      toast.success("Participante añadido correctamente");
    },
    onError: (error: Error) => {
      toast.error("Error al añadir participante: " + error.message);
    },
  });
};

export const useUpdateDealParticipant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: { participation_pct?: number; role_in_deal?: string };
    }) => updateDealParticipant(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deals"] });
      queryClient.invalidateQueries({ queryKey: ["deal"] });
      toast.success("Participante actualizado correctamente");
    },
    onError: (error: Error) => {
      toast.error("Error al actualizar participante: " + error.message);
    },
  });
};

export const useRemoveDealParticipant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => removeDealParticipant(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deals"] });
      queryClient.invalidateQueries({ queryKey: ["deal"] });
      queryClient.invalidateQueries({ queryKey: ["employee-deals"] });
      toast.success("Participante eliminado correctamente");
    },
    onError: (error: Error) => {
      toast.error("Error al eliminar participante: " + error.message);
    },
  });
};
