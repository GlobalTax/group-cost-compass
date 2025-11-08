import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Company {
  id: string;
  name: string;
  activeEmployees?: number;
}

interface CompanyOrgChartProps {
  companies: Company[];
  onCompanyClick?: (companyId: string) => void;
}

export const CompanyOrgChart = ({ companies, onCompanyClick }: CompanyOrgChartProps) => {
  const navigate = useNavigate();
  
  const colors = [
    "bg-primary",
    "bg-purple",
    "bg-success",
    "bg-warning",
  ];

  const handleCompanyClick = (companyId: string) => {
    if (onCompanyClick) {
      onCompanyClick(companyId);
    } else {
      navigate(`/companies/${companyId}`);
    }
  };

  return (
    <Card className="p-8 border border-border backdrop-blur-sm bg-card/50">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Estructura Corporativa
          </h3>
          <p className="text-sm text-muted-foreground">
            Ecosistema de empresas del grupo
          </p>
        </div>

        {/* Org Chart Visualization */}
        <div className="relative">
          {/* Central Hub */}
          <div className="flex justify-center mb-12">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-primary flex items-center justify-center shadow-lg">
                <div className="text-center text-white">
                  <Building2 className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-xs font-bold">GRUPO</p>
                  <p className="text-lg font-bold">{companies.length}</p>
                </div>
              </div>
              {/* Connection lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ top: '100%', height: '100px' }}>
                {companies.map((_, index) => {
                  const totalCompanies = companies.length;
                  const angle = (index * 360) / totalCompanies - 90;
                  const radian = (angle * Math.PI) / 180;
                  const x1 = 64; // center of hub
                  const y1 = 0;
                  const x2 = x1 + Math.cos(radian) * 150;
                  const y2 = y1 + Math.sin(radian) * 150;
                  
                  return (
                    <line
                      key={index}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke="hsl(var(--border))"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                    />
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Company Nodes */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {companies.map((company, index) => (
              <div
                key={company.id}
                className="group cursor-pointer"
                onClick={() => handleCompanyClick(company.id)}
              >
                <div
                  className={cn(
                    "p-4 rounded-lg border border-border",
                    "bg-card hover:bg-accent transition-all duration-300",
                    "hover:shadow-md hover:scale-105"
                  )}
                >
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center",
                      colors[index % colors.length]
                    )}>
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground line-clamp-2">
                        {company.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {company.activeEmployees || 0} empleados
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};
