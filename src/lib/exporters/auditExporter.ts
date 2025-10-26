import Papa from "papaparse";
import { formatDate } from "@/lib/formatters";

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

const ENTITY_LABELS: Record<string, string> = {
  hr_employees: "Empleado",
  hr_employee_costs: "Coste",
  hr_transfers: "Traslado",
  companies: "Empresa",
};

export const exportAuditLogsToCSV = (logs: AuditLog[]) => {
  const csvData = logs.map((log) => ({
    Fecha: formatDate(log.created_at),
    Usuario: "Sistema",
    "ID Usuario": log.user_id || "—",
    Acción: log.action,
    Entidad: ENTITY_LABELS[log.table_name] || log.table_name,
    "ID Registro": log.record_id || "—",
  }));

  const csv = Papa.unparse(csvData);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `audit_logs_${new Date().toISOString().split("T")[0]}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
