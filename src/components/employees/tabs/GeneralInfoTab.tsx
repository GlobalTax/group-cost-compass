import { format } from "date-fns";
import { es } from "date-fns/locale";
import { EditableSection, FieldDefinition } from "./EditableSection";
import { useEmployeeUpdate } from "@/hooks/useEmployeeUpdate";
import { useUpdateEmployeeCost } from "@/hooks/useEmployeeCosts";
import { formatCurrency } from "@/lib/formatters";

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
    { name: "department", label: "Departamento", value: employee.department, type: "text", placeholder: "Recursos Humanos" },
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

  const handleSavePersonalData = async (data: Record<string, any>) => {
    return await updateFields(data);
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
        isLoading={isUpdating}
      />

      {/* Datos Económicos - Editable */}
      <EditableSection
        title="Datos Económicos"
        fields={economicDataFields}
        onSave={handleSaveEconomicData}
        isLoading={isUpdatingCost}
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
    </div>
  );
};
