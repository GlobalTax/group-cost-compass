import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchTeams, createTeam, updateTeam, deleteTeam } from '@/lib/supabase/repositories/teams.repo';
import { toast } from 'sonner';
import type { TeamInsert } from '@/lib/supabase/repositories/teams.repo';

export const useTeams = (filters?: { departmentId?: string }) => {
  return useQuery({
    queryKey: ['teams', filters],
    queryFn: () => fetchTeams(filters),
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });
};

export const useCreateTeam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (team: TeamInsert) => createTeam(team),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      toast.success('Equipo creado correctamente');
    },
    onError: (error: Error) => {
      toast.error(`Error al crear equipo: ${error.message}`);
    },
  });
};

export const useUpdateTeam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Record<string, any> }) =>
      updateTeam(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      toast.success('Equipo actualizado correctamente');
    },
    onError: (error: Error) => {
      toast.error(`Error al actualizar equipo: ${error.message}`);
    },
  });
};

export const useDeleteTeam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTeam(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      toast.success('Equipo eliminado correctamente');
    },
    onError: (error: Error) => {
      toast.error(`Error al eliminar equipo: ${error.message}`);
    },
  });
};
