import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface InfoTooltipProps {
  content: string;
  side?: "top" | "right" | "bottom" | "left";
  className?: string;
}

/**
 * Tooltip informativo con icono (ℹ️) 
 * Para usar en formularios sin saturar la UI
 */
export const InfoTooltip = ({ 
  content, 
  side = "right",
  className 
}: InfoTooltipProps) => {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={cn(
              "inline-flex items-center justify-center",
              "text-muted-foreground hover:text-foreground",
              "transition-colors",
              className
            )}
            onClick={(e) => e.preventDefault()}
          >
            <Info className="h-4 w-4" />
            <span className="sr-only">Información</span>
          </button>
        </TooltipTrigger>
        <TooltipContent 
          side={side}
          className="max-w-xs text-sm"
        >
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
