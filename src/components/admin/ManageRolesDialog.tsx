import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAssignRole, useRevokeRole, type UserWithRoles } from '@/hooks/useUserRoles';
import { useCompanies } from '@/hooks/useCompanies';
import { allRoles, roleConfig } from '@/lib/roleUtils';
import type { AppRole } from '@/lib/auth';
import { Loader2, Building2 } from 'lucide-react';

interface ManageRolesDialogProps {
  user: UserWithRoles | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ManageRolesDialog({ user, open, onOpenChange }: ManageRolesDialogProps) {
  const NONE_VALUE = 'none';
  const [selectedRoles, setSelectedRoles] = useState<Set<AppRole>>(new Set());
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const assignRole = useAssignRole();
  const revokeRole = useRevokeRole();
  const { data: companies, isLoading: companiesLoading } = useCompanies();

  useEffect(() => {
    if (user) {
      setSelectedRoles(new Set(user.roles));
      setSelectedOrgId(null); // Reset company selection
    }
  }, [user]);

  if (!user) return null;

  const handleToggleRole = (role: AppRole) => {
    const newSelected = new Set(selectedRoles);
    if (newSelected.has(role)) {
      newSelected.delete(role);
    } else {
      newSelected.add(role);
    }
    setSelectedRoles(newSelected);
  };

  const handleSave = async () => {
    const currentRoles = new Set(user.roles);
    const rolesToAssign = Array.from(selectedRoles).filter((role) => !currentRoles.has(role));
    const rolesToRevoke = Array.from(currentRoles).filter((role) => !selectedRoles.has(role));

    try {
      for (const role of rolesToAssign) {
        await assignRole.mutateAsync({ 
          userId: user.id, 
          role, 
          orgId: selectedOrgId 
        });
      }
      for (const role of rolesToRevoke) {
        await revokeRole.mutateAsync({ userId: user.id, role });
      }
      onOpenChange(false);
    } catch (error) {
      // Errors are handled by the mutation hooks
    }
  };

  const isLoading = assignRole.isPending || revokeRole.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Gestionar Roles</DialogTitle>
          <DialogDescription>
            Usuario: <span className="font-medium text-foreground">{user.email}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Selector de Empresa */}
          <div className="space-y-2">
            <Label htmlFor="company" className="flex items-center gap-2 text-sm font-medium">
              <Building2 className="h-4 w-4" />
              Empresa (opcional)
            </Label>
            <Select
              value={selectedOrgId || NONE_VALUE}
              onValueChange={(value) => setSelectedOrgId(value === NONE_VALUE ? null : value)}
              disabled={isLoading || companiesLoading}
            >
              <SelectTrigger id="company">
                <SelectValue placeholder="Seleccionar empresa..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE_VALUE}>Sin empresa asignada</SelectItem>
                {companies?.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Al asignar nuevos roles, se asociarán a esta empresa
            </p>
          </div>

          {/* Lista de Roles */}
          <div className="space-y-3">
            {allRoles.map((role) => {
              const isSelected = selectedRoles.has(role);
              const config = roleConfig[role];

              return (
                <div key={role} className="flex items-center space-x-3 p-3 rounded-lg border">
                  <Checkbox
                    id={role}
                    checked={isSelected}
                    onCheckedChange={() => handleToggleRole(role)}
                    disabled={isLoading}
                  />
                  <Label
                    htmlFor={role}
                    className="flex items-center gap-2 flex-1 cursor-pointer"
                  >
                    <Badge variant={config.variant}>{config.label}</Badge>
                    {user.roles.includes(role) && (
                      <span className="text-xs text-muted-foreground">(actual)</span>
                    )}
                  </Label>
                </div>
              );
            })}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Guardar Cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
