import { Building2, LayoutDashboard, Users, ArrowRightLeft, FileUp, Shield } from "lucide-react";
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
      <SidebarContent className="bg-background border-r border-border">
        {/* Navigation Groups */}
        {navigationItems.map((group) => (
          <SidebarGroup key={group.section}>
            {!collapsed && (
              <SidebarGroupLabel className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
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
                          "group relative flex items-center gap-3 px-4 py-2.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-all",
                          active && "bg-muted text-foreground font-medium before:absolute before:left-0 before:top-0 before:bottom-0 before:w-0.5 before:bg-primary"
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
