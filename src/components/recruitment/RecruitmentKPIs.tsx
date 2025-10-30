import { useJobPostings } from '@/hooks/useJobPostings';
import { useCandidates } from '@/hooks/useCandidates';
import { useAllActiveProcesses } from '@/hooks/useRecruitmentPipeline';
import { Card } from '@/components/ui/card';
import { Briefcase, Users, TrendingUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export function RecruitmentKPIs() {
  const { data: jobPostings, isLoading: loadingJobs } = useJobPostings();
  const { data: candidates, isLoading: loadingCandidates } = useCandidates();
  const { data: processes, isLoading: loadingProcesses } = useAllActiveProcesses();

  const activeJobs = jobPostings?.filter(j => j.status === 'published').length || 0;
  const totalCandidates = candidates?.length || 0;
  const activeProcesses = processes?.filter(p => p.status === 'active').length || 0;

  if (loadingJobs || loadingCandidates || loadingProcesses) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-24" />)}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Vacantes Activas</p>
            <p className="text-2xl font-bold mt-1">{activeJobs}</p>
          </div>
          <Briefcase className="h-8 w-8 text-primary" />
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total Candidatos</p>
            <p className="text-2xl font-bold mt-1">{totalCandidates}</p>
          </div>
          <Users className="h-8 w-8 text-primary" />
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Procesos Activos</p>
            <p className="text-2xl font-bold mt-1">{activeProcesses}</p>
          </div>
          <TrendingUp className="h-8 w-8 text-primary" />
        </div>
      </Card>
    </div>
  );
}
