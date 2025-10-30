import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import type { OnboardingFilters } from '@/lib/validators/onboardingSchema';

interface OnboardingFiltersProps {
  filters: OnboardingFilters;
  onFiltersChange: (filters: OnboardingFilters) => void;
}

export function OnboardingFilters({ filters, onFiltersChange }: OnboardingFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por email o puesto..."
          value={filters.search || ''}
          onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
          className="pl-9"
        />
      </div>

      <Select
        value={filters.status || 'all'}
        onValueChange={(value) => onFiltersChange({ ...filters, status: value as any })}
      >
        <SelectTrigger className="w-full sm:w-48">
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="pending">Pendiente</SelectItem>
          <SelectItem value="in_progress">En Progreso</SelectItem>
          <SelectItem value="completed">Completado</SelectItem>
          <SelectItem value="expired">Expirado</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
