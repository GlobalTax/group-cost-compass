import { FileX } from "lucide-react";

interface EmptyStateProps {
  message: string;
}

export const EmptyState = ({ message }: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
      <FileX className="w-8 h-8 text-muted-foreground" />
    </div>
    <p className="text-lg font-medium text-foreground">{message}</p>
    <p className="text-sm text-muted-foreground mt-2">
      Intenta seleccionar otro periodo o importar datos
    </p>
  </div>
);
