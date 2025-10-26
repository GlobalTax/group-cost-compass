import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface GeneralInfoTabProps {
  employee: any;
  financials: {
    annualBaseSalary: number;
    monthlyCost: number;
    lastGross: number;
    lastNet: number;
  };
}

const InfoField = ({ label, value }: { label: string; value: string | null | undefined }) => (
  <div className="space-y-1">
    <p className="text-sm text-muted-foreground">{label}</p>
    <p className="text-base font-medium">{value || "—"}</p>
  </div>
);

export const GeneralInfoTab = ({ employee, financials }: GeneralInfoTabProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatDate = (date: string | null) => {
    if (!date) return "—";
    try {
      return format(new Date(date), "dd/MM/yyyy", { locale: es });
    } catch {
      return "—";
    }
  };

  return (
    <div className="space-y-6">
      {/* Datos Personales */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Datos Personales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoField label="DNI/NIE" value={employee.dni} />
            <InfoField label="Número de Seguridad Social" value={employee.nss} />
            <InfoField label="Fecha de Nacimiento" value={formatDate(employee.birth_date)} />
            <InfoField label="Teléfono" value={employee.phone} />
            <InfoField label="Email" value={employee.email} />
            <InfoField label="Dirección" value={employee.address} />
          </div>
        </CardContent>
      </Card>

      {/* Datos Organizativos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Datos Organizativos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoField label="Empresa" value={employee.companies?.name} />
            <InfoField label="Departamento" value={employee.department} />
            <InfoField label="Puesto" value={employee.position} />
            <InfoField label="Tipo de Contrato" value={employee.contract_type} />
            <InfoField label="Fecha de Alta" value={formatDate(employee.hire_date)} />
            <InfoField label="Fecha de Baja" value={formatDate(employee.termination_date)} />
            <InfoField label="Fecha de Antigüedad" value={formatDate(employee.seniority_date)} />
          </div>
        </CardContent>
      </Card>

      {/* Datos Económicos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Datos Económicos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoField label="Salario Base Anual" value={formatCurrency(financials.annualBaseSalary)} />
            <InfoField label="Coste Mensual" value={formatCurrency(financials.monthlyCost)} />
            <InfoField label="Último Bruto Mensual" value={formatCurrency(financials.lastGross)} />
            <InfoField 
              label="Último Neto Mensual" 
              value={financials.lastNet > 0 ? formatCurrency(financials.lastNet) : "—"} 
            />
          </div>
        </CardContent>
      </Card>

      {/* Notas */}
      {employee.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Notas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{employee.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
