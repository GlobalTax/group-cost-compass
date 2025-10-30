import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { jobPostingSchema, type JobPostingFormData } from '@/lib/validators/jobPostingSchema';
import { useCreateJobPosting, useUpdateJobPosting } from '@/hooks/useJobPostings';
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
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

interface CreateJobPostingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobPosting?: any;
}

export function CreateJobPostingDialog({ open, onOpenChange, jobPosting }: CreateJobPostingDialogProps) {
  const createPosting = useCreateJobPosting();
  const updatePosting = useUpdateJobPosting();
  const isEdit = !!jobPosting;

  const form = useForm<JobPostingFormData>({
    resolver: zodResolver(jobPostingSchema),
    defaultValues: jobPosting || {
      title: '',
      department: '',
      location: '',
      remote_work_allowed: false,
      employment_type: 'full-time',
      position_level: 'mid',
      description: '',
      responsibilities: [],
      requirements: {},
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
    onOpenChange(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar' : 'Crear'} Vacante</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título del Puesto</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Desarrollador Frontend Senior" {...field} />
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
                      <Input placeholder="Tecnología" {...field} />
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
                      <Input placeholder="Madrid" {...field} />
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
                    <FormLabel>Tipo de Contrato</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="full-time">Jornada Completa</SelectItem>
                        <SelectItem value="part-time">Tiempo Parcial</SelectItem>
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
                          <SelectValue />
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
                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <FormLabel>Trabajo Remoto</FormLabel>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
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
                      placeholder="Describe el puesto y las responsabilidades..."
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="salary_min"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Salario Mínimo</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="30000"
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
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
                    <FormLabel>Salario Máximo</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="45000"
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="vacancies_count"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número de Vacantes</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createPosting.isPending || updatePosting.isPending}>
                {isEdit ? 'Actualizar' : 'Crear'} Vacante
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
