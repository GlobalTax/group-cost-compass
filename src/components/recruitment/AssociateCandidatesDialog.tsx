import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCandidates } from '@/hooks/useCandidates';
import { useAssociateCandidates } from '@/hooks/useJobOfferCandidates';
import { Search } from 'lucide-react';

interface AssociateCandidatesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobOfferId: string;
  jobOfferTitle: string;
}

export function AssociateCandidatesDialog({
  open,
  onOpenChange,
  jobOfferId,
  jobOfferTitle,
}: AssociateCandidatesDialogProps) {
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: candidates, isLoading } = useCandidates({ search: searchTerm });
  const associateMutation = useAssociateCandidates();

  const handleToggleCandidate = (candidateId: string) => {
    setSelectedCandidateIds((prev) =>
      prev.includes(candidateId)
        ? prev.filter((id) => id !== candidateId)
        : [...prev, candidateId]
    );
  };

  const handleAssociate = async () => {
    if (selectedCandidateIds.length === 0) return;
    
    await associateMutation.mutateAsync({
      jobOfferId,
      candidateIds: selectedCandidateIds,
    });
    
    setSelectedCandidateIds([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Asociar Candidatos a: {jobOfferTitle}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar candidatos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <ScrollArea className="h-[400px] rounded-md border p-4">
            {isLoading && <p className="text-sm text-muted-foreground">Cargando...</p>}
            
            {!isLoading && candidates?.length === 0 && (
              <p className="text-sm text-muted-foreground">No se encontraron candidatos</p>
            )}

            <div className="space-y-3">
              {candidates?.map((candidate) => (
                <div
                  key={candidate.id}
                  className="flex items-start space-x-3 rounded-lg border p-3 hover:bg-accent"
                >
                  <Checkbox
                    id={candidate.id}
                    checked={selectedCandidateIds.includes(candidate.id)}
                    onCheckedChange={() => handleToggleCandidate(candidate.id)}
                  />
                  <div className="flex-1">
                    <Label
                      htmlFor={candidate.id}
                      className="cursor-pointer font-medium"
                    >
                      {candidate.first_name} {candidate.last_name}
                    </Label>
                    <p className="text-sm text-muted-foreground">{candidate.email}</p>
                    {candidate.current_position && (
                      <p className="text-xs text-muted-foreground">
                        {candidate.current_position} - {candidate.current_company}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="text-sm text-muted-foreground">
            {selectedCandidateIds.length} candidato(s) seleccionado(s)
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleAssociate}
            disabled={selectedCandidateIds.length === 0 || associateMutation.isPending}
          >
            {associateMutation.isPending ? 'Asociando...' : 'Asociar Candidatos'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
