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
  const ALL_COMPANIES = 'all';
  const [selectedRoles, setSelectedRoles] = useState<Set<AppRole>>(new Set());
  const [selectedOrgIds, setSelectedOrgIds] = useState<Set<string>>(new Set());
  const assignRole = useAssignRole();
  const revokeRole = useRevokeRole();
  const { data: companies, isLoading: companiesLoading } = useCompanies();

  useEffect(() => {
    if (user) {
      setSelectedRoles(new Set(user.roles));
      setSelectedOrgIds(new Set()); // Reset company selection
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

  const handleToggleCompany = (companyId: string) => {
    const newSelected = new Set(selectedOrgIds);
    
    if (companyId === ALL_COMPANIES) {
      if (newSelected.has(ALL_COMPANIES)) {
        newSelected.clear();
      } else {
        newSelected.clear();
        newSelected.add(ALL_COMPANIES);
        companies?.forEach(c => newSelected.add(c.id));
      }
    } else {
      if (newSelected.has(companyId)) {
        newSelected.delete(companyId);
        newSelected.delete(ALL_COMPANIES);
      } else {
        newSelected.add(companyId);
        if (companies && newSelected.size === companies.length) {
          newSelected.add(ALL_COMPANIES);
        }
      }
    }
    
    setSelectedOrgIds(newSelected);
  };

  const handleSave = async () => {
    const currentRoles = new Set(user.roles);
    const rolesToAssign = Array.from(selectedRoles).filter((role) => !currentRoles.has(role));
    const rolesToRevoke = Array.from(currentRoles).filter((role) => !selectedRoles.has(role));

    try {
      // Asignar cada rol nuevo
      for (const role of rolesToAssign) {
        // Si no hay empresas seleccionadas, asignar con org_id = null
        if (selectedOrgIds.size === 0) {
          await assignRole.mutateAsync({ 
            userId: user.id, 
            role, 
            orgId: null 
          });
        } else {
          // Asignar a cada empresa seleccionada (excluyendo ALL_COMPANIES)
          const orgIdsArray = Array.from(selectedOrgIds).filter(
            id => id !== ALL_COMPANIES
          );
          
          for (const orgId of orgIdsArray) {
            await assignRole.mutateAsync({ 
              userId: user.id, 
              role, 
              orgId 
            });
          }
        }
      }

      // Revocar roles (global, de todas las empresas)
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
          {/* Selector de Empresas (Múltiple) */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Building2 className="h-4 w-4" />
              Empresas (opcional)
            </Label>
            <div className="space-y-2 max-h-[200px] overflow-y-auto border rounded-lg p-3">
              {/* Opción: Todas las empresas */}
              <div className="flex items-center space-x-3 p-2 rounded-md hover:bg-accent/50">
                <Checkbox
                  id={ALL_COMPANIES}
                  checked={selectedOrgIds.has(ALL_COMPANIES)}
                  onCheckedChange={() => handleToggleCompany(ALL_COMPANIES)}
                  disabled={isLoading || companiesLoading}
                />
                <Label htmlFor={ALL_COMPANIES} className="flex-1 cursor-pointer font-medium">
                  Todas las empresas
                </Label>
              </div>

              {/* Lista de empresas individuales */}
              {companiesLoading ? (
                <p className="text-sm text-muted-foreground p-2">Cargando empresas...</p>
              ) : (
                companies?.map((company) => (
                  <div key={company.id} className="flex items-center space-x-3 p-2 rounded-md hover:bg-accent/50">
                    <Checkbox
                      id={company.id}
                      checked={selectedOrgIds.has(company.id)}
                      onCheckedChange={() => handleToggleCompany(company.id)}
                      disabled={isLoading}
                    />
                    <Label htmlFor={company.id} className="flex-1 cursor-pointer text-sm">
                      {company.name}
                    </Label>
                  </div>
                ))
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {selectedOrgIds.size === 0 
                ? 'Sin empresa seleccionada (roles globales)'
                : selectedOrgIds.has(ALL_COMPANIES)
                ? `Todas las empresas seleccionadas (${companies?.length || 0})`
                : `${selectedOrgIds.size} empresa(s) seleccionada(s)`
              }
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
