import { Card } from "@/components/ui/card";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Building2, Users, Euro, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      
      <main className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Estructura del Grupo</h1>
          <p className="text-muted-foreground mt-1">
            Visión consolidada de las empresas del grupo
          </p>
        </div>

        {/* Consolidated Stats */}
        <Card className="glass-elevated p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground font-medium">Empresas Activas</p>
              <p className="text-3xl font-bold">{companies.length}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground font-medium">Empleados Totales</p>
              <p className="text-3xl font-bold">{totalEmployees}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground font-medium">Bruto Consolidado</p>
              <p className="text-3xl font-bold">{formatCurrency(totalBruto)}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground font-medium">Coste Consolidado</p>
              <p className="text-3xl font-bold">{formatCurrency(totalCoste)}</p>
            </div>
          </div>
        </Card>

        {/* Company Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {companies.map((company) => (
            <Card key={company.id} className="glass-card p-6 hover:shadow-elevated transition-all">
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`w-12 h-12 rounded-xl ${company.color} flex items-center justify-center`}>
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-bold text-lg leading-tight">{company.name}</h3>
                      <p className="text-sm text-muted-foreground">{company.nif}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-success text-success">
                    Activa
                  </Badge>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <p className="text-sm font-medium">Empleados</p>
                    </div>
                    <p className="text-2xl font-bold">{company.employees}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <TrendingUp className="w-4 h-4" />
                      <p className="text-sm font-medium">Subida</p>
                    </div>
                    <p className="text-2xl font-bold text-success">{company.subida}%</p>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Euro className="w-4 h-4" />
                      <p className="text-sm font-medium">Bruto Anual</p>
                    </div>
                    <p className="text-xl font-bold">{formatCurrency(company.brutoAnual)}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground">
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
      </main>
    </div>
  );
};

export default Companies;
