import { supabase } from "@/lib/supabase/client";
import { createRevenueItem, fetchRevenueItems } from "@/lib/supabase/repositories/revenue.repo";
import { ParsedRevenueItem } from "@/lib/parsers/revenueParser";
import type { Database } from "@/integrations/supabase/types";

type RevenueItemInsert = Database['public']['Tables']['revenue_items']['Insert'];

export interface ImportResult {
  success: Array<{ id: string; item: ParsedRevenueItem }>;
  duplicates: Array<{ item: ParsedRevenueItem; existing: any }>;
  errors: Array<{ item: ParsedRevenueItem; error: string }>;
}

/**
 * Check if a revenue item already exists (duplicate detection)
 */
async function checkDuplicate(item: ParsedRevenueItem, companyId: string): Promise<any | null> {
  try {
    const { data } = await supabase
      .from('revenue_items')
      .select('*')
      .eq('company_id', companyId)
      .eq('period', item.period)
      .eq('client_name', item.client_name)
      .eq('category', item.category)
      .eq('total_amount', item.total_amount)
      .maybeSingle();

    return data;
  } catch (error) {
    console.error('Error checking duplicate:', error);
    return null;
  }
}

/**
 * Import revenue items in batch with duplicate detection
 */
export async function bulkImportRevenueItems(
  items: ParsedRevenueItem[],
  companyMapping: Record<string, string>, // client_name -> company_id
  onProgress?: (current: number, total: number) => void
): Promise<ImportResult> {
  const result: ImportResult = {
    success: [],
    duplicates: [],
    errors: [],
  };

  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    try {
      // Get company ID for this client
      const companyId = companyMapping[item.client_name];
      if (!companyId) {
        result.errors.push({
          item,
          error: 'No se asignó empresa del grupo',
        });
        onProgress?.(i + 1, items.length);
        continue;
      }

      // Check for duplicates
      const existing = await checkDuplicate(item, companyId);
      if (existing) {
        result.duplicates.push({ item, existing });
        onProgress?.(i + 1, items.length);
        continue;
      }

      // Create revenue item
      const revenueItemData: RevenueItemInsert = {
        company_id: companyId,
        period: item.period,
        description: item.description,
        category: item.category,
        total_amount: item.total_amount,
        is_recurring: item.is_recurring,
        client_name: item.client_name,
        notes: `Importado de factura ${item.invoice_number}`,
      };

      const created = await createRevenueItem(revenueItemData);
      result.success.push({ id: created.id, item });
      onProgress?.(i + 1, items.length);
    } catch (error: any) {
      console.error('Error importing item:', error);
      result.errors.push({
        item,
        error: error.message || 'Error desconocido',
      });
      onProgress?.(i + 1, items.length);
    }
  }

  return result;
}

/**
 * Validate import data before processing
 */
export function validateImportData(
  items: ParsedRevenueItem[],
  companyMapping: Record<string, string>
): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check if all clients have company mapping
  const unmappedClients = new Set<string>();
  items.forEach(item => {
    if (!companyMapping[item.client_name]) {
      unmappedClients.add(item.client_name);
    }
  });

  if (unmappedClients.size > 0) {
    errors.push(
      `Faltan asignaciones de empresa para: ${Array.from(unmappedClients).join(', ')}`
    );
  }

  // Check if items have valid data
  items.forEach((item, index) => {
    if (!item.period) {
      errors.push(`Fila ${index + 1}: Fecha inválida`);
    }
    if (!item.client_name) {
      errors.push(`Fila ${index + 1}: Cliente requerido`);
    }
    if (item.total_amount <= 0) {
      errors.push(`Fila ${index + 1}: Importe debe ser mayor a 0`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}
