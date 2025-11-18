import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight, Users } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";
import type { EmployeeDetail } from "@/hooks/useCostsAnalysis";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "./EmptyState";
import { Button } from "@/components/ui/button";

interface TeamGroup {
  teamId: string | null;
  teamName: string;
  employees: EmployeeDetail[];
  totalBruto: number;
  totalCoste: number;
  avgCoste: number;
}

interface CostsByTeamTableProps {
  employees: EmployeeDetail[];
  isLoading: boolean;
}

export const CostsByTeamTable = ({ employees, isLoading }: CostsByTeamTableProps) => {
  const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set());

  const teamGroups = useMemo(() => {
    const groups = new Map<string | null, EmployeeDetail[]>();

    employees.forEach((emp) => {
      const teamKey = emp.teamId || "sin-equipo";
      if (!groups.has(teamKey)) {
        groups.set(teamKey, []);
      }
      groups.get(teamKey)!.push(emp);
    });

    const result: TeamGroup[] = [];
    groups.forEach((emps, teamKey) => {
      const totalBruto = emps.reduce((sum, e) => sum + e.bruto, 0);
      const totalCoste = emps.reduce((sum, e) => sum + e.costeEmpresa, 0);
      const avgCoste = emps.length > 0 ? totalCoste / emps.length : 0;

      result.push({
        teamId: teamKey === "sin-equipo" ? null : teamKey,
        teamName: emps[0]?.teamName || "Sin Equipo",
        employees: emps,
        totalBruto,
        totalCoste,
        avgCoste,
      });
    });

    return result.sort((a, b) => b.totalCoste - a.totalCoste);
  }, [employees]);

  const toggleTeam = (teamId: string | null) => {
    const key = teamId || "sin-equipo";
    const newExpanded = new Set(expandedTeams);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedTeams(newExpanded);
  };

  const totalEmployees = employees.length;
  const totalCoste = teamGroups.reduce((sum, g) => sum + g.totalCoste, 0);
  const avgCostePerTeam = teamGroups.length > 0 ? totalCoste / teamGroups.length : 0;

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-64 w-full" />
        </div>
      </Card>
    );
  }

  if (employees.length === 0) {
    return (
      <Card className="p-6">
        <EmptyState message="No hay datos de costes para este periodo" />
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Costes por Equipo</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Total Equipos</p>
            <p className="text-2xl font-bold">{teamGroups.length}</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Coste Total</p>
            <p className="text-2xl font-bold">{formatCurrency(totalCoste)}</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Coste Medio/Equipo</p>
            <p className="text-2xl font-bold">{formatCurrency(avgCostePerTeam)}</p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>Equipo</TableHead>
              <TableHead className="text-right">Empleados</TableHead>
              <TableHead className="text-right">Bruto Total</TableHead>
              <TableHead className="text-right">Coste Total</TableHead>
              <TableHead className="text-right">Coste Medio</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teamGroups.map((group) => {
              const teamKey = group.teamId || "sin-equipo";
              const isExpanded = expandedTeams.has(teamKey);

              return (
                <>
                  <TableRow
                    key={teamKey}
                    className="cursor-pointer hover:bg-muted/50 font-medium"
                    onClick={() => toggleTeam(group.teamId)}
                  >
                    <TableCell>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        {group.teamName}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="secondary">{group.employees.length}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(group.totalBruto)}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(group.totalCoste)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(group.avgCoste)}
                    </TableCell>
                  </TableRow>

                  {isExpanded &&
                    group.employees.map((emp) => (
                      <TableRow key={emp.id} className="bg-muted/20">
                        <TableCell></TableCell>
                        <TableCell className="pl-12 text-sm">{emp.name}</TableCell>
                        <TableCell className="text-right text-sm">
                          <Badge variant="outline" className="text-xs">
                            {emp.company}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right text-sm">
                          {formatCurrency(emp.bruto)}
                        </TableCell>
                        <TableCell className="text-right text-sm">
                          {formatCurrency(emp.costeEmpresa)}
                        </TableCell>
                        <TableCell className="text-right text-sm text-muted-foreground">
                          —
                        </TableCell>
                      </TableRow>
                    ))}
                </>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};
