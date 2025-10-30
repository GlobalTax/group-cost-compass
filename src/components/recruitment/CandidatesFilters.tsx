import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search } from 'lucide-react';
import type { CandidateFilters } from '@/lib/validators/candidateSchema';

interface CandidatesFiltersProps {
  filters: CandidateFilters;
  onFiltersChange: (filters: CandidateFilters) => void;
}

export function CandidatesFilters({ filters, onFiltersChange }: CandidatesFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar candidatos..."
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
          <SelectItem value="new">Nuevo</SelectItem>
          <SelectItem value="screening">En revisión</SelectItem>
          <SelectItem value="interviewing">Entrevistando</SelectItem>
          <SelectItem value="offer">Oferta</SelectItem>
          <SelectItem value="hired">Contratado</SelectItem>
          <SelectItem value="rejected">Rechazado</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.source || 'all'}
        onValueChange={(value) =>
          onFiltersChange({ ...filters, source: value === 'all' ? undefined : value })
        }
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Fuente" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas</SelectItem>
          <SelectItem value="linkedin">LinkedIn</SelectItem>
          <SelectItem value="web">Web</SelectItem>
          <SelectItem value="referral">Referido</SelectItem>
          <SelectItem value="agency">Agencia</SelectItem>
          <SelectItem value="other">Otro</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
