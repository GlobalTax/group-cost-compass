import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { roleConfigSchema, type RoleConfigInput } from '@/lib/validators/roleConfigSchema';
import { useUpdateRoleConfiguration } from '@/hooks/useRoleConfiguration';
import type { RoleConfiguration } from '@/lib/supabase/types/enriched';

interface RoleConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roleConfig: RoleConfiguration | null;
}

export const RoleConfigDialog = ({
  open,
  onOpenChange,
  roleConfig,
}: RoleConfigDialogProps) => {
  const updateMutation = useUpdateRoleConfiguration();

  const form = useForm<RoleConfigInput>({
    resolver: zodResolver(roleConfigSchema),
    defaultValues: {
      display_name: '',
      description: '',
      permissions: {},
      is_active: true,
    },
  });

  useEffect(() => {
    if (roleConfig) {
      form.reset({
        display_name: roleConfig.display_name,
        description: roleConfig.description || '',
        permissions: (roleConfig.permissions as Record<string, boolean | string>) || {},
        is_active: roleConfig.is_active ?? true,
      });
    }
  }, [roleConfig, form]);

  const onSubmit = async (data: RoleConfigInput) => {
    if (!roleConfig) return;

    try {
      await updateMutation.mutateAsync({
        id: roleConfig.id,
        updates: data,
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating role config:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Configurar Rol: {roleConfig?.role}</DialogTitle>
          <DialogDescription>
            Modifica la configuración del rol sin cambiar su identificador interno
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="display_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de Visualización *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ej: Administrador" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      value={field.value || ''}
                      placeholder="Describe los permisos y responsabilidades de este rol..."
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between space-y-0 rounded-lg border p-4">
                  <div>
                    <FormLabel>Estado</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      {field.value ? 'Activo' : 'Inactivo'}
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="text-sm text-muted-foreground p-4 bg-muted rounded-lg">
              <strong>Nota:</strong> Los permisos detallados se gestionan a nivel de código.
              Esta configuración solo afecta la visualización y estado del rol.
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Guardando...' : 'Actualizar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
