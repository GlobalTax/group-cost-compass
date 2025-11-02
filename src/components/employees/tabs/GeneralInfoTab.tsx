import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { EditableSection, FieldDefinition } from "./EditableSection";
import { useEmployeeUpdate } from "@/hooks/useEmployeeUpdate";
import { useUpdateEmployeeCost } from "@/hooks/useEmployeeCosts";
import { formatCurrency } from "@/lib/formatters";
import { useDepartments } from "@/hooks/useDepartments";
import { useTeams } from "@/hooks/useTeams";
import { useCompanies } from "@/hooks/useCompanies";
import { ConfirmCompanyChangeDialog } from "../ConfirmCompanyChangeDialog";

const EMPLOYMENT_STATUS_OPTIONS = [
  { value: 'active', label: '✅ Activo' },
  { value: 'leave_of_absence', label: '🏖️ Excedencia' },
  { value: 'maternity_leave', label: '👶 Baja Maternal' },
  { value: 'paternity_leave', label: '👨‍👦 Baja Paternal' },
  { value: 'medical_leave', label: '🏥 Baja Médica' },
  { value: 'sabbatical', label: '🌍 Sabático' },
  { value: 'unpaid_leave', label: '⏸️ Permiso sin sueldo' },
  { value: 'suspended', label: '⚠️ Suspendido' },
  { value: 'terminated', label: '❌ Finalizado' },
];

const LEAVE_STATUSES = [
  'leave_of_absence',
  'maternity_leave',
  'paternity_leave',
  'medical_leave',
  'sabbatical',
  'unpaid_leave',
  'suspended'
];

interface GeneralInfoTabProps {
  employee: any;
  financials: {
    annualBaseSalary: number;
    monthlyCost: number;
    lastGross: number;
    lastNet: number;
  };
  latestCost?: {
    id: string;
    period: string;
    bruto: number;
    coste_empresa: number;
  } | null;
}

const InfoField = ({ label, value }: { label: string; value: string | null | undefined }) => (
  <div className="space-y-1">
    <p className="text-sm text-muted-foreground">{label}</p>
    <p className="text-base font-medium">{value || "—"}</p>
  </div>
);

