import { Building2, LayoutDashboard, Users, ArrowRightLeft, FileUp, Shield, CircleDot } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
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
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

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
      { title: "Traslados", url: "/transfers", icon: ArrowRightLeft },
    ],
  },
  {
    section: "HERRAMIENTAS",
    items: [
      { title: "Importar", url: "/upload", icon: FileUp },
      { title: "Auditoría", url: "/audit", icon: Shield },
    ],
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  const isActive = (url: string) => {
    if (url === "/dashboard") {
      return location.pathname === "/" || location.pathname === "/dashboard";
    }
    return location.pathname.startsWith(url);
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
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center flex-shrink-0">
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
        {navigationItems.map((group) => (
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
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
