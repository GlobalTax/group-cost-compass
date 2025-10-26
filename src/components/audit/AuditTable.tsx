import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate } from "@/lib/formatters";
import { FileText } from "lucide-react";

interface AuditLog {
  id: string;
  action: string;
  table_name: string;
  record_id: string | null;
  old_data: any;
  new_data: any;
  created_at: string;
  user_id: string | null;
}

interface AuditTableProps {
  logs: AuditLog[];
  onSelectLog: (log: AuditLog) => void;
}

const ACTION_VARIANTS: Record<string, "default" | "success" | "warning" | "destructive"> = {
  INSERT: "success",
  UPDATE: "warning",
  DELETE: "destructive",
};

const ENTITY_LABELS: Record<string, string> = {
  hr_employees: "Empleado",
  hr_employee_costs: "Coste",
  hr_transfers: "Traslado",
  companies: "Empresa",
};

const getDescription = (log: AuditLog) => {
  const entity = ENTITY_LABELS[log.table_name] || log.table_name;
  
  if (log.action === "INSERT") {
    return `Se creó ${entity.toLowerCase()}`;
  } else if (log.action === "UPDATE") {
    return `Se actualizó ${entity.toLowerCase()}`;
  } else if (log.action === "DELETE") {
    return `Se eliminó ${entity.toLowerCase()}`;
  }
  
  return `${log.action} en ${entity.toLowerCase()}`;
};

export const AuditTable = ({ logs, onSelectLog }: AuditTableProps) => {
  return (
    <div className="glass-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fecha</TableHead>
            <TableHead>Usuario</TableHead>
            <TableHead>Acción</TableHead>
            <TableHead>Entidad</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead className="w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                No se encontraron registros
              </TableCell>
            </TableRow>
          ) : (
            logs.map((log) => (
              <TableRow 
                key={log.id}
                className="cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() => onSelectLog(log)}
              >
                <TableCell className="font-mono text-sm">
                  {formatDate(log.created_at)}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">Sistema</span>
                    <span className="text-xs text-muted-foreground">{log.user_id ? `ID: ${log.user_id.slice(0, 8)}...` : "—"}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={ACTION_VARIANTS[log.action] || "default"}>
                    {log.action}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">
                  {ENTITY_LABELS[log.table_name] || log.table_name}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {getDescription(log)}
                </TableCell>
                <TableCell>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
