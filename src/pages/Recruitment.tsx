import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/layout/PageHeader';
import { Briefcase, Users, Kanban } from 'lucide-react';

export default function Recruitment() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader
        title="Procesos de Selección"
        subtitle="Gestiona vacantes, candidatos y pipeline de contratación"
      />

      <Tabs defaultValue="postings" className="w-full">
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

        <TabsContent value="postings" className="space-y-4">
          <div className="text-muted-foreground">Vacantes - Próximamente</div>
        </TabsContent>

        <TabsContent value="candidates" className="space-y-4">
          <div className="text-muted-foreground">Candidatos - Próximamente</div>
        </TabsContent>

        <TabsContent value="pipeline" className="space-y-4">
          <div className="text-muted-foreground">Pipeline - Próximamente</div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
