import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';
import { createOnboardingSchema, type CreateOnboarding } from '@/lib/validators/onboardingSchema';
import { useCreateOnboarding } from '@/hooks/useOnboarding';

export function CreateOnboardingDialog() {
  const [open, setOpen] = useState(false);
  const createMutation = useCreateOnboarding();

  const form = useForm<CreateOnboarding>({
    resolver: zodResolver(createOnboardingSchema),
    defaultValues: {
      email: '',
      position_title: '',
      department_id: null,
      job_offer_id: null,
    },
  });

  const onSubmit = async (data: CreateOnboarding) => {
    await createMutation.mutateAsync(data);
    setOpen(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Onboarding
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Iniciar Proceso de Onboarding</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email del Candidato</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="candidato@ejemplo.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="position_title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Puesto de Trabajo</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Abogado Senior" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="expected_start_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha de Inicio Esperada (Opcional)</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Creando...' : 'Crear Onboarding'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
