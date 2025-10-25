import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";

// Mock data
const employees = [
  {
    id: 1,
    name: "Virto Sanz, Alba",
    company: "Navarro Legal",
    hireDate: "01/01/2025",
    terminationDate: null,
    brutoAnual: 45000,
    costeAnual: 56700,
    transfer: true,
  },
  {
    id: 2,
    name: "Sanz Hernández, Sara",
    company: "Navarro Legal",
    hireDate: "01/01/2025",
    terminationDate: null,
    brutoAnual: 42000,
    costeAnual: 52920,
    transfer: true,
  },
  {
    id: 3,
    name: "Bellonch Boter, Clara",
    company: "Navarro Legal",
    hireDate: "14/07/2025",
    terminationDate: null,
    brutoAnual: 38000,
    costeAnual: 47880,
    transfer: true,
  },
  {
    id: 4,
    name: "Marc Tico Puigvert",
    company: "Beglobal",
    hireDate: "02/09/2024",
    terminationDate: null,
    brutoAnual: 35000,
    costeAnual: 44100,
    transfer: false,
  },
  {
    id: 5,
    name: "Pau Valls Viñals",
    company: "Beglobal",
    hireDate: "02/09/2024",
    terminationDate: null,
    brutoAnual: 33000,
    costeAnual: 41580,
    transfer: false,
  },
];

export const EmployeeTable = () => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="font-semibold">Nombre</TableHead>
            <TableHead className="font-semibold">Empresa</TableHead>
            <TableHead className="font-semibold">Alta</TableHead>
            <TableHead className="font-semibold">Baja</TableHead>
            <TableHead className="font-semibold text-right">Bruto Anual</TableHead>
            <TableHead className="font-semibold text-right">Coste Anual</TableHead>
            <TableHead className="font-semibold text-center">Estado</TableHead>
            <TableHead className="w-[60px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((employee) => (
            <TableRow key={employee.id} className="group">
              <TableCell className="font-medium">{employee.name}</TableCell>
              <TableCell>
                <span className="text-sm text-muted-foreground">
                  {employee.company}
                </span>
              </TableCell>
              <TableCell>
                <span className="text-sm">{employee.hireDate}</span>
              </TableCell>
              <TableCell>
                <span className="text-sm text-muted-foreground">
                  {employee.terminationDate || "—"}
                </span>
              </TableCell>
              <TableCell className="text-right font-medium">
                {formatCurrency(employee.brutoAnual)}
              </TableCell>
              <TableCell className="text-right font-medium">
                {formatCurrency(employee.costeAnual)}
              </TableCell>
              <TableCell className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <Badge variant="default" className="bg-success">
                    Activo
                  </Badge>
                  {employee.transfer && (
                    <Badge variant="outline" className="border-primary text-primary">
                      Traslado
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ArrowUpRight className="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
