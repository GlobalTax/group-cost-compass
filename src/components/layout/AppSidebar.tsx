import { Building2, LayoutDashboard, Users, ArrowRightLeft, FileUp, Shield, CircleDot, DollarSign, LogOut, ShieldCheck, UserCog, Settings, Database, Calculator, UserPlus, Briefcase, TrendingUp, Scale, Layers } from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const navigationItems = [
  {
    section: "PANEL",
    items: [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
      { title: "Empresas", url: "/companies", icon: Building2 },
    ],
  },
  {
    section: "EMPLEADOS",
    items: [
      { title: "Empleados", url: "/employees", icon: Users },
      { title: "Selección", url: "/recruitment", icon: Briefcase },
      { title: "Costes", url: "/costs", icon: DollarSign },
      { title: "Traslados", url: "/transfers", icon: ArrowRightLeft },
      { title: "Onboarding", url: "/admin/onboarding", icon: UserPlus },
    ],
  },
  {
    section: "COMPENSACIÓN",
    items: [
      { title: "Bandas & Bonus", url: "/compensation", icon: TrendingUp },
      { title: "Operaciones M&A", url: "/compensation/deals", icon: Briefcase },
      { title: "Baremos", url: "/compensation/scales", icon: Scale },
    ],
  },
  {
    section: "HERRAMIENTAS",
    items: [
      { title: "Presupuestos", url: "/budget", icon: Calculator },
      { title: "Importar", url: "/upload", icon: FileUp },
      { title: "Auditoría", url: "/audit", icon: Shield },
    ],
  },
  {
    section: "ADMINISTRACIÓN",
    items: [
      { title: "Usuarios", url: "/admin/users", icon: UserCog },
      { title: "Roles", url: "/admin/roles", icon: ShieldCheck },
      { title: "Importar Histórico", url: "/admin/import-history", icon: Database },
    ],
  },
  {
    section: "CONFIGURACIÓN",
    items: [
      { title: "Empresas", url: "/admin/companies", icon: Building2 },
      { title: "Departamentos", url: "/admin/departments", icon: Layers },
      { title: "Roles Config", url: "/admin/roles-config", icon: Shield },
      { title: "Sistema", url: "/admin/settings", icon: Settings },
    ],
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut, hasPermission } = useAuth();

  // No renderizar sidebar en páginas públicas
  if (location.pathname === '/login' || location.pathname === '/setup') {
    return null;
  }

  const isActive = (url: string) => {
    if (url === "/dashboard") {
      return location.pathname === "/" || location.pathname === "/dashboard";
    }
    
    // Match exacto primero
    if (location.pathname === url) return true;
    
    // Solo para rutas administrativas y presupuestos, permitir subrutas
    if (url.startsWith("/admin") || url.startsWith("/budget")) {
      return location.pathname.startsWith(url);
    }
    
    return false;
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Sesión cerrada correctamente');
      navigate('/login');
    } catch (error) {
      toast.error('Error al cerrar sesión');
    }
  };

  return (
    <Sidebar
      className={cn(
        "border-r transition-all duration-300",
        collapsed ? "w-14" : "w-60"
      )}
      collapsible="icon"
    >
      {/* Logo Header */}
      {!collapsed && (
        <SidebarHeader className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
              <CircleDot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold">HR Cost Control</h2>
              <p className="text-xs text-foreground">Navarro Empresarial</p>
            </div>
          </div>
        </SidebarHeader>
      )}
      
      <SidebarContent className="bg-background border-r border-border">
        {/* Navigation Groups */}
        {navigationItems.map((group) => {
          // Ocultar sección ADMINISTRACIÓN y CONFIGURACIÓN para no-super_admin
          if ((group.section === "ADMINISTRACIÓN" || group.section === "CONFIGURACIÓN") && !hasPermission(['super_admin'])) {
            return null;
          }
          
          return (
            <SidebarGroup key={group.section}>
              {!collapsed && (
                <SidebarGroupLabel className="px-4 py-2 text-xs font-semibold text-foreground uppercase tracking-wider">
                  {group.section}
                </SidebarGroupLabel>
              )}
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.url);
                  
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        className={cn(
                          "group relative flex items-center gap-3 mx-2 px-3 py-2 rounded-lg text-foreground hover:text-foreground hover:bg-muted transition-all",
                          active && "bg-black text-white hover:bg-black hover:text-white font-medium"
                        )}
                        tooltip={collapsed ? item.title : undefined}
                      >
                        <NavLink to={item.url} className="flex items-center gap-3 w-full">
                          <Icon className="w-4 h-4 flex-shrink-0" />
                          {!collapsed && <span className="text-sm">{item.title}</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>

      {/* Logout Footer */}
      {user && (
        <SidebarFooter className="border-t border-border p-2">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start gap-3 text-foreground hover:text-foreground hover:bg-muted",
              collapsed && "justify-center"
            )}
            onClick={handleLogout}
            aria-label={collapsed ? "Cerrar sesión" : undefined}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" aria-hidden={collapsed ? "false" : "true"} />
            {!collapsed && <span className="text-sm">Cerrar Sesión</span>}
          </Button>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
