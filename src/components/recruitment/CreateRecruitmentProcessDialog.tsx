import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateRecruitmentProcess } from '@/hooks/useRecruitmentPipeline';
import { useCandidates } from '@/hooks/useCandidates';
import { useJobPostings } from '@/hooks/useJobPostings';
import { recruitmentProcessSchema, RecruitmentProcessFormData } from '@/lib/validators/recruitmentPipelineSchema';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface CreateRecruitmentProcessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidateId?: string;
  jobPostingId?: string;
}

export function CreateRecruitmentProcessDialog({
  open,
  onOpenChange,
  candidateId,
  jobPostingId,
}: CreateRecruitmentProcessDialogProps) {
  const createProcess = useCreateRecruitmentProcess();
  const { data: candidates } = useCandidates();
  const { data: jobPostings } = useJobPostings();

  const form = useForm<RecruitmentProcessFormData>({
    resolver: zodResolver(recruitmentProcessSchema),
    defaultValues: {
      candidate_id: candidateId || '',
      job_posting_id: jobPostingId || undefined,
      position_title: '',
      status: 'active',
      priority: 'medium',
      notes: '',
    },
  });

  const onSubmit = async (data: RecruitmentProcessFormData) => {
    await createProcess.mutateAsync(data);
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Crear Proceso de Selección</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="candidate_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Candidato *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={!!candidateId}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar candidato" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {candidates?.map((candidate) => (
                        <SelectItem key={candidate.id} value={candidate.id}>
                          {candidate.first_name} {candidate.last_name} - {candidate.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="job_posting_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vacante (Opcional)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={!!jobPostingId}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar vacante" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {jobPostings?.map((posting) => (
                        <SelectItem key={posting.id} value={posting.id}>
                          {posting.title} - {posting.department}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="position_title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título de la Posición *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ej: Desarrollador Senior React" />
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
                      <Input {...field} placeholder="Ej: Desarrollo" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prioridad</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Baja</SelectItem>
                        <SelectItem value="medium">Media</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
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
                name="budget_min"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Presupuesto Min (€)</FormLabel>
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
                name="budget_max"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Presupuesto Max (€)</FormLabel>
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

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={3} placeholder="Información adicional..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createProcess.isPending}>
                {createProcess.isPending ? 'Creando...' : 'Crear Proceso'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
