import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, Download, Upload, Search, LayoutDashboard, Users, Building, FileUp } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

export const DashboardHeader = () => {
  const currentYear = new Date().getFullYear();
  const location = useLocation();
  
  const navItems = [
    { path: "/", label: "Dashboard", icon: LayoutDashboard },
    { path: "/employees", label: "Empleados", icon: Users },
    { path: "/companies", label: "Empresas", icon: Building },
    { path: "/upload", label: "Importar", icon: FileUp },
  ];
  
  return (
    <header className="sticky top-0 z-50 glass-card border-b">
      <div className="container mx-auto px-6 py-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          {/* Logo & Title */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gradient">
                  Control de Costes
                </h1>
                <p className="text-sm text-muted-foreground">
                  Grupo Navarro | Capittal
                </p>
              </div>
            </Link>

            {/* Navigation */}
            <nav className="hidden lg:flex items-center gap-1 ml-6">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Filters & Actions */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {/* Search */}
            <div className="relative flex-1 lg:flex-none lg:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar empleado..."
                className="pl-10"
              />
            </div>

            {/* Company Filter */}
            <Select defaultValue="all">
              <SelectTrigger className="w-full lg:w-[200px]">
                <SelectValue placeholder="Empresa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las empresas</SelectItem>
                <SelectItem value="navarro">Navarro Legal</SelectItem>
                <SelectItem value="beglobal">Beglobal</SelectItem>
                <SelectItem value="golooper">GoLooper</SelectItem>
                <SelectItem value="spv">SPV Corporate</SelectItem>
              </SelectContent>
            </Select>

            {/* Year Filter */}
            <Select defaultValue={currentYear.toString()}>
              <SelectTrigger className="w-full lg:w-[120px]">
                <SelectValue placeholder="Año" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={(currentYear).toString()}>{currentYear}</SelectItem>
                <SelectItem value={(currentYear - 1).toString()}>{currentYear - 1}</SelectItem>
                <SelectItem value={(currentYear - 2).toString()}>{currentYear - 2}</SelectItem>
              </SelectContent>
            </Select>

            {/* Actions */}
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
              <Link to="/upload">
                <Button size="sm" className="gradient-primary">
                  <Upload className="w-4 h-4 mr-2" />
                  Importar
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
