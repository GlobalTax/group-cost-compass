import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { personalDataSchema, type PersonalData } from '@/lib/validators/onboardingSchema';
import { Loader2 } from 'lucide-react';

interface PersonalDataFormProps {
  initialData?: Partial<PersonalData>;
  onNext: (data: PersonalData) => void;
  onBack: () => void;
  isSubmitting?: boolean;
}

export function PersonalDataForm({ initialData, onNext, onBack, isSubmitting }: PersonalDataFormProps) {
  const form = useForm<PersonalData>({
    resolver: zodResolver(personalDataSchema),
    defaultValues: initialData || {
      full_name: '',
      dni_nie: '',
      birth_date: '',
      nationality: '',
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Datos Personales</CardTitle>
        <CardDescription>Por favor, completa tu información personal</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onNext)} className="space-y-4">
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre completo *</FormLabel>
                  <FormControl>
                    <Input placeholder="Juan Pérez García" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dni_nie"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>DNI/NIE *</FormLabel>
                  <FormControl>
                    <Input placeholder="12345678A" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="birth_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha de nacimiento *</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nationality"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nacionalidad *</FormLabel>
                  <FormControl>
                    <Input placeholder="Española" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onBack} className="flex-1">
                Anterior
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Siguiente
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
