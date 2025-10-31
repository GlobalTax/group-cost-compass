import { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, Plus } from 'lucide-react';
import { useDepartments } from '@/hooks/useDepartments';
import { DepartmentDialog } from '@/components/admin/DepartmentDialog';
import { DepartmentsTable } from '@/components/admin/DepartmentsTable';
import type { Department } from '@/lib/supabase/repositories/departments.repo';

type FilterStatus = 'all' | 'active' | 'inactive';

const AdminDepartments = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('active');

  const { data: departments = [], isLoading } = useDepartments();

  // Filtrar departamentos según estado
  const filteredDepartments = departments.filter((dept) => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'active') return dept.is_active === true;
    if (filterStatus === 'inactive') return dept.is_active === false;
    return true;
  });

  const activeDepartments = departments.filter((d) => d.is_active).length;

  const handleEdit = (department: Department) => {
    setSelectedDepartment(department);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setSelectedDepartment(null);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedDepartment(null);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageHeader
        title="Gestión de Departamentos"
        subtitle="Administra los departamentos de tu organización"
        action={
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Departamento
          </Button>
        }
      />

      {/* KPI Card */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Activos</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeDepartments}</div>
            <p className="text-xs text-muted-foreground">
              de {departments.length} totales
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabla */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Departamentos</CardTitle>
              <CardDescription>
                Lista de departamentos registrados en el sistema
              </CardDescription>
            </div>
            <Select
              value={filterStatus}
              onValueChange={(value) => setFilterStatus(value as FilterStatus)}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Activos</SelectItem>
                <SelectItem value="inactive">Inactivos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Cargando...</div>
          ) : (
            <DepartmentsTable
              departments={filteredDepartments}
              onEdit={handleEdit}
            />
          )}
        </CardContent>
      </Card>

      {/* Dialog */}
      <DepartmentDialog
        open={isDialogOpen}
        onOpenChange={handleCloseDialog}
        department={selectedDepartment}
        orgId="10af28dc-a9b8-4f0a-889e-4732e07df038" // TODO: Get from auth context
      />
    </div>
  );
};

export default AdminDepartments;
