import { useState } from 'react';
import { Plus, Building2 } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CompaniesTable } from '@/components/admin/CompaniesTable';
import { CompanyFormDialog } from '@/components/admin/CompanyFormDialog';
import { DeleteCompanyDialog } from '@/components/admin/DeleteCompanyDialog';
import { useCompanies } from '@/hooks/useCompanies';
import { useAuth } from '@/lib/auth';
import type { Company } from '@/lib/supabase/types/enriched';

export default function AdminCompanies() {
  const { data: companies = [], isLoading } = useCompanies();
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  // Get org_id from first available company
  const orgId = companies.length > 0 ? companies[0].org_id : '';

  const handleEdit = (company: Company) => {
    setSelectedCompany(company);
    setShowFormDialog(true);
  };

  const handleDelete = (company: Company) => {
    setSelectedCompany(company);
    setShowDeleteDialog(true);
  };

  const handleCloseFormDialog = () => {
    setShowFormDialog(false);
    setSelectedCompany(null);
  };

  const handleCloseDeleteDialog = () => {
    setShowDeleteDialog(false);
    setSelectedCompany(null);
  };

  const activeCompanies = companies.filter((c) => c.is_active).length;
  const inactiveCompanies = companies.filter((c) => !c.is_active).length;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader
        title="Gestión de Empresas"
        subtitle="Administra las empresas del grupo"
        action={
          <Button onClick={() => setShowFormDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Empresa
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Empresas</CardDescription>
            <CardTitle className="text-3xl">{companies.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Building2 className="h-4 w-4" />
              <span className="text-sm">En el grupo</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Activas</CardDescription>
            <CardTitle className="text-3xl text-success">{activeCompanies}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">Empresas operativas</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Inactivas</CardDescription>
            <CardTitle className="text-3xl text-muted-foreground">
              {inactiveCompanies}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">Empresas pausadas</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Empresas del Grupo</CardTitle>
          <CardDescription>
            Lista completa de empresas con opciones de edición
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Cargando...</div>
          ) : (
            <CompaniesTable
              companies={companies}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </CardContent>
      </Card>

      <CompanyFormDialog
        open={showFormDialog}
        onOpenChange={handleCloseFormDialog}
        company={selectedCompany}
        orgId={orgId}
      />

      <DeleteCompanyDialog
        open={showDeleteDialog}
        onOpenChange={handleCloseDeleteDialog}
        company={selectedCompany}
      />
    </div>
  );
}
