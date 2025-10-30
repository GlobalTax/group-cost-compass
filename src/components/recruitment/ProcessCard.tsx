import { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { ProcessDetailDrawer } from './ProcessDetailDrawer';

interface ProcessCardProps {
  process: any;
  isDragging?: boolean;
}

export function ProcessCard({ process, isDragging = false }: ProcessCardProps) {
  const [showDetail, setShowDetail] = useState(false);

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: process.id,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };
  
  const candidateName = process.candidate 
    ? `${process.candidate.first_name} ${process.candidate.last_name}`
    : 'Candidato sin nombre';

  return (
    <>
      <Card ref={setNodeRef} style={style} {...attributes} {...listeners} className="p-4 hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-medium text-sm">{candidateName}</h4>
              <p className="text-xs text-muted-foreground mt-1">
                {process.position_title}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setShowDetail(true)}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>

          {process.department && (
            <Badge variant="outline" className="text-xs">
              {process.department}
            </Badge>
          )}

          {process.priority && (
            <div className="flex gap-1">
              <Badge
                variant={
                  process.priority === 'high'
                    ? 'destructive'
                    : process.priority === 'medium'
                    ? 'default'
                    : 'secondary'
                }
                className="text-xs"
              >
                {process.priority}
              </Badge>
            </div>
          )}

          {process.job_posting && (
            <p className="text-xs text-muted-foreground">
              Vacante: {process.job_posting.title}
            </p>
          )}
        </div>
      </Card>

      {showDetail && (
        <ProcessDetailDrawer
          open={showDetail}
          onOpenChange={setShowDetail}
          processId={process.id}
        />
      )}
    </>
  );
}
