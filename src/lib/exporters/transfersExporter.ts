import { formatDate } from "@/lib/formatters";

interface Transfer {
  id: string;
  transfer_date: string;
  reason?: string;
  hr_employees: {
    full_name: string;
  };
  from_company: {
    name: string;
  };
  to_company: {
    name: string;
  };
  daysBetween?: number;
  isRecent?: boolean;
}

export const exportTransfersToCSV = (
  transfers: Transfer[],
  filters?: { employee?: string; company?: string }
) => {
  const csvContent = [
    [
      "Empleado",
      "Empresa Origen",
      "Empresa Destino",
      "Fecha Traslado",
      "Días entre contratos",
      "Motivo",
      "Reciente",
    ],
    ...transfers.map((t) => [
      t.hr_employees.full_name,
      t.from_company?.name || "—",
      t.to_company?.name || "—",
      formatDate(t.transfer_date),
      t.daysBetween?.toString() || "N/A",
      t.reason || "—",
      t.isRecent ? "Sí" : "No",
    ]),
  ];

  const csvString = csvContent.map((row) => row.join(",")).join("\n");
  const blob = new Blob(["\uFEFF" + csvString], {
    type: "text/csv;charset=utf-8;",
  });

  const filename = `traslados_${new Date().toISOString().split("T")[0]}.csv`;
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
