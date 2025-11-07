import * as XLSX from "xlsx";
import { formatCurrency, formatMonth } from "@/lib/formatters";
import type { RevenueMatrixRow } from "@/hooks/useMonthlyRevenueMatrix";

export const exportRevenueMatrixToExcel = (
  rows: RevenueMatrixRow[],
  monthsOfYear: string[],
  monthlyTotals: { [key: string]: number },
  grandTotal: number,
  viewMode: "assignee" | "client" | "company",
  year: number,
  companyName?: string,
  startMonth?: number,
  endMonth?: number
) => {
  // 1. Crear workbook
  const wb = XLSX.utils.book_new();

  // 2. Preparar datos para sheet
  const sheetData: any[][] = [];

  // Título y metadatos
  const viewLabel = {
    assignee: "Empleado/Equipo",
    client: "Cliente",
    company: "Empresa",
  }[viewMode];

  sheetData.push([`Matriz Mensual de Ingresos - ${year}`]);
  sheetData.push([`Vista: ${viewLabel}`]);
  if (companyName) {
    sheetData.push([`Empresa: ${companyName}`]);
  }
  sheetData.push([]); // Fila vacía

  // Header de columnas
  const header = [
    viewLabel,
    ...monthsOfYear.map((m) => formatMonth(m + "-01")),
    "TOTAL",
  ];
  sheetData.push(header);

  // Rows de datos
  rows.forEach((row) => {
    const rowData = [
      row.name,
      ...monthsOfYear.map((m) => row.months[m]?.amount || 0),
      row.total,
    ];
    sheetData.push(rowData);
  });

  // Total row
  const totalRow = [
    "TOTAL MES",
    ...monthsOfYear.map((m) => monthlyTotals[m] || 0),
    grandTotal,
  ];
  sheetData.push(totalRow);

  // 3. Crear sheet
  const ws = XLSX.utils.aoa_to_sheet(sheetData);

  // 4. Formatear columnas numéricas (desde fila 5, columnas B en adelante)
  const range = XLSX.utils.decode_range(ws["!ref"]!);
  for (let R = 4; R <= range.e.r; R++) {
    // Desde fila 5 (índice 4)
    for (let C = 1; C <= range.e.c; C++) {
      // Desde columna B (índice 1)
      const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
      if (!ws[cellAddress]) continue;

      // Aplicar formato de número con separador de miles y símbolo €
      ws[cellAddress].z = '#,##0 "€"';
      ws[cellAddress].t = "n"; // Tipo número
    }
  }

  // 5. Anchos de columna
  ws["!cols"] = [
    { wch: 30 }, // Nombre
    ...monthsOfYear.map(() => ({ wch: 14 })), // Meses
    { wch: 16 }, // Total
  ];

  // 6. Merge cells del título
  ws["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: monthsOfYear.length + 1 } }, // Título principal
  ];

  // 7. Aplicar estilos a las filas de header y totales
  const headerRowIndex = 4;
  const totalRowIndex = 4 + rows.length + 1;

  for (let C = 0; C <= range.e.c; C++) {
    // Header
    const headerCell = XLSX.utils.encode_cell({ r: headerRowIndex, c: C });
    if (ws[headerCell]) {
      ws[headerCell].s = {
        font: { bold: true },
        fill: { fgColor: { rgb: "E5E7EB" } },
      };
    }

    // Total row
    const totalCell = XLSX.utils.encode_cell({ r: totalRowIndex, c: C });
    if (ws[totalCell]) {
      ws[totalCell].s = {
        font: { bold: true },
        fill: { fgColor: { rgb: "F3F4F6" } },
      };
    }
  }

  // 8. Añadir sheet al workbook
  XLSX.utils.book_append_sheet(wb, ws, "Matriz Mensual");

  // 9. Crear hoja de resumen
  const summaryData: any[][] = [
    ["RESUMEN DE INGRESOS"],
    [],
    ["Año", year],
    ["Total General", grandTotal],
    ["Promedio Mensual", grandTotal / monthsOfYear.length],
    [],
    ["Mes", "Total"],
  ];

  monthsOfYear.forEach((month) => {
    summaryData.push([formatMonth(month + "-01"), monthlyTotals[month] || 0]);
  });

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);

  // Formatear números en resumen
  for (let R = 2; R < summaryData.length; R++) {
    const cellB = XLSX.utils.encode_cell({ r: R, c: 1 });
    if (wsSummary[cellB] && typeof wsSummary[cellB].v === "number") {
      wsSummary[cellB].z = '#,##0 "€"';
      wsSummary[cellB].t = "n";
    }
  }

  wsSummary["!cols"] = [{ wch: 20 }, { wch: 16 }];

  XLSX.utils.book_append_sheet(wb, wsSummary, "Resumen");

  // 10. Exportar archivo con rango de meses en el nombre
  const periodSuffix = 
    startMonth && endMonth && (startMonth !== 1 || endMonth !== 12)
      ? `_${["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"][startMonth - 1]}-${["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"][endMonth - 1]}`
      : "";
  
  const fileName = `matriz_ingresos_${viewMode}_${year}${periodSuffix}${
    companyName ? `_${companyName.replace(/\s+/g, "_")}` : ""
  }_${new Date().toISOString().split("T")[0]}.xlsx`;

  XLSX.writeFile(wb, fileName);
};
