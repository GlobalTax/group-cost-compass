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
import { companySchema, type CompanyInput } from '@/lib/validators/companySchema';
import { useCreateCompany, useUpdateCompany } from '@/hooks/useCompanyManagement';
import type { Company } from '@/lib/supabase/types/enriched';

interface CompanyFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company?: Company | null;
  orgId: string;
}

export const CompanyFormDialog = ({
  open,
  onOpenChange,
  company,
  orgId,
}: CompanyFormDialogProps) => {
  const createMutation = useCreateCompany();
  const updateMutation = useUpdateCompany();

  const form = useForm<CompanyInput>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: '',
      nif: '',
      is_active: true,
      founded_date: null,
      address: null,
      notes: null,
      org_id: orgId,
    },
  });

  useEffect(() => {
    if (company) {
      form.reset({
        name: company.name,
        nif: company.nif || '',
        is_active: company.is_active ?? true,
        founded_date: company.founded_date || null,
        address: company.address || null,
        notes: company.notes || null,
        org_id: company.org_id,
      });
    } else {
      form.reset({
        name: '',
        nif: '',
        is_active: true,
        founded_date: null,
        address: null,
        notes: null,
        org_id: orgId,
      });
    }
  }, [company, orgId, form]);

  const onSubmit = async (data: CompanyInput) => {
    try {
      if (company) {
        // For updates, ensure name and org_id are preserved
        await updateMutation.mutateAsync({
          id: company.id,
          updates: {
            ...data,
            name: data.name || company.name,
            org_id: data.org_id || company.org_id,
          },
        });
      } else {
        // For creates, ensure all required fields are present
        await createMutation.mutateAsync({
          ...data,
          name: data.name || '',
          org_id: data.org_id || orgId,
        });
      }
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error('Error saving company:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {company ? 'Editar Empresa' : 'Nueva Empresa'}
          </DialogTitle>
          <DialogDescription>
            {company
              ? 'Modifica los datos de la empresa'
              : 'Completa los datos de la nueva empresa'}
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
                      <Input {...field} placeholder="Ej: Navarro Legal y Tributario" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="nif"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>NIF *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="B67261552"
                        maxLength={9}
                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="founded_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de Constitución</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        value={field.value || ''}
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
                        {field.value ? 'Activa' : 'Inactiva'}
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
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dirección Fiscal</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value || ''}
                      placeholder="Calle, número, código postal, ciudad"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas Internas</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      value={field.value || ''}
                      placeholder="Notas adicionales sobre la empresa..."
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
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
                  : company
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
