import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Genera y descarga un archivo CSV con el contenido proporcionado
 */
export const downloadCSV = (content: string, filename: string) => {
  // Añadir BOM para UTF-8 (garantiza acentos correctos en Excel)
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

/**
 * Genera el contenido de la plantilla de empleados
 */
export const generateEmployeeTemplate = (): string => {
  const headers = 'nombre,empresa,fecha_alta,dni,fecha_baja,fecha_antiguedad,traslado,notas';
  const rows = [
    'María García López,Navarro Legal y Tributario,01/01/2020,12345678A,,,false,',
    'Juan Pérez Martínez,Beglobal Worldwide,15/03/2021,87654321B,,,false,',
    'Ana Rodríguez Sánchez,GoLooper,10/06/2022,11223344C,,,false,',
    'Carlos Fernández Torres,SPV Corporate Advisor,01/09/2019,55667788D,,,false,Ejemplo con antigüedad',
    'Laura Martín Ruiz,Navarro Legal y Tributario,20/02/2023,99887766E,,,false,'
  ];
  
  return [headers, ...rows].join('\n');
};
