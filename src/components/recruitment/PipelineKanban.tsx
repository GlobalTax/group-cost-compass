import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { useState } from 'react';
import { usePipelineStages, useAllActiveProcesses, useMoveProcess } from '@/hooks/useRecruitmentPipeline';
import { PipelineColumn } from './PipelineColumn';
import { ProcessCard } from './ProcessCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export function PipelineKanban() {
  const { data: stages, isLoading: stagesLoading } = usePipelineStages();
  const { data: processes, isLoading: processesLoading } = useAllActiveProcesses();
  const moveProcess = useMoveProcess();
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  if (stagesLoading || processesLoading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="min-w-[300px] h-[500px]" />
        ))}
      </div>
    );
  }

  if (!stages || stages.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No hay etapas configuradas. Por favor, configura las etapas del pipeline primero.
        </AlertDescription>
      </Alert>
    );
  }

  const processesByStage = processes?.reduce((acc: Record<string, any[]>, process: any) => {
    const stageId = process.current_stage || 'unassigned';
    if (!acc[stageId]) acc[stageId] = [];
    acc[stageId].push(process);
    return acc;
  }, {}) || {};

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) return;

    // over.id is the stage id
    const newStageId = over.id as string;
    const processId = active.id as string;

    moveProcess.mutate({ processId, newStageId });
  };

  const activeProcess = processes?.find((p: any) => p.id === activeId);

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {stages.map((stage: any) => (
          <PipelineColumn
            key={stage.id}
            stage={stage}
            processes={processesByStage[stage.id] || []}
          />
        ))}
      </div>
      <DragOverlay>
        {activeProcess ? <ProcessCard process={activeProcess} isDragging /> : null}
      </DragOverlay>
    </DndContext>
  );
}
