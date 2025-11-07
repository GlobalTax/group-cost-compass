import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Filter, 
  X, 
  Euro, 
  UserCheck, 
  RefreshCw,
  ChevronDown,
  ChevronUp 
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { RevenueFilters as RevenueFiltersType } from "@/lib/utils/revenueGrouping";

interface RevenueFiltersProps {
  filters: RevenueFiltersType;
  onFiltersChange: (filters: RevenueFiltersType) => void;
  totalCount: number;
  filteredCount: number;
}

export const RevenueFilters = ({
  filters,
  onFiltersChange,
  totalCount,
  filteredCount,
}: RevenueFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const hasActiveFilters = 
    filters.amountMin !== null ||
    filters.amountMax !== null ||
    filters.allocationStatus !== 'all' ||
    filters.recurrence !== 'all';
  
  const handleReset = () => {
    onFiltersChange({
      amountMin: null,
      amountMax: null,
      allocationStatus: 'all',
      recurrence: 'all',
    });
  };
  
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CollapsibleTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filtros Avanzados
                {isOpen ? (
                  <ChevronUp className="h-4 w-4 ml-2" />
                ) : (
                  <ChevronDown className="h-4 w-4 ml-2" />
                )}
              </Button>
            </CollapsibleTrigger>
            
            {hasActiveFilters && (
              <>
                <Badge variant="secondary" className="gap-1">
                  {filteredCount} de {totalCount}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  className="h-8 px-2"
                >
                  <X className="h-4 w-4 mr-1" />
                  Limpiar filtros
                </Button>
              </>
            )}
          </div>
        </div>
        
        <CollapsibleContent className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Filtro por rango de importes */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-semibold">
                <Euro className="h-4 w-4" />
                Rango de Importes
              </Label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="amount-min" className="text-xs text-muted-foreground">
                    Mínimo
                  </Label>
                  <Input
                    id="amount-min"
                    type="number"
                    placeholder="0 €"
                    value={filters.amountMin ?? ''}
                    onChange={(e) =>
                      onFiltersChange({
                        ...filters,
                        amountMin: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                    className="h-9"
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor="amount-max" className="text-xs text-muted-foreground">
                    Máximo
                  </Label>
                  <Input
                    id="amount-max"
                    type="number"
                    placeholder="∞"
                    value={filters.amountMax ?? ''}
                    onChange={(e) =>
                      onFiltersChange({
                        ...filters,
                        amountMax: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                    className="h-9"
                  />
                </div>
              </div>
            </div>
            
            {/* Filtro por asignaciones */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-semibold">
                <UserCheck className="h-4 w-4" />
                Estado de Asignación
              </Label>
              <Select
                value={filters.allocationStatus}
                onValueChange={(value: any) =>
                  onFiltersChange({ ...filters, allocationStatus: value })
                }
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    Todos los estados
                  </SelectItem>
                  <SelectItem value="with">
                    ✅ Con asignaciones
                  </SelectItem>
                  <SelectItem value="without">
                    ⚠️ Sin asignaciones
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Filtro por recurrencia */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-semibold">
                <RefreshCw className="h-4 w-4" />
                Tipo de Ingreso
              </Label>
              <Select
                value={filters.recurrence}
                onValueChange={(value: any) =>
                  onFiltersChange({ ...filters, recurrence: value })
                }
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    Todos los tipos
                  </SelectItem>
                  <SelectItem value="recurring">
                    🔄 Solo recurrentes
                  </SelectItem>
                  <SelectItem value="one-time">
                    📅 Solo puntuales
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Resumen de filtros activos */}
          {hasActiveFilters && (
            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Filtros activos:</p>
              <div className="flex flex-wrap gap-2">
                {filters.amountMin !== null && (
                  <Badge variant="outline">
                    Mín: {filters.amountMin.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                  </Badge>
                )}
                {filters.amountMax !== null && (
                  <Badge variant="outline">
                    Máx: {filters.amountMax.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                  </Badge>
                )}
                {filters.allocationStatus !== 'all' && (
                  <Badge variant="outline">
                    {filters.allocationStatus === 'with' ? '✅ Con asignaciones' : '⚠️ Sin asignaciones'}
                  </Badge>
                )}
                {filters.recurrence !== 'all' && (
                  <Badge variant="outline">
                    {filters.recurrence === 'recurring' ? '🔄 Recurrentes' : '📅 Puntuales'}
                  </Badge>
                )}
              </div>
            </div>
          )}
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};
