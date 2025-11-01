import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { TeamsTable } from "@/components/admin/TeamsTable";
import { TeamDialog } from "@/components/admin/TeamDialog";

const AdminTeams = () => {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="flex-1 space-y-6 p-6">
      <PageHeader
        title="Equipos"
        subtitle="Gestiona los equipos de trabajo de la organización"
      />

      <div className="flex justify-end">
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Equipo
        </Button>
      </div>

      <TeamsTable />

      <TeamDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
};

export default AdminTeams;
