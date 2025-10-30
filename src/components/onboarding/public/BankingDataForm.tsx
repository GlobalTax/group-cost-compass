import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { bankingDataSchema, type BankingData } from '@/lib/validators/onboardingSchema';
import { Loader2 } from 'lucide-react';

interface BankingDataFormProps {
  initialData?: Partial<BankingData>;
  onNext: (data: BankingData) => void;
  onBack: () => void;
  isSubmitting?: boolean;
}

export function BankingDataForm({ initialData, onNext, onBack, isSubmitting }: BankingDataFormProps) {
  const form = useForm<BankingData>({
    resolver: zodResolver(bankingDataSchema),
    defaultValues: initialData || {
      iban: '',
      bank_name: '',
      account_holder: '',
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Datos Bancarios</CardTitle>
        <CardDescription>Información para el pago de tu nómina</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onNext)} className="space-y-4">
            <FormField
              control={form.control}
              name="iban"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>IBAN *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="ES00 0000 0000 0000 0000 0000" 
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value.toUpperCase();
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bank_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Entidad bancaria *</FormLabel>
                  <FormControl>
                    <Input placeholder="BBVA, Santander, CaixaBank..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="account_holder"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titular de la cuenta *</FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre del titular" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Nota:</strong> Asegúrate de que el IBAN sea correcto. 
                La nómina se transferirá a esta cuenta bancaria.
              </p>
            </div>

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
