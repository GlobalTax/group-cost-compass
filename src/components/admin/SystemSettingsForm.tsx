import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUpsertSystemSetting } from '@/hooks/useSystemSettings';
import type { SystemSetting } from '@/lib/supabase/types/enriched';

const settingsFormSchema = z.object({
  organization_name: z.string().min(1, 'El nombre es requerido'),
  fiscal_year_start: z.string().regex(/^\d{2}-\d{2}$/, 'Formato inválido (MM-DD)'),
  currency: z.string().min(3, 'Moneda inválida'),
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

interface SystemSettingsFormProps {
  settings: SystemSetting[];
  orgId: string;
}

export const SystemSettingsForm = ({ settings, orgId }: SystemSettingsFormProps) => {
  const upsertMutation = useUpsertSystemSetting();

  const getSettingValue = (key: string, defaultValue: string) => {
    const setting = settings.find((s) => s.setting_key === key);
    return setting ? (setting.setting_value as { value: string }).value : defaultValue;
  };

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      organization_name: getSettingValue('organization_name', 'Grupo Navarro'),
      fiscal_year_start: getSettingValue('fiscal_year_start', '01-01'),
      currency: getSettingValue('currency', 'EUR'),
    },
  });

  useEffect(() => {
    form.reset({
      organization_name: getSettingValue('organization_name', 'Grupo Navarro'),
      fiscal_year_start: getSettingValue('fiscal_year_start', '01-01'),
      currency: getSettingValue('currency', 'EUR'),
    });
  }, [settings]);

  const onSubmit = async (data: SettingsFormValues) => {
    const updates = [
      {
        org_id: orgId,
        setting_key: 'organization_name',
        setting_value: { value: data.organization_name },
        description: 'Nombre de la organización',
        setting_category: 'general',
      },
      {
        org_id: orgId,
        setting_key: 'fiscal_year_start',
        setting_value: { value: data.fiscal_year_start },
        description: 'Inicio del año fiscal (MM-DD)',
        setting_category: 'financial',
      },
      {
        org_id: orgId,
        setting_key: 'currency',
        setting_value: { value: data.currency },
        description: 'Moneda por defecto',
        setting_category: 'financial',
      },
    ];

    try {
      for (const update of updates) {
        await upsertMutation.mutateAsync(update);
      }
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configuración General</CardTitle>
          <CardDescription>
            Parámetros globales de la organización
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="organization_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de la Organización</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Grupo Navarro" />
                    </FormControl>
                    <FormDescription>
                      Nombre que aparecerá en reportes y documentos
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="fiscal_year_start"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Inicio del Año Fiscal</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="01-01" />
                      </FormControl>
                      <FormDescription>Formato: MM-DD</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Moneda</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="EUR" maxLength={3} />
                      </FormControl>
                      <FormDescription>Código ISO de 3 letras</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={upsertMutation.isPending}>
                  {upsertMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};
