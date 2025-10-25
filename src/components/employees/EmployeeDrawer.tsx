import { useEffect } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X, Building2 } from "lucide-react";
import { useEmployee } from "@/hooks/useEmployees";
import { useEmployeeCosts } from "@/hooks/useEmployeeCosts";
import { useTransfers } from "@/hooks/useTransfers";
import { Skeleton } from "@/components/ui/skeleton";
import { PersonalDataTab } from "./tabs/PersonalDataTab";
import { CostsTab } from "./tabs/CostsTab";
import { SalaryIncreasesTab } from "./tabs/SalaryIncreasesTab";
import { TransfersTab } from "./tabs/TransfersTab";

interface EmployeeDrawerProps {
  employeeId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EmployeeDrawer = ({ employeeId, open, onOpenChange }: EmployeeDrawerProps) => {
  const { data: employee, isLoading: isLoadingEmployee } = useEmployee(employeeId || "");
  const { data: costs, isLoading: isLoadingCosts } = useEmployeeCosts(employeeId || undefined);
  const { data: transfers, isLoading: isLoadingTransfers } = useTransfers(employeeId || undefined);

  // Reset scroll when opening
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!employeeId) return null;

  const isActive = employee && !employee.termination_date;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="h-[90vh] max-w-4xl mx-auto">
        <DrawerHeader className="border-b sticky top-0 bg-background z-10">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {isLoadingEmployee ? (
                <Skeleton className="h-8 w-64" />
              ) : employee ? (
                <>
                  <div className="flex items-center gap-3 mb-2">
                    <DrawerTitle className="text-2xl font-bold">
                      {employee.full_name}
                    </DrawerTitle>
                    <Badge variant={isActive ? "default" : "secondary"} className={isActive ? "bg-success" : ""}>
                      {isActive ? "Activo" : "Inactivo"}
                    </Badge>
                    {employee.transfer_group && (
                      <Badge variant="outline" className="border-primary text-primary">
                        Traslado
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <Building2 className="w-4 h-4" />
                    <span>{employee.companies?.name || "—"}</span>
                  </div>
                </>
              ) : null}
            </div>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon">
                <X className="w-5 h-5" />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        <div className="overflow-y-auto flex-1 p-6">
          {isLoadingEmployee ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : employee ? (
            <Tabs defaultValue="personal" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="personal">Datos</TabsTrigger>
                <TabsTrigger value="costs">Costes</TabsTrigger>
                <TabsTrigger value="increases">Subidas</TabsTrigger>
                <TabsTrigger value="transfers">Traslados</TabsTrigger>
              </TabsList>

              <TabsContent value="personal" className="space-y-4">
                <PersonalDataTab employee={employee} />
              </TabsContent>

              <TabsContent value="costs" className="space-y-4">
                <CostsTab costs={costs || []} isLoading={isLoadingCosts} />
              </TabsContent>

              <TabsContent value="increases" className="space-y-4">
                <SalaryIncreasesTab costs={costs || []} />
              </TabsContent>

              <TabsContent value="transfers" className="space-y-4">
                <TransfersTab transfers={transfers || []} isLoading={isLoadingTransfers} />
              </TabsContent>
            </Tabs>
          ) : (
            <p className="text-center text-foreground py-8">Empleado no encontrado</p>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
};
