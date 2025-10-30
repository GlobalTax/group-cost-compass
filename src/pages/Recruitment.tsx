import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Briefcase, Users, Kanban, Plus } from 'lucide-react';
import { JobPostingsTable } from '@/components/recruitment/JobPostingsTable';
import { CandidatesTable } from '@/components/recruitment/CandidatesTable';
import { PipelineKanban } from '@/components/recruitment/PipelineKanban';
import { CreateJobPostingDialog } from '@/components/recruitment/CreateJobPostingDialog';
import { CreateCandidateDialog } from '@/components/recruitment/CreateCandidateDialog';
import { useJobPostings } from '@/hooks/useJobPostings';
import { useCandidates } from '@/hooks/useCandidates';
import { Skeleton } from '@/components/ui/skeleton';

export default function Recruitment() {
  const [activeTab, setActiveTab] = useState('postings');
  const [showCreatePosting, setShowCreatePosting] = useState(false);
  const [showCreateCandidate, setShowCreateCandidate] = useState(false);

  const { data: jobPostings, isLoading: loadingPostings } = useJobPostings();
  const { data: candidates, isLoading: loadingCandidates } = useCandidates();

  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader
        title="Procesos de Selección"
        subtitle="Gestiona vacantes, candidatos y pipeline de contratación"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="postings">
              <Briefcase className="h-4 w-4 mr-2" />
              Vacantes
            </TabsTrigger>
            <TabsTrigger value="candidates">
              <Users className="h-4 w-4 mr-2" />
              Candidatos
            </TabsTrigger>
            <TabsTrigger value="pipeline">
              <Kanban className="h-4 w-4 mr-2" />
              Pipeline
            </TabsTrigger>
          </TabsList>

          <div>
            {activeTab === 'postings' && (
              <Button onClick={() => setShowCreatePosting(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Vacante
              </Button>
            )}
            {activeTab === 'candidates' && (
              <Button onClick={() => setShowCreateCandidate(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Añadir Candidato
              </Button>
            )}
          </div>
        </div>

        <TabsContent value="postings" className="space-y-4">
          {loadingPostings ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <JobPostingsTable jobPostings={jobPostings || []} />
          )}
        </TabsContent>

        <TabsContent value="candidates" className="space-y-4">
          {loadingCandidates ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <CandidatesTable candidates={candidates || []} />
          )}
        </TabsContent>

        <TabsContent value="pipeline" className="space-y-4">
          <PipelineKanban />
        </TabsContent>
      </Tabs>

      <CreateJobPostingDialog
        open={showCreatePosting}
        onOpenChange={setShowCreatePosting}
      />

      <CreateCandidateDialog
        open={showCreateCandidate}
        onOpenChange={setShowCreateCandidate}
      />
    </div>
  );
}
