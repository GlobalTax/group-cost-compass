import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search } from 'lucide-react';
import type { JobPostingFilters } from '@/lib/validators/jobPostingSchema';

interface JobPostingsFiltersProps {
  filters: JobPostingFilters;
  onFiltersChange: (filters: JobPostingFilters) => void;
}

export function JobPostingsFilters({ filters, onFiltersChange }: JobPostingsFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar vacantes..."
          value={filters.search || ''}
          onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
          className="pl-9"
        />
      </div>

      <Select
        value={filters.status || 'all'}
        onValueChange={(value) =>
          onFiltersChange({ ...filters, status: value === 'all' ? undefined : value as any })
        }
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="draft">Borrador</SelectItem>
          <SelectItem value="published">Publicado</SelectItem>
          <SelectItem value="closed">Cerrado</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.employment_type || 'all'}
        onValueChange={(value) =>
          onFiltersChange({ ...filters, employment_type: value === 'all' ? undefined : value })
        }
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Tipo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="full-time">Tiempo completo</SelectItem>
          <SelectItem value="part-time">Medio tiempo</SelectItem>
          <SelectItem value="contract">Contrato</SelectItem>
          <SelectItem value="internship">Prácticas</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
