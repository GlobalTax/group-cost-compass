import { useState } from "react";
import { Plus, Edit, Trash2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAllocationTemplates, useAllocationTemplateManagement } from "@/hooks/useAllocationTemplates";
import { CreateTemplateDialog } from "./CreateTemplateDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const ALLOCATION_TYPE_LABELS = {
  originator: "Originador",
  executor: "Ejecutor",
  support: "Soporte",
};

export const AllocationTemplatesManager = () => {
  const { data: templates, isLoading } = useAllocationTemplates();
  const { deleteTemplate } = useAllocationTemplateManagement();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!templateToDelete) return;
    await deleteTemplate.mutateAsync(templateToDelete);
    setTemplateToDelete(null);
  };

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Cargando templates...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Templates de Asignación</h2>
          <p className="text-muted-foreground">
            Patrones reutilizables para asignar ingresos
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Crear Template
        </Button>
      </div>

      {!templates || templates.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">No hay templates creados</p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Crear Primer Template
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <Card key={template.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    {template.description && (
                      <CardDescription className="mt-1 line-clamp-2">
                        {template.description}
                      </CardDescription>
                    )}
                  </div>
                  {template.is_default && (
                    <Badge variant="secondary" className="ml-2">Predeterminado</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {template.revenue_allocation_template_items?.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground truncate flex-1 mr-2">
                        {item.hr_employees?.full_name || item.teams?.name}
                      </span>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge variant="outline" className="font-mono">
                          {item.allocation_percentage}%
                        </Badge>
                        {item.allocation_type && (
                          <Badge variant="secondary" className="text-xs">
                            {ALLOCATION_TYPE_LABELS[item.allocation_type as keyof typeof ALLOCATION_TYPE_LABELS]}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 pt-2 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1"
                    onClick={() => setTemplateToDelete(template.id)}
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Eliminar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreateTemplateDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />

      <AlertDialog open={!!templateToDelete} onOpenChange={() => setTemplateToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar template?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El template será eliminado permanentemente.
              Las asignaciones ya creadas con este template no se verán afectadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
