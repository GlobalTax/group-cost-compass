import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateJobPosting, useUpdateJobPosting } from '@/hooks/useJobPostings';
import { jobPostingSchema, JobPostingFormData } from '@/lib/validators/jobPostingSchema';
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
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { TagsInput } from '@/components/ui/tags-input';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CreateJobPostingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobPosting?: any;
}

export function CreateJobPostingDialog({
  open,
  onOpenChange,
  jobPosting,
}: CreateJobPostingDialogProps) {
  const [step, setStep] = useState(1);
  const isEdit = !!jobPosting;
  const createPosting = useCreateJobPosting();
  const updatePosting = useUpdateJobPosting();

  const form = useForm<JobPostingFormData>({
    resolver: zodResolver(jobPostingSchema),
    defaultValues: jobPosting || {
      title: '',
      department: '',
      location: '',
      remote_work_allowed: false,
      employment_type: undefined,
      position_level: undefined,
      description: '',
      responsibilities: [],
      requirements: {
        education: [],
        experience_years: 0,
        skills: [],
        languages: [],
      },
      salary_min: undefined,
      salary_max: undefined,
      salary_currency: 'EUR',
      benefits: [],
      vacancies_count: 1,
    },
  });

  const onSubmit = async (data: JobPostingFormData) => {
    if (isEdit) {
      await updatePosting.mutateAsync({ id: jobPosting.id, data });
    } else {
      await createPosting.mutateAsync(data);
    }
    form.reset();
    setStep(1);
    onOpenChange(false);
  };

  const nextStep = () => setStep((s) => Math.min(s + 1, 4));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Editar' : 'Crear'} Vacante - Paso {step}/4
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Step 1: Basic Info */}
            {step === 1 && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ej: Desarrollador Full Stack Senior" />
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
                          <Input {...field} placeholder="Ej: Desarrollo" value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ubicación</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Ej: Madrid, Barcelona" value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="employment_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Empleo</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="full-time">Tiempo completo</SelectItem>
                            <SelectItem value="part-time">Medio tiempo</SelectItem>
                            <SelectItem value="contract">Contrato</SelectItem>
                            <SelectItem value="internship">Prácticas</SelectItem>
                          </SelectContent>
                        </Select>
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
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="junior">Junior</SelectItem>
                            <SelectItem value="mid">Mid</SelectItem>
                            <SelectItem value="senior">Senior</SelectItem>
                            <SelectItem value="lead">Lead</SelectItem>
                            <SelectItem value="director">Director</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="remote_work_allowed"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between p-3 border rounded-lg">
                      <FormLabel className="m-0">¿Permite Trabajo Remoto?</FormLabel>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="vacancies_count"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número de Vacantes</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Step 2: Description & Responsibilities */}
            {step === 2 && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción del Puesto</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={5} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="responsibilities"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Responsabilidades</FormLabel>
                      <FormControl>
                        <TagsInput
                          value={field.value || []}
                          onChange={field.onChange}
                          placeholder="Escribe y presiona Enter"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Step 3: Requirements */}
            {step === 3 && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="requirements.education"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Educación Requerida</FormLabel>
                      <FormControl>
                        <TagsInput
                          value={field.value || []}
                          onChange={field.onChange}
                          placeholder="Ej: Ingeniería Informática"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="requirements.experience_years"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Años de Experiencia</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="requirements.skills"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Skills Requeridas</FormLabel>
                      <FormControl>
                        <TagsInput
                          value={field.value || []}
                          onChange={field.onChange}
                          placeholder="Ej: React, Node.js, TypeScript"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="requirements.languages"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Idiomas Requeridos</FormLabel>
                      <FormControl>
                        <TagsInput
                          value={field.value || []}
                          onChange={field.onChange}
                          placeholder="Ej: Español, Inglés"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Step 4: Salary & Benefits */}
            {step === 4 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="salary_min"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Salario Min (€)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="salary_max"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Salario Max (€)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="benefits"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Beneficios</FormLabel>
                      <FormControl>
                        <TagsInput
                          value={field.value || []}
                          onChange={field.onChange}
                          placeholder="Ej: Seguro médico, Flexibilidad horaria"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="target_start_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha Inicio Estimada</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-4">
              <div>
                {step > 1 && (
                  <Button type="button" variant="outline" onClick={prevStep}>
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Anterior
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancelar
                </Button>
                {step < 4 ? (
                  <Button type="button" onClick={nextStep}>
                    Siguiente
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                ) : (
                  <Button type="submit" disabled={createPosting.isPending || updatePosting.isPending}>
                    {createPosting.isPending || updatePosting.isPending
                      ? 'Guardando...'
                      : isEdit
                        ? 'Actualizar'
                        : 'Crear'}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
