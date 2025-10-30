import { useState } from 'react';
import {
  usePipelineStages,
  useCreatePipelineStage,
  useUpdatePipelineStage,
  useDeletePipelineStage,
} from '@/hooks/useRecruitmentPipeline';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ConfigurePipelineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ConfigurePipelineDialog({ open, onOpenChange }: ConfigurePipelineDialogProps) {
  const { data: stages, isLoading } = usePipelineStages();
  const createStage = useCreatePipelineStage();
  const updateStage = useUpdatePipelineStage();
  const deleteStage = useDeletePipelineStage();

  const [newStageName, setNewStageName] = useState('');
  const [newStageColor, setNewStageColor] = useState('#6366f1');

  const handleCreateStage = async () => {
    if (!newStageName.trim()) return;
    
    await createStage.mutateAsync({
      name: newStageName,
      color: newStageColor,
      sort_order: (stages?.length || 0),
    });
    
    setNewStageName('');
    setNewStageColor('#6366f1');
  };

  const handleDeleteStage = async (id: string) => {
    if (!confirm('¿Eliminar esta etapa? Los procesos asociados quedarán sin etapa.')) return;
    await deleteStage.mutateAsync(id);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Configurar Etapas del Pipeline</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Create new stage */}
          <div className="space-y-3">
            <Label>Nueva Etapa</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Nombre de la etapa"
                value={newStageName}
                onChange={(e) => setNewStageName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateStage()}
              />
              <input
                type="color"
                value={newStageColor}
                onChange={(e) => setNewStageColor(e.target.value)}
                className="w-16 h-10 border rounded cursor-pointer"
              />
              <Button onClick={handleCreateStage} disabled={createStage.isPending}>
                <Plus className="h-4 w-4 mr-1" />
                Añadir
              </Button>
            </div>
          </div>

          {/* Existing stages */}
          <div className="space-y-3">
            <Label>Etapas Actuales</Label>
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : stages && stages.length > 0 ? (
              <div className="space-y-2">
                {stages.map((stage: any) => (
                  <div
                    key={stage.id}
                    className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30"
                  >
                    <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: stage.color || '#6366f1' }}
                    />
                    <span className="flex-1 font-medium">{stage.name}</span>
                    <Badge variant="secondary">Orden: {stage.sort_order}</Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteStage(stage.id)}
                      disabled={deleteStage.isPending}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-sm text-muted-foreground">
                No hay etapas configuradas
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cerrar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
