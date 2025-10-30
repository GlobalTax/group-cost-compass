import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
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
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useCreateJobOffer } from '@/hooks/useJobOffers';
import { jobOfferSchema, type JobOfferFormData } from '@/lib/validators/jobOfferSchema';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CreateJobOfferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateJobOfferDialog({
  open,
  onOpenChange,
}: CreateJobOfferDialogProps) {
  const createOffer = useCreateJobOffer();

  const form = useForm<JobOfferFormData>({
    resolver: zodResolver(jobOfferSchema),
    defaultValues: {
      title: '',
      department: '',
      position_level: '',
      work_location: '',
      start_date: '',
      salary_base: 0,
      salary_currency: 'EUR',
      contract_type: 'indefinido',
      weekly_hours: 40,
      remote_work_allowed: false,
    },
  });

  const onSubmit = async (data: JobOfferFormData) => {
    try {
      await createOffer.mutateAsync(data);
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error('Error creating offer:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Crear Nueva Oferta de Trabajo</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-8rem)] pr-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Accordion type="multiple" defaultValue={['basic', 'compensation']} className="w-full">
                {/* Información Básica */}
                <AccordionItem value="basic">
                  <AccordionTrigger>Información Básica *</AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Puesto *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Ej: Abogado Senior M&A" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="department"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Departamento</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Ej: M&A" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="position_level"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nivel</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Ej: Junior, Senior" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="work_location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ubicación</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Ej: Barcelona" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="start_date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fecha de Inicio</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Retribución */}
                <AccordionItem value="compensation">
                  <AccordionTrigger>Retribución *</AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="col-span-2">
                        <FormField
                          control={form.control}
                          name="salary_base"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Salario Base Bruto Anual *</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  {...field}
                                  onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)}
                                  placeholder="38000"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="salary_currency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Moneda</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="EUR">EUR</SelectItem>
                                <SelectItem value="USD">USD</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="bonus_amount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bonus Variable</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                                placeholder="5000"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="exclusivity_percentage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>% Exclusividad</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                                placeholder="15"
                              />
                            </FormControl>
                            <FormDescription>Porcentaje del salario base</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="bonus_conditions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Condiciones del Bonus</FormLabel>
                          <FormControl>
                            <Textarea {...field} placeholder="Por cumplimiento de objetivos..." rows={2} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </AccordionContent>
                </AccordionItem>

                {/* Contrato */}
                <AccordionItem value="contract">
                  <AccordionTrigger>Contrato</AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="contract_type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo de Contrato</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="indefinido">Indefinido</SelectItem>
                                <SelectItem value="temporal">Temporal</SelectItem>
                                <SelectItem value="practicas">Prácticas</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="probation_duration"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Periodo de Prueba</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="6 meses" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="weekly_hours"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Jornada Semanal (horas)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 40)}
                                placeholder="40"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="work_schedule"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Horario</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="9:00 - 18:00" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="contract_duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Duración (si temporal)</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="12 meses" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </AccordionContent>
                </AccordionItem>

                {/* Beneficios */}
                <AccordionItem value="benefits">
                  <AccordionTrigger>Beneficios</AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-4">
                    <FormField
                      control={form.control}
                      name="vacation_days"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Días de Vacaciones</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                              placeholder="22"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="remote_work_allowed"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Trabajo Remoto</FormLabel>
                            <FormDescription>Posibilidad de teletrabajo</FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="expense_reimbursement"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reembolso de Gastos</FormLabel>
                          <FormControl>
                            <Textarea {...field} placeholder="Política de reembolso..." rows={2} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </AccordionContent>
                </AccordionItem>

                {/* Pactos Legales */}
                <AccordionItem value="legal">
                  <AccordionTrigger>Pactos Legales</AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-4">
                    <FormField
                      control={form.control}
                      name="exclusivity_clause"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pacto de Exclusividad</FormLabel>
                          <FormControl>
                            <Textarea {...field} placeholder="Texto del pacto de plena dedicación..." rows={3} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="non_compete_clause"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pacto de No Competencia</FormLabel>
                          <FormControl>
                            <Textarea {...field} placeholder="Texto del pacto de no competencia..." rows={3} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </AccordionContent>
                </AccordionItem>

                {/* Notas Adicionales */}
                <AccordionItem value="notes">
                  <AccordionTrigger>Notas Adicionales</AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-4">
                    <FormField
                      control={form.control}
                      name="additional_notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notas</FormLabel>
                          <FormControl>
                            <Textarea {...field} placeholder="Información adicional..." rows={4} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createOffer.isPending}>
                  {createOffer.isPending ? 'Creando...' : 'Crear Oferta'}
                </Button>
              </div>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
