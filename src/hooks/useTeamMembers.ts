import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchEmployees } from "@/lib/supabase/repositories/employees.repo";
import { useUpdateEmployeeTeam } from "./useUpdateEmployeeTeam";

/**
 * Hook para obtener los miembros de un equipo
 */
export const useTeamMembers = (teamId: string | null) => {
  return useQuery({
    queryKey: ["team-members", teamId],
    queryFn: () =>
      teamId
        ? fetchEmployees({ teamId, activeOnly: true })
        : Promise.resolve([]),
    enabled: !!teamId,
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook para añadir un miembro a un equipo
 */
export const useAddTeamMember = () => {
  const queryClient = useQueryClient();
  const updateTeam = useUpdateEmployeeTeam();

  return useMutation({
    mutationFn: async ({
      employeeId,
      teamId,
    }: {
      employeeId: string;
      teamId: string;
    }) => {
      return updateTeam.mutateAsync({
        employeeId,
        newTeamId: teamId,
        oldTeamId: null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });
};

/**
 * Hook para remover un miembro de un equipo
 */
export const useRemoveTeamMember = () => {
  const queryClient = useQueryClient();
  const updateTeam = useUpdateEmployeeTeam();

  return useMutation({
    mutationFn: async ({
      employeeId,
      oldTeamId,
    }: {
      employeeId: string;
      oldTeamId: string;
    }) => {
      return updateTeam.mutateAsync({
        employeeId,
        newTeamId: null,
        oldTeamId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });
};
