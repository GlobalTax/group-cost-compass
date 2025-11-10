import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface PDFConfig {
  orientation: 'portrait' | 'landscape';
  format: 'a4' | 'letter';
  title: string;
  author?: string;
  subject?: string;
}

export class PDFBuilder {
  private pdf: jsPDF;
  private currentY: number = 20;
  private pageWidth: number;
  private pageHeight: number;
  private margins = { left: 20, right: 20, top: 20, bottom: 20 };

  constructor(config: PDFConfig) {
    this.pdf = new jsPDF({
      orientation: config.orientation,
      unit: 'mm',
      format: config.format,
    });
    
    this.pageWidth = this.pdf.internal.pageSize.getWidth();
    this.pageHeight = this.pdf.internal.pageSize.getHeight();
    
    // Metadata
    this.pdf.setProperties({
      title: config.title,
      author: config.author || 'Grupo Navarro | Capittal',
      subject: config.subject || 'Reporte Ejecutivo',
      creator: 'Control de Costes App',
    });
  }

  // Header con logo y título
  addHeader(title: string, subtitle?: string) {
    this.pdf.setFillColor(31, 41, 55); // bg-gray-800
    this.pdf.rect(0, 0, this.pageWidth, 30, 'F');
    
    this.pdf.setTextColor(255, 255, 255);
    this.pdf.setFontSize(18);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text(title, this.margins.left, 15);
    
    if (subtitle) {
      this.pdf.setFontSize(10);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.text(subtitle, this.margins.left, 22);
    }
    
    // Logo placeholder
    this.pdf.setFontSize(12);
    this.pdf.text('CAPITTAL', this.pageWidth - 40, 15);
    
    this.currentY = 40;
  }

  // Footer con paginación
  addFooter(pageNumber: number) {
    this.pdf.setFontSize(8);
    this.pdf.setTextColor(128, 128, 128);
    this.pdf.text(
      `Página ${pageNumber} | Generado el ${new Date().toLocaleDateString('es-ES')}`,
      this.margins.left,
      this.pageHeight - 10
    );
  }

  // KPI Card
  addKPI(label: string, value: string, color: string = '#3b82f6', offsetX: number = 0) {
    const cardWidth = 45;
    const cardHeight = 25;
    const xPos = this.margins.left + offsetX;
    
    // Fondo
    this.pdf.setFillColor(249, 250, 251);
    this.pdf.roundedRect(xPos, this.currentY, cardWidth, cardHeight, 2, 2, 'F');
    
    // Borde de color
    const rgbColor = this.hexToRgb(color);
    this.pdf.setDrawColor(rgbColor.r, rgbColor.g, rgbColor.b);
    this.pdf.setLineWidth(0.5);
    this.pdf.roundedRect(xPos, this.currentY, cardWidth, cardHeight, 2, 2, 'S');
    
    // Label
    this.pdf.setTextColor(107, 114, 128);
    this.pdf.setFontSize(9);
    this.pdf.text(label, xPos + 3, this.currentY + 8);
    
    // Value
    this.pdf.setTextColor(31, 41, 55);
    this.pdf.setFontSize(16);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text(value, xPos + 3, this.currentY + 18);
    
    this.pdf.setFont('helvetica', 'normal');
  }

  // Añadir gráfico desde elemento DOM
  async addChartFromElement(elementId: string, width: number = 160, height: number = 80) {
    const element = document.getElementById(elementId);
    if (!element) {
      console.warn(`Elemento ${elementId} no encontrado`);
      return;
    }

    try {
      const canvas = await html2canvas(element, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      
      if (this.currentY + height > this.pageHeight - this.margins.bottom) {
        this.pdf.addPage();
        this.currentY = this.margins.top;
      }

      this.pdf.addImage(imgData, 'PNG', this.margins.left, this.currentY, width, height);
      this.currentY += height + 10;
    } catch (error) {
      console.error('Error capturando gráfico:', error);
    }
  }

  // Tabla simple
  addTable(headers: string[], rows: (string | number)[][], options?: { fontSize?: number }) {
    const fontSize = options?.fontSize || 9;
    const cellPadding = 2;
    const rowHeight = 8;
    const colWidth = (this.pageWidth - this.margins.left - this.margins.right) / headers.length;

    // Headers
    this.pdf.setFillColor(59, 130, 246);
    this.pdf.rect(this.margins.left, this.currentY, this.pageWidth - this.margins.left - this.margins.right, rowHeight, 'F');
    
    this.pdf.setTextColor(255, 255, 255);
    this.pdf.setFontSize(fontSize);
    this.pdf.setFont('helvetica', 'bold');
    
    headers.forEach((header, i) => {
      this.pdf.text(
        header,
        this.margins.left + (i * colWidth) + cellPadding,
        this.currentY + 5
      );
    });
    
    this.currentY += rowHeight;

    // Rows
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setTextColor(31, 41, 55);
    
    rows.forEach((row, rowIndex) => {
      if (rowIndex % 2 === 0) {
        this.pdf.setFillColor(249, 250, 251);
        this.pdf.rect(this.margins.left, this.currentY, this.pageWidth - this.margins.left - this.margins.right, rowHeight, 'F');
      }
      
      row.forEach((cell, colIndex) => {
        this.pdf.text(
          String(cell),
          this.margins.left + (colIndex * colWidth) + cellPadding,
          this.currentY + 5
        );
      });
      
      this.currentY += rowHeight;
      
      if (this.currentY > this.pageHeight - this.margins.bottom - 20) {
        this.pdf.addPage();
        this.currentY = this.margins.top;
      }
    });
    
    this.currentY += 5;
  }

  // Sección de texto
  addSection(title: string, content?: string) {
    this.pdf.setFontSize(14);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(31, 41, 55);
    this.pdf.text(title, this.margins.left, this.currentY);
    
    this.currentY += 8;
    
    if (content) {
      this.pdf.setFontSize(10);
      this.pdf.setFont('helvetica', 'normal');
      const lines = this.pdf.splitTextToSize(content, this.pageWidth - this.margins.left - this.margins.right);
      this.pdf.text(lines, this.margins.left, this.currentY);
      this.currentY += lines.length * 5 + 5;
    }
  }

  // Salto de línea
  addSpace(height: number = 10) {
    this.currentY += height;
  }

  // Nueva página
  addPage() {
    this.pdf.addPage();
    this.currentY = this.margins.top;
  }

  // Guardar PDF
  save(filename: string) {
    this.pdf.save(filename);
  }

  // Obtener blob
  getBlob(): Blob {
    return this.pdf.output('blob');
  }

  // Helpers
  private hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 0, g: 0, b: 0 };
  }
}
