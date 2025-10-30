import { ProcessCard } from './ProcessCard';
import { Badge } from '@/components/ui/badge';

interface PipelineColumnProps {
  stage: {
    id: string;
    name: string;
    color?: string;
    icon?: string;
  };
  processes: any[];
}

export function PipelineColumn({ stage, processes }: PipelineColumnProps) {
  return (
    <div className="min-w-[320px] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border rounded-t-lg bg-muted">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: stage.color || '#6366f1' }}
          />
          <h3 className="font-semibold text-sm">{stage.name}</h3>
          <Badge variant="secondary" className="text-xs">
            {processes.length}
          </Badge>
        </div>
      </div>

      {/* Cards */}
      <div className="flex-1 p-3 space-y-3 border border-t-0 rounded-b-lg bg-background overflow-y-auto max-h-[600px]">
        {processes.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground">
            Sin candidatos
          </div>
        ) : (
          processes.map((process) => (
            <ProcessCard key={process.id} process={process} />
          ))
        )}
      </div>
    </div>
  );
}
