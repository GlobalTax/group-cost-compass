import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchSystemSettings,
  fetchSettingByKey,
  upsertSystemSetting,
  updateSystemSetting,
  deleteSystemSetting,
} from '@/lib/supabase/repositories/systemSettings.repo';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type SystemSettingInsert = Database['public']['Tables']['system_settings']['Insert'];
type SystemSettingUpdate = Database['public']['Tables']['system_settings']['Update'];

export const useSystemSettings = (orgId: string) => {
  return useQuery({
    queryKey: ['system-settings', orgId],
    queryFn: () => fetchSystemSettings(orgId),
    enabled: !!orgId,
    staleTime: 60000, // 1 minuto
    refetchOnWindowFocus: false,
  });
};

export const useSettingByKey = (orgId: string, key: string) => {
  return useQuery({
    queryKey: ['system-setting', orgId, key],
    queryFn: () => fetchSettingByKey(orgId, key),
    enabled: !!orgId && !!key,
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });
};

export const useUpsertSystemSetting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (setting: SystemSettingInsert) => upsertSystemSetting(setting),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['system-settings', variables.org_id] });
      toast.success('Configuración guardada correctamente');
    },
    onError: (error: Error) => {
      toast.error(`Error al guardar configuración: ${error.message}`);
    },
  });
};

export const useUpdateSystemSetting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: SystemSettingUpdate }) =>
      updateSystemSetting(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-settings'] });
      toast.success('Configuración actualizada correctamente');
    },
    onError: (error: Error) => {
      toast.error(`Error al actualizar configuración: ${error.message}`);
    },
  });
};

export const useDeleteSystemSetting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteSystemSetting(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-settings'] });
      toast.success('Configuración eliminada correctamente');
    },
    onError: (error: Error) => {
      toast.error(`Error al eliminar configuración: ${error.message}`);
    },
  });
};
