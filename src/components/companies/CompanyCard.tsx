import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, TrendingUp, ArrowRightLeft } from "lucide-react";
import { formatCurrency, formatPercentage } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CompanyCardProps {
  id: string;
  name: string;
  nif: string;
  activeEmployees?: number;
  totalBruto?: number;
  totalCoste?: number;
  salaryIncreasePercent?: number;
  transfers?: number;
  color?: string;
}

export const CompanyCard = ({
  id,
  name,
  nif,
  activeEmployees = 0,
  totalBruto = 0,
  totalCoste = 0,
  salaryIncreasePercent = 0,
  transfers = 0,
  color = "bg-primary",
}: CompanyCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/companies/${id}`);
  };
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Card
            className={cn(
              "p-6 border border-border backdrop-blur-sm bg-card/50",
              "hover:shadow-lg hover:scale-[1.02] transition-all duration-300 cursor-pointer",
              "group"
            )}
            onClick={handleClick}
          >
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
                    "group-hover:scale-110 transition-transform duration-300",
                    color
                  )}>
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div className="space-y-1 flex-1">
                    <h3 className="font-bold text-lg leading-tight text-foreground group-hover:text-primary transition-colors">
                      {name}
                    </h3>
                    <p className="text-sm text-muted-foreground">{nif}</p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-success-light text-success border-success/20">
                  Activa
                </Badge>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <p className="text-sm font-medium">Empleados</p>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{activeEmployees}</p>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <TrendingUp className="w-4 h-4" />
                    <p className="text-sm font-medium">% Subida</p>
                  </div>
                  <p className={cn(
                    "text-2xl font-bold",
                    salaryIncreasePercent > 0 ? "text-success" : "text-muted-foreground"
                  )}>
                    {formatPercentage(salaryIncreasePercent)}
                  </p>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span className="text-sm font-medium">Bruto Anual</span>
                  </div>
                  <p className="text-lg font-bold text-foreground">
                    {formatCurrency(totalBruto)}
                  </p>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span className="text-sm font-medium">Coste Anual</span>
                  </div>
                  <p className="text-lg font-bold text-foreground">
                    {formatCurrency(totalCoste)}
                  </p>
                </div>
              </div>

              {/* Transfers indicator */}
              {transfers > 0 && (
                <div className="pt-4 border-t border-border">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ArrowRightLeft className="w-4 h-4" />
                    <span>{transfers} traslado{transfers !== 1 ? 's' : ''} este año</span>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <p>Click para abrir dashboard de <strong>{name}</strong></p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
