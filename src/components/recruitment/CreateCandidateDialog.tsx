import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { candidateSchema, type CandidateFormData } from '@/lib/validators/candidateSchema';
import { useCreateCandidate, useUpdateCandidate } from '@/hooks/useCandidates';
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

interface CreateCandidateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidate?: any;
}

export function CreateCandidateDialog({ open, onOpenChange, candidate }: CreateCandidateDialogProps) {
  const createCandidate = useCreateCandidate();
  const updateCandidate = useUpdateCandidate();
  const isEdit = !!candidate;

  const form = useForm<CandidateFormData>({
    resolver: zodResolver(candidateSchema),
    defaultValues: candidate || {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      linkedin_url: '',
      current_company: '',
      current_position: '',
      years_experience: 0,
      skills: [],
      languages: [],
      location: '',
      remote_work_preference: 'hybrid',
      expected_salary: undefined,
      salary_currency: 'EUR',
      source: 'manual',
      notes: '',
    },
  });

  const onSubmit = async (data: CandidateFormData) => {
    if (isEdit) {
      await updateCandidate.mutateAsync({ id: candidate.id, data });
    } else {
      await createCandidate.mutateAsync(data);
    }
    onOpenChange(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar' : 'Añadir'} Candidato</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input placeholder="Juan" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Apellidos</FormLabel>
                    <FormControl>
                      <Input placeholder="García" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="juan@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono</FormLabel>
                    <FormControl>
                      <Input placeholder="+34 600 123 456" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="linkedin_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>LinkedIn</FormLabel>
                  <FormControl>
                    <Input placeholder="https://linkedin.com/in/..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="current_company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Empresa Actual</FormLabel>
                    <FormControl>
                      <Input placeholder="Tech Corp" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="current_position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Puesto Actual</FormLabel>
                    <FormControl>
                      <Input placeholder="Desarrollador Senior" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="years_experience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Años de Experiencia</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
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
                name="remote_work_preference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferencia Trabajo</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="remote">Remoto</SelectItem>
                        <SelectItem value="hybrid">Híbrido</SelectItem>
                        <SelectItem value="office">Oficina</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="source"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fuente</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="linkedin">LinkedIn</SelectItem>
                        <SelectItem value="referral">Referido</SelectItem>
                        <SelectItem value="website">Web</SelectItem>
                        <SelectItem value="job_board">Portal Empleo</SelectItem>
                        <SelectItem value="headhunter">Headhunter</SelectItem>
                        <SelectItem value="manual">Manual</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="expected_salary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Salario Esperado (€)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="40000"
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
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Información adicional sobre el candidato..."
                      rows={3}
                      {...field}
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
              <Button type="submit" disabled={createCandidate.isPending || updateCandidate.isPending}>
                {isEdit ? 'Actualizar' : 'Añadir'} Candidato
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