export const GeneralInfoTab = ({ employee, financials, latestCost }: GeneralInfoTabProps) => {
  const { updateFields, isUpdating } = useEmployeeUpdate(employee.id);
  const { mutateAsync: updateCost, isPending: isUpdatingCost } = useUpdateEmployeeCost();
  const { data: departments } = useDepartments();
  const { data: teams } = useTeams({ departmentId: employee.department_id || undefined });
  const { data: companies } = useCompanies();
  
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingCompanyChange, setPendingCompanyChange] = useState<{
    fromCompanyId: string;
    toCompanyId: string;
    resolver: (confirmed: boolean) => void;
  } | null>(null);

  const formatDate = (date: string | null) => {
    if (!date) return "—";
    try {
      return format(new Date(date), "dd/MM/yyyy", { locale: es });
    } catch {
      return "—";
    }
  };

  const personalDataFields: FieldDefinition[] = [
    { name: "dni", label: "DNI/NIE", value: employee.dni, type: "text", placeholder: "12345678A" },
    { name: "nss", label: "Número de Seguridad Social", value: employee.nss, type: "text", placeholder: "12345678901" },
    { name: "birth_date", label: "Fecha de Nacimiento", value: employee.birth_date, type: "date" },
    { name: "phone", label: "Teléfono", value: employee.phone, type: "tel", placeholder: "+34 600 000 000" },
    { name: "email", label: "Email", value: employee.email, type: "email", placeholder: "email@ejemplo.com" },
    { name: "address", label: "Dirección", value: employee.address, type: "textarea", placeholder: "Calle, número, ciudad..." },
  ];

  const organizationalDataFields: FieldDefinition[] = [
    { 
      name: "company_id", 
      label: "Empresa", 
      value: employee.company_id, 
      type: "select",
      options: companies?.map(c => ({ value: c.id, label: c.name })) || [],
      requiresConfirmation: true,
      description: "⚠️ Cambiar solo para correcciones administrativas. Para traslados formales usa la pestaña 'Traslados'."
    },
    { 
      name: "department_id", 
      label: "Departamento", 
      value: employee.department_id, 
      type: "select",
      options: departments?.map(d => ({ value: d.id, label: d.name })) || []
    },
    { 
      name: "team_id", 
      label: "Equipo", 
      value: employee.team_id, 
      type: "select",
      options: teams?.map(t => ({ value: t.id, label: t.name })) || []
    },
    { name: "position", label: "Puesto", value: employee.position, type: "text", placeholder: "Analista" },
    { name: "contract_type", label: "Tipo de Contrato", value: employee.contract_type, type: "text", placeholder: "Laboral" },
    { name: "hire_date", label: "Fecha de Alta", value: employee.hire_date, type: "date" },
    { name: "termination_date", label: "Fecha de Baja", value: employee.termination_date, type: "date" },
    { name: "seniority_date", label: "Fecha de Antigüedad", value: employee.seniority_date, type: "date" },
  ];

  const brutoAnual = latestCost?.bruto ? latestCost.bruto * 12 : 0;

  const economicDataFields: FieldDefinition[] = [
    { 
      name: "period", 
      label: "Período (último registrado)", 
      value: latestCost?.period || "—", 
      type: "text", 
      disabled: true 
    },
    { 
      name: "bruto_anual", 
      label: "Bruto Anual", 
      value: formatCurrency(brutoAnual), 
      type: "text", 
      disabled: true 
    },
    { 
      name: "bruto", 
      label: "Bruto Mensual", 
      value: latestCost?.bruto?.toString() || "0", 
      type: "number", 
      placeholder: "3500" 
    },
    { 
      name: "coste_empresa", 
      label: "Coste Empresa", 
      value: latestCost?.coste_empresa?.toString() || "0", 
      type: "number", 
      placeholder: "4200" 
    },
  ];

  const employmentStatusFields: FieldDefinition[] = [
    {
      name: "employment_status",
      label: "Estado",
      value: employee.employment_status || 'active',
      type: "select",
      options: EMPLOYMENT_STATUS_OPTIONS,
      description: "Estado actual del empleado en la organización"
    },
    // Campos condicionales solo si hay ausencia
    ...(LEAVE_STATUSES.includes(employee.employment_status || 'active') ? [
      {
        name: "leave_start_date",
        label: "Fecha de inicio",
        value: employee.leave_start_date || "",
        type: "date" as const,
        description: "Fecha en la que comenzó la ausencia"
      },
      {
        name: "leave_end_date",
        label: "Fecha estimada de retorno",
        value: employee.leave_end_date || "",
        type: "date" as const,
        description: "Dejar vacío si la fecha es indefinida"
      },
      {
        name: "leave_reason",
        label: "Motivo/Notas",
        value: employee.leave_reason || "",
        type: "textarea" as const,
        placeholder: "Información adicional sobre la ausencia...",
        description: "Detalles internos sobre la situación"
      }
    ] : [])
  ];

  const handleSavePersonalData = async (data: Record<string, any>) => {
    return await updateFields(data);
  };

  const handleConfirmationRequired = async (
    fieldName: string,
    oldValue: any,
    newValue: any
  ): Promise<boolean> => {
    if (fieldName === "company_id") {
      return new Promise((resolve) => {
        setPendingCompanyChange({
          fromCompanyId: oldValue,
          toCompanyId: newValue,
          resolver: resolve,
        });
        setConfirmDialogOpen(true);
      });
    }
    return true;
  };

  const handleSaveOrganizationalData = async (data: Record<string, any>) => {
    return await updateFields(data);
  };

  const handleSaveEconomicData = async (data: Record<string, any>) => {
    if (!latestCost?.id) return false;
    
    const updates: any = {};
    if (data.bruto) updates.bruto = parseFloat(data.bruto);
    if (data.coste_empresa) updates.coste_empresa = parseFloat(data.coste_empresa);
    
    await updateCost({ id: latestCost.id, updates });
    return true;
  };

  const handleSaveEmploymentStatus = async (data: Record<string, any>) => {
    // Si cambia a 'active', limpiar campos de ausencia
    if (data.employment_status === 'active') {
      data.leave_start_date = null;
      data.leave_end_date = null;
      data.leave_reason = null;
    }
    
    // Si cambia a 'terminated', actualizar termination_date
    if (data.employment_status === 'terminated' && !employee.termination_date) {
      data.termination_date = new Date().toISOString().split('T')[0];
    }
    
    return await updateFields(data);
  };

  return (
    <div className="space-y-6">
      {/* Datos Personales - Editable */}
      <EditableSection
        title="Datos Personales"
        fields={personalDataFields}
        onSave={handleSavePersonalData}
        isLoading={isUpdating}
      />

      {/* Datos Organizativos - Editable */}
      <EditableSection
        title="Datos Organizativos"
        fields={organizationalDataFields}
        onSave={handleSaveOrganizationalData}
        onConfirmationRequired={handleConfirmationRequired}
        isLoading={isUpdating}
      />

      {/* Datos Económicos - Editable */}
      <EditableSection
        title="Datos Económicos"
        fields={economicDataFields}
        onSave={handleSaveEconomicData}
        isLoading={isUpdatingCost}
      />

      {/* Estado de Empleo - Editable */}
      <EditableSection
        title="Estado de Empleo"
        fields={employmentStatusFields}
        onSave={handleSaveEmploymentStatus}
        isLoading={isUpdating}
      />

      {/* Notas - Editable */}
      {(employee.notes || true) && (
        <EditableSection
          title="Notas"
          fields={[
            { 
              name: "notes", 
              label: "Notas adicionales", 
              value: employee.notes, 
              type: "textarea",
              placeholder: "Información adicional sobre el empleado..."
            }
          ]}
          onSave={async (data) => await updateFields(data)}
          isLoading={isUpdating}
        />
      )}

      {/* Diálogo de confirmación de cambio de empresa */}
      {pendingCompanyChange && (
        <ConfirmCompanyChangeDialog
          open={confirmDialogOpen}
          onOpenChange={(open) => {
            if (!open && pendingCompanyChange) {
              pendingCompanyChange.resolver(false);
              setPendingCompanyChange(null);
            }
            setConfirmDialogOpen(open);
          }}
          employeeName={employee.full_name}
          fromCompanyName={
            companies?.find(c => c.id === pendingCompanyChange.fromCompanyId)?.name || "Desconocida"
          }
          toCompanyName={
            companies?.find(c => c.id === pendingCompanyChange.toCompanyId)?.name || "Desconocida"
          }
          onConfirm={(reason) => {
            // Guardar motivo para usar en auditoría
            (window as any).__companyChangeReason = reason;
            pendingCompanyChange.resolver(true);
            setPendingCompanyChange(null);
          }}
        />
      )}
    </div>
  );
};
