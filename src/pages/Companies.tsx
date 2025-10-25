import { Card } from "@/components/ui/card";
import { Building2, Users, Euro, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/PageHeader";

const companies = [
  {
    id: 1,
    name: "Navarro Legal y Tributario, SLP",
    nif: "B67261552",
    employees: 18,
    brutoAnual: 756000,
    costeAnual: 952560,
    subida: 8.5,
    color: "bg-blue-500",
  },
  {
    id: 2,
    name: "Beglobal Worldwide, SL",
    nif: "B09835315",
    employees: 15,
    brutoAnual: 525000,
    costeAnual: 661500,
    subida: 7.2,
    color: "bg-purple-500",
  },
  {
    id: 3,
    name: "GoLooper, SL",
    nif: "B02721918",
    employees: 6,
    brutoAnual: 210000,
    costeAnual: 264600,
    subida: 9.1,
    color: "bg-green-500",
  },
  {
    id: 4,
    name: "SPV Corporate Advisor, SL",
    nif: "B09652017",
    employees: 4,
    brutoAnual: 168000,
    costeAnual: 211680,
    subida: 6.8,
    color: "bg-orange-500",
  },
];

const Companies = () => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const totalEmployees = companies.reduce((sum, c) => sum + c.employees, 0);
  const totalBruto = companies.reduce((sum, c) => sum + c.brutoAnual, 0);
  const totalCoste = companies.reduce((sum, c) => sum + c.costeAnual, 0);

  return (
    <div className="p-8 space-y-6">
      <PageHeader
        title="Empresas"
        subtitle="Estructura del grupo empresarial"
      />

      {/* Consolidated Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 border-gray-200">
          <div className="space-y-2">
            <p className="text-sm text-foreground">Empresas Activas</p>
            <p className="text-4xl font-bold">{companies.length}</p>
          </div>
        </Card>
        <Card className="p-6 border-gray-200">
          <div className="space-y-2">
            <p className="text-sm text-foreground">Empleados Totales</p>
            <p className="text-4xl font-bold">{totalEmployees}</p>
          </div>
        </Card>
        <Card className="p-6 border-gray-200">
          <div className="space-y-2">
            <p className="text-sm text-foreground">Bruto Consolidado</p>
            <p className="text-4xl font-bold">{formatCurrency(totalBruto)}</p>
          </div>
        </Card>
        <Card className="p-6 border-gray-200">
          <div className="space-y-2">
            <p className="text-sm text-foreground">Coste Consolidado</p>
            <p className="text-4xl font-bold">{formatCurrency(totalCoste)}</p>
          </div>
        </Card>
      </div>

      {/* Company Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {companies.map((company) => (
          <Card key={company.id} className="p-6 border-gray-200 hover:shadow-md transition-shadow">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`w-12 h-12 rounded-xl ${company.color} flex items-center justify-center flex-shrink-0`}>
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-lg leading-tight">{company.name}</h3>
                    <p className="text-sm text-foreground">{company.nif}</p>
                  </div>
                </div>
                <Badge variant="success">
                  Activa
                </Badge>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-foreground">
                    <Users className="w-4 h-4" />
                    <p className="text-sm font-medium">Empleados</p>
                  </div>
                  <p className="text-2xl font-bold">{company.employees}</p>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-foreground">
                    <TrendingUp className="w-4 h-4" />
                    <p className="text-sm font-medium">Subida</p>
                  </div>
                  <p className="text-2xl font-bold text-success">{company.subida}%</p>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-foreground">
                    <Euro className="w-4 h-4" />
                    <p className="text-sm font-medium">Bruto Anual</p>
                  </div>
                  <p className="text-xl font-bold">{formatCurrency(company.brutoAnual)}</p>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-foreground">
                    <Euro className="w-4 h-4" />
                    <p className="text-sm font-medium">Coste Anual</p>
                  </div>
                  <p className="text-xl font-bold">{formatCurrency(company.costeAnual)}</p>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Companies;
