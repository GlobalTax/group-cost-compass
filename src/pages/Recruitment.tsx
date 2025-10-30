import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Briefcase, Users, Kanban, Plus, Settings } from 'lucide-react';
import { JobPostingsTable } from '@/components/recruitment/JobPostingsTable';
import { CandidatesTable } from '@/components/recruitment/CandidatesTable';
import { PipelineKanban } from '@/components/recruitment/PipelineKanban';
import { JobOffersTable } from '@/components/recruitment/JobOffersTable';
import { CreateJobPostingDialog } from '@/components/recruitment/CreateJobPostingDialog';
import { CreateCandidateDialog } from '@/components/recruitment/CreateCandidateDialog';
import { CreateRecruitmentProcessDialog } from '@/components/recruitment/CreateRecruitmentProcessDialog';
import { ConfigurePipelineDialog } from '@/components/recruitment/ConfigurePipelineDialog';
import { CreateJobOfferDialog } from '@/components/recruitment/CreateJobOfferDialog';
import { RecruitmentKPIs } from '@/components/recruitment/RecruitmentKPIs';
import { JobPostingsFilters } from '@/components/recruitment/JobPostingsFilters';
import { CandidatesFilters } from '@/components/recruitment/CandidatesFilters';
import { useJobPostings } from '@/hooks/useJobPostings';
import { useCandidates } from '@/hooks/useCandidates';
import { useJobOffers } from '@/hooks/useJobOffers';
import type { JobPostingFilters } from '@/lib/validators/jobPostingSchema';
import type { CandidateFilters } from '@/lib/validators/candidateSchema';
import { Skeleton } from '@/components/ui/skeleton';

export default function Recruitment() {
  const [activeTab, setActiveTab] = useState('postings');
  const [showCreatePosting, setShowCreatePosting] = useState(false);
  const [showCreateCandidate, setShowCreateCandidate] = useState(false);
  const [showCreateProcess, setShowCreateProcess] = useState(false);
  const [showConfigurePipeline, setShowConfigurePipeline] = useState(false);
  const [showCreateOffer, setShowCreateOffer] = useState(false);

  const [jobFilters, setJobFilters] = useState<JobPostingFilters>({});
  const [candidateFilters, setCandidateFilters] = useState<CandidateFilters>({});

  const { data: jobPostings, isLoading: loadingPostings } = useJobPostings(jobFilters);
  const { data: candidates, isLoading: loadingCandidates } = useCandidates(candidateFilters);
  const { data: jobOffers, isLoading: loadingOffers } = useJobOffers();

  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader
        title="Procesos de Selección"
        subtitle="Gestiona vacantes, candidatos y pipeline de contratación"
      />

      <RecruitmentKPIs />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="postings">Vacantes</TabsTrigger>
            <TabsTrigger value="candidates">Candidatos</TabsTrigger>
            <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
            <TabsTrigger value="offers">Ofertas</TabsTrigger>
          </TabsList>

          <div className="flex gap-2">
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
            {activeTab === 'pipeline' && (
              <>
                <Button onClick={() => setShowCreateProcess(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Proceso
                </Button>
                <Button variant="outline" onClick={() => setShowConfigurePipeline(true)}>
                  <Settings className="h-4 w-4 mr-2" />
                  Configurar
                </Button>
              </>
            )}
            {activeTab === 'offers' && (
              <Button onClick={() => setShowCreateOffer(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Oferta
              </Button>
            )}
          </div>
        </div>

        <TabsContent value="postings" className="space-y-4">
          <JobPostingsFilters filters={jobFilters} onFiltersChange={setJobFilters} />
          {loadingPostings ? (
            <Skeleton className="h-64" />
          ) : (
            <JobPostingsTable jobPostings={jobPostings || []} />
          )}
        </TabsContent>

        <TabsContent value="candidates" className="space-y-4">
          <CandidatesFilters filters={candidateFilters} onFiltersChange={setCandidateFilters} />
          {loadingCandidates ? (
            <Skeleton className="h-64" />
          ) : (
            <CandidatesTable candidates={candidates || []} />
          )}
        </TabsContent>

        <TabsContent value="pipeline" className="space-y-4">
          <PipelineKanban />
        </TabsContent>

        <TabsContent value="offers" className="space-y-4">
          {loadingOffers ? (
            <Skeleton className="h-64" />
          ) : (
            <JobOffersTable jobOffers={jobOffers || []} />
          )}
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

      <CreateRecruitmentProcessDialog
        open={showCreateProcess}
        onOpenChange={setShowCreateProcess}
      />

      <ConfigurePipelineDialog
        open={showConfigurePipeline}
        onOpenChange={setShowConfigurePipeline}
      />

      <CreateJobOfferDialog
        open={showCreateOffer}
        onOpenChange={setShowCreateOffer}
      />
    </div>
  );
}
