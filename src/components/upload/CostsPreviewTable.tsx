import { useMemo, useState, memo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, AlertCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ParsedRow, UploadCostRow } from "@/lib/validators/uploadSchema";

interface CostsPreviewTableProps {
  rows: ParsedRow<UploadCostRow>[];
  pageSize?: number;
}

export const CostsPreviewTable = memo(({ rows, pageSize = 15 }: CostsPreviewTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  
  const totalPages = Math.ceil(rows.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentRows = rows.slice(startIndex, endIndex);
  
  const stats = useMemo(() => ({
    total: rows.length,
    valid: rows.filter(r => r.data && r.errors.length === 0).length,
    errors: rows.filter(r => r.errors.length > 0).length,
    warnings: rows.filter(r => r.warnings.length > 0).length,
    duplicates: rows.filter(r => r.isDuplicate).length,
  }), [rows]);

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-5 gap-3 text-sm">
        <div className="bg-muted p-3 rounded-lg">
          <p className="text-muted-foreground">Total</p>
          <p className="text-lg font-bold">{stats.total}</p>
        </div>
        <div className="bg-success/10 p-3 rounded-lg">
          <p className="text-muted-foreground">Válidos</p>
          <p className="text-lg font-bold text-success">{stats.valid}</p>
        </div>
        <div className="bg-destructive/10 p-3 rounded-lg">
          <p className="text-muted-foreground">Errores</p>
          <p className="text-lg font-bold text-destructive">{stats.errors}</p>
        </div>
        <div className="bg-warning/10 p-3 rounded-lg">
          <p className="text-muted-foreground">Avisos</p>
          <p className="text-lg font-bold text-warning-foreground">{stats.warnings}</p>
        </div>
        <div className="bg-purple/10 p-3 rounded-lg">
          <p className="text-muted-foreground">Duplicados</p>
          <p className="text-lg font-bold text-purple">{stats.duplicates}</p>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>NIF</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead className="text-right">Bruto</TableHead>
              <TableHead className="text-right">Coste</TableHead>
              <TableHead className="w-24">Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentRows.map((row) => {
              const hasErrors = row.errors.length > 0;
              const hasWarnings = row.warnings.length > 0;
              const hasMissing = row.missingFields.length > 0;
              
              return (
                <TableRow
                  key={row.rowNumber}
                  className={cn(
                    hasErrors && "bg-destructive/5",
                    row.isDuplicate && "bg-purple/5",
                    !hasErrors && hasWarnings && "bg-warning/5"
                  )}
                >
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {row.rowNumber}
                  </TableCell>
                  <TableCell>
                    <span className={cn(
                      hasMissing && row.missingFields.includes("nif") && "text-destructive font-medium"
                    )}>
                      {row.data?.nif || "—"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={cn(
                      hasMissing && row.missingFields.includes("name") && "text-destructive font-medium"
                    )}>
                      {row.data?.name || "—"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={cn(
                      hasMissing && row.missingFields.includes("company") && "text-destructive font-medium"
                    )}>
                      {row.normalizedCompany || "—"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={cn(
                      hasMissing && row.missingFields.includes("date") && "text-destructive font-medium"
                    )}>
                      {row.data?.date || "—"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {row.data ? `${row.data.bruto.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €` : "—"}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {row.data ? `${row.data.coste_empresa.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €` : "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {hasErrors && (
                        <Badge variant="destructive" className="gap-1 text-xs">
                          <AlertCircle className="w-3 h-3" />
                          {row.errors.length}
                        </Badge>
                      )}
                      {hasWarnings && !hasErrors && (
                        <Badge variant="secondary" className="gap-1 text-xs bg-warning/10 text-warning-foreground">
                          <AlertTriangle className="w-3 h-3" />
                          {row.warnings.length}
                        </Badge>
                      )}
                      {row.isDuplicate && (
                        <Badge variant="secondary" className="text-xs bg-purple/10 text-purple">DUP</Badge>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Mostrando {startIndex + 1} - {Math.min(endIndex, rows.length)} de {rows.length}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </Button>
          <div className="flex items-center gap-2 px-3">
            <span className="text-sm">
              Página {currentPage} de {totalPages}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Siguiente
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
});

CostsPreviewTable.displayName = "CostsPreviewTable";
