import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";

interface ImportProgressProps {
  current: number;
  total: number;
  status: "processing" | "uploading" | "complete";
}

export const ImportProgress = ({ current, total, status }: ImportProgressProps) => {
  const percentage = total > 0 ? (current / total) * 100 : 0;

  const statusText = {
    processing: "Procesando archivo...",
    uploading: "Importando datos...",
    complete: "Importación completada",
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        {status !== "complete" && (
          <Loader2 className="w-5 h-5 text-primary animate-spin" />
        )}
        <div className="flex-1">
          <p className="text-sm font-medium">{statusText[status]}</p>
          <p className="text-xs text-muted-foreground">
            {current} de {total} registros
          </p>
        </div>
      </div>
      
      <Progress value={percentage} className="h-2" />
    </div>
  );
};
