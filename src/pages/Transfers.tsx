import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTransfersWithDetails } from "@/hooks/useTransfers";
import { useCompanies } from "@/hooks/useCompanies";
import { useDetectTransfers } from "@/hooks/useDetectTransfers";
import { PageHeader } from "@/components/layout/PageHeader";
import { TransfersTimeline } from "@/components/transfers/TransfersTimeline";
import { TransfersTable } from "@/components/transfers/TransfersTable";
import { CreateTransferDialog } from "@/components/transfers/CreateTransferDialog";
import { exportTransfersToCSV } from "@/lib/exporters/transfersExporter";
import { Search, List, Table as TableIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const Transfers = () => {
  const { data: transfers, isLoading } = useTransfersWithDetails();
  const { data: companies } = useCompanies();
  const detectTransfers = useDetectTransfers();

  const [employeeFilter, setEmployeeFilter] = useState<string>("all");
  const [companyFilter, setCompanyFilter] = useState<string>("all");

  // Get unique employees from transfers
  const uniqueEmployees = useMemo(() => {
    if (!transfers) return [];
    const seen = new Set();
    return transfers
      .filter((t) => {
        if (seen.has(t.hr_employees.id)) return false;
        seen.add(t.hr_employees.id);
        return true;
      })
      .map((t) => ({
        id: t.hr_employees.id,
        full_name: t.hr_employees.full_name,
      }));
  }, [transfers]);

  // Filter transfers
  const filteredTransfers = useMemo(() => {
    if (!transfers) return [];
    return transfers.filter((transfer) => {
      const matchesEmployee =
        employeeFilter === "all" ||
        transfer.hr_employees.id === employeeFilter;
      const matchesCompany =
        companyFilter === "all" ||
        transfer.from_company.id === companyFilter ||
        transfer.to_company.id === companyFilter;
      return matchesEmployee && matchesCompany;
    });
  }, [transfers, employeeFilter, companyFilter]);

  const handleDetectTransfers = async () => {
    await detectTransfers.mutateAsync(undefined);
  };

  const handleExportCSV = () => {
    exportTransfersToCSV(filteredTransfers, {
      employee: employeeFilter !== "all" ? employeeFilter : undefined,
      company: companyFilter !== "all" ? companyFilter : undefined,
    });
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <PageHeader
          title="Traslados Internos"
          subtitle="Gestión de movimientos de personal entre empresas del grupo"
        />
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleDetectTransfers}
            disabled={detectTransfers.isPending}
          >
            <Search className="w-4 h-4 mr-2" />
            {detectTransfers.isPending ? "Detectando..." : "Detectar traslados"}
          </Button>
          <CreateTransferDialog />
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Todos los empleados" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los empleados</SelectItem>
            {uniqueEmployees.map((emp) => (
              <SelectItem key={emp.id} value={emp.id}>
                {emp.full_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={companyFilter} onValueChange={setCompanyFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Todas las empresas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las empresas</SelectItem>
            {companies?.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Badge variant="outline">
          {filteredTransfers.length}{" "}
          {filteredTransfers.length === 1 ? "traslado" : "traslados"}
        </Badge>
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : (
        /* Tabs: Timeline vs Table */
        <Tabs defaultValue="timeline" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="timeline">
              <List className="w-4 h-4 mr-2" />
              Timeline
            </TabsTrigger>
            <TabsTrigger value="table">
              <TableIcon className="w-4 h-4 mr-2" />
              Tabla
            </TabsTrigger>
          </TabsList>

          <TabsContent value="timeline">
            <TransfersTimeline
              transfers={filteredTransfers}
            />
          </TabsContent>

          <TabsContent value="table">
            <TransfersTable
              transfers={filteredTransfers}
              onExport={handleExportCSV}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default Transfers;
