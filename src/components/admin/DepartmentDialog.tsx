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
import { departmentSchema, type DepartmentFormData } from '@/lib/validators/departmentSchema';
import { useCreateDepartment, useUpdateDepartment } from '@/hooks/useDepartments';
import type { Department } from '@/lib/supabase/repositories/departments.repo';

interface DepartmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  department?: Department | null;
  orgId: string;
}

export const DepartmentDialog = ({
  open,
  onOpenChange,
  department,
  orgId,
}: DepartmentDialogProps) => {
  const createMutation = useCreateDepartment();
  const updateMutation = useUpdateDepartment();

  const form = useForm<DepartmentFormData>({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      name: '',
      description: null,
      color: '#6366f1',
      manager_user_id: null,
      is_active: true,
      org_id: orgId,
    },
  });

  useEffect(() => {
    if (department) {
      form.reset({
        name: department.name,
        description: department.description || null,
        color: department.color || '#6366f1',
        manager_user_id: department.manager_user_id || null,
        is_active: department.is_active ?? true,
        org_id: department.org_id,
      });
    } else {
      form.reset({
        name: '',
        description: null,
        color: '#6366f1',
        manager_user_id: null,
        is_active: true,
        org_id: orgId,
      });
    }
  }, [department, orgId, form, open]);

  const onSubmit = async (data: DepartmentFormData) => {
    try {
      // Ensure required fields are present
      const payload = {
        name: data.name,
        org_id: data.org_id,
        description: data.description,
        color: data.color,
        manager_user_id: data.manager_user_id,
        is_active: data.is_active,
      };

      if (department) {
        await updateMutation.mutateAsync({
          id: department.id,
          updates: payload,
        });
      } else {
        await createMutation.mutateAsync(payload);
      }
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error('Error saving department:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {department ? 'Editar Departamento' : 'Nuevo Departamento'}
          </DialogTitle>
          <DialogDescription>
            {department
              ? 'Modifica los datos del departamento'
              : 'Completa los datos del nuevo departamento'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ej: Marketing" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input
                          type="color"
                          {...field}
                          className="h-10 w-20 cursor-pointer"
                        />
                      </FormControl>
                      <Input
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                        placeholder="#6366f1"
                        className="flex-1"
                      />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
                      placeholder="Descripción del departamento..."
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

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending
                  ? 'Guardando...'
                  : department
                  ? 'Actualizar'
                  : 'Crear'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
