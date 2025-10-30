import { useState } from 'react';
import { useCandidate } from '@/hooks/useCandidates';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Mail, Phone, MapPin, Briefcase, Calendar, DollarSign, Linkedin, TrendingUp } from 'lucide-react';
import { ProcessDetailDrawer } from './ProcessDetailDrawer';

interface CandidateDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidateId: string;
}

export function CandidateDetailDrawer({ open, onOpenChange, candidateId }: CandidateDetailDrawerProps) {
  const { data: candidate, isLoading } = useCandidate(candidateId);
  const [selectedProcessId, setSelectedProcessId] = useState<string | null>(null);

  // Fetch active processes for this candidate
  const { data: processes } = useQuery({
    queryKey: ['candidate-processes', candidateId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('recruitment_processes')
        .select('*, job_postings(title), pipeline_stages(name, color)')
        .eq('candidate_id', candidateId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!candidateId && open,
  });

  if (isLoading) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader>
            <Skeleton className="h-8 w-64" />
          </DrawerHeader>
          <div className="p-6 space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  if (!candidate) return null;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader>
          <DrawerTitle>
            {candidate.first_name} {candidate.last_name}
          </DrawerTitle>
        </DrawerHeader>
        
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Información de Contacto */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Contacto</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{candidate.email}</span>
              </div>
              {candidate.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{candidate.phone}</span>
                </div>
              )}
              {candidate.location && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{candidate.location}</span>
                </div>
              )}
              {candidate.linkedin_url && (
                <div className="flex items-center gap-2 text-sm">
                  <Linkedin className="h-4 w-4 text-muted-foreground" />
                  <a 
                    href={candidate.linkedin_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Ver perfil
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Experiencia Actual */}
          {(candidate.current_company || candidate.current_position) && (
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Experiencia Actual</h3>
              <div className="space-y-2">
                {candidate.current_position && (
                  <div className="flex items-center gap-2 text-sm">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span>{candidate.current_position}</span>
                  </div>
                )}
                {candidate.current_company && (
                  <div className="text-sm text-muted-foreground ml-6">
                    en {candidate.current_company}
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{candidate.years_experience} años de experiencia</span>
                </div>
              </div>
            </div>
          )}

          {/* Skills */}
          {candidate.skills && candidate.skills.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {candidate.skills.map((skill: string, idx: number) => (
                  <Badge key={idx} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Idiomas */}
          {candidate.languages && candidate.languages.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Idiomas</h3>
              <div className="flex flex-wrap gap-2">
                {candidate.languages.map((language: string, idx: number) => (
                  <Badge key={idx} variant="outline">
                    {language}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Salario Esperado */}
          {candidate.expected_salary && (
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Salario Esperado</h3>
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span>
                  {candidate.expected_salary.toLocaleString('es-ES')} {candidate.salary_currency || 'EUR'}
                </span>
              </div>
            </div>
          )}

          {/* Preferencias */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Preferencias</h3>
            <div className="flex gap-2">
              <Badge variant="outline" className="capitalize">
                {candidate.remote_work_preference}
              </Badge>
              <Badge variant="secondary" className="capitalize">
                Fuente: {candidate.source}
              </Badge>
            </div>
          </div>

          {/* Active Processes */}
          {processes && processes.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Procesos Activos ({processes.length})
              </h3>
              <div className="space-y-2">
                {processes.map((process: any) => (
                  <div
                    key={process.id}
                    className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                    onClick={() => setSelectedProcessId(process.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{process.position_title}</p>
                        {process.job_postings && (
                          <p className="text-xs text-muted-foreground">
                            {process.job_postings.title}
                          </p>
                        )}
                      </div>
                      <Badge
                        variant="secondary"
                        style={{
                          backgroundColor: process.pipeline_stages?.color + '20',
                          color: process.pipeline_stages?.color,
                        }}
                      >
                        {process.pipeline_stages?.name || 'Sin etapa'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notas */}
          {candidate.notes && (
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Notas</h3>
              <p className="text-sm text-muted-foreground">{candidate.notes}</p>
            </div>
          )}
        </div>
      </DrawerContent>

      {/* Process Detail Drawer */}
      {selectedProcessId && (
        <ProcessDetailDrawer
          open={!!selectedProcessId}
          onOpenChange={(open) => !open && setSelectedProcessId(null)}
          processId={selectedProcessId}
        />
      )}
    </Drawer>
  );
}
