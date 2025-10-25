import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle: string;
  action?: ReactNode;
  showCompany?: boolean;
}

export const PageHeader = ({ title, subtitle, action, showCompany = true }: PageHeaderProps) => {
  return (
    <div className="flex items-start justify-between">
      <div className="space-y-1">
        <h1 className="text-4xl font-bold tracking-tight">{title}</h1>
        <p className="text-sm text-foreground">{subtitle}</p>
      </div>
      
      <div className="flex items-center gap-4">
        {showCompany && (
          <div className="text-right">
            <p className="text-sm font-medium text-foreground">Navarro Empresarial</p>
          </div>
        )}
        {action && <div>{action}</div>}
      </div>
    </div>
  );
};
