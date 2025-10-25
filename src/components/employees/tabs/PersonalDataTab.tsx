import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Building2, FileText, Clock, IdCard } from "lucide-react";
import { formatDate } from "@/lib/formatters";

interface PersonalDataTabProps {
  employee: {
    hire_date: string;
    termination_date?: string | null;
    dni?: string | null;
    seniority_date?: string | null;
    companies?: { name: string } | null;
    notes?: string | null;
  };
}

export const PersonalDataTab = ({ employee }: PersonalDataTabProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-primary mt-0.5" />
            <div className="flex-1">
              <p className="text-xs text-foreground font-medium mb-1">Fecha de Alta</p>
              <p className="text-base font-semibold text-foreground">
                {formatDate(employee.hire_date)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-destructive mt-0.5" />
            <div className="flex-1">
              <p className="text-xs text-foreground font-medium mb-1">Fecha de Baja</p>
              <p className="text-base font-semibold text-foreground">
                {employee.termination_date ? formatDate(employee.termination_date) : "—"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <IdCard className="w-5 h-5 text-primary mt-0.5" />
            <div className="flex-1">
              <p className="text-xs text-foreground font-medium mb-1">DNI</p>
              <p className="text-base font-semibold text-foreground">
                {employee.dni || "—"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-primary mt-0.5" />
            <div className="flex-1">
              <p className="text-xs text-foreground font-medium mb-1">Antigüedad</p>
              <p className="text-base font-semibold text-foreground">
                {employee.seniority_date ? formatDate(employee.seniority_date) : "—"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Building2 className="w-5 h-5 text-primary mt-0.5" />
            <div className="flex-1">
              <p className="text-xs text-foreground font-medium mb-1">Empresa Actual</p>
              <p className="text-base font-semibold text-foreground">
                {employee.companies?.name || "—"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {employee.notes && (
        <Card className="md:col-span-2">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-primary mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-foreground font-medium mb-2">Notas</p>
                <p className="text-sm text-foreground leading-relaxed">
                  {employee.notes}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
