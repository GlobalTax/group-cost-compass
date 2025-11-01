import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { exportCostsOverview } from "@/lib/exporters/costsOverviewExporter";
import type { EmployeeAnnualCost } from "@/hooks/useCostsOverview";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

interface CostsOverviewTableProps {
  data: EmployeeAnnualCost[];
  year: number;
}

export const CostsOverviewTable = ({ data, year }: CostsOverviewTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Filtrar por nombre
  const filteredData = data.filter((employee) =>
    employee.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calcular totales
  const totals = {
    salario: filteredData.reduce((sum, e) => sum + (e.salario_base_anual || 0), 0),
    ss: filteredData.reduce((sum, e) => sum + e.coste_ss_anual, 0),
    bonus: filteredData.reduce((sum, e) => sum + e.bonus_pagado_anual, 0),
    total: filteredData.reduce((sum, e) => sum + e.coste_total_anual, 0),
  };

  const handleExport = () => {
    try {
      exportCostsOverview(filteredData, year);
      toast.success("Exportación completada");
    } catch (error) {
      toast.error("Error al exportar datos");
      console.error(error);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex-1">
          <CardTitle>Detalle por Empleado</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {filteredData.length} empleados
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Input
            placeholder="Buscar empleado..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
          <Button onClick={handleExport} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead className="text-right">Salario Anual</TableHead>
                <TableHead className="text-right">Coste SS</TableHead>
                <TableHead className="text-right">Bonus Pagado</TableHead>
                <TableHead className="text-right font-bold">TOTAL</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No se encontraron empleados
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {filteredData.map((employee) => (
                    <TableRow key={employee.employee_id}>
                      <TableCell className="font-medium">
                        {employee.full_name}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {employee.company}
                      </TableCell>
                      <TableCell className="text-right">
                        {new Intl.NumberFormat("es-ES", {
                          style: "currency",
                          currency: "EUR",
                          minimumFractionDigits: 0,
                        }).format(employee.salario_base_anual || 0)}
                      </TableCell>
                      <TableCell className="text-right">
                        {new Intl.NumberFormat("es-ES", {
                          style: "currency",
                          currency: "EUR",
                          minimumFractionDigits: 0,
                        }).format(employee.coste_ss_anual)}
                      </TableCell>
                      <TableCell className="text-right">
                        {new Intl.NumberFormat("es-ES", {
                          style: "currency",
                          currency: "EUR",
                          minimumFractionDigits: 0,
                        }).format(employee.bonus_pagado_anual)}
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        {new Intl.NumberFormat("es-ES", {
                          style: "currency",
                          currency: "EUR",
                          minimumFractionDigits: 0,
                        }).format(employee.coste_total_anual)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {/* Fila de totales */}
                  <TableRow className="bg-muted/50 font-bold">
                    <TableCell colSpan={2}>TOTAL</TableCell>
                    <TableCell className="text-right">
                      {new Intl.NumberFormat("es-ES", {
                        style: "currency",
                        currency: "EUR",
                        minimumFractionDigits: 0,
                      }).format(totals.salario)}
                    </TableCell>
                    <TableCell className="text-right">
                      {new Intl.NumberFormat("es-ES", {
                        style: "currency",
                        currency: "EUR",
                        minimumFractionDigits: 0,
                      }).format(totals.ss)}
                    </TableCell>
                    <TableCell className="text-right">
                      {new Intl.NumberFormat("es-ES", {
                        style: "currency",
                        currency: "EUR",
                        minimumFractionDigits: 0,
                      }).format(totals.bonus)}
                    </TableCell>
                    <TableCell className="text-right">
                      {new Intl.NumberFormat("es-ES", {
                        style: "currency",
                        currency: "EUR",
                        minimumFractionDigits: 0,
                      }).format(totals.total)}
                    </TableCell>
                  </TableRow>
                </>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
