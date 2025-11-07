export interface ClientGroup {
  clientName: string;
  items: any[];
  totalAmount: number;
  hasRecurring: boolean;
  categories: string[];
  period: Date;
  companyId: string;
  companyName: string;
}

/**
 * Agrupa revenue_items por cliente, período y empresa
 */
export function groupRevenuesByClient(revenues: any[]): ClientGroup[] {
  const grouped = new Map<string, ClientGroup>();
  
  revenues.forEach(revenue => {
    const clientName = revenue.client_name || 'Sin cliente';
    const key = `${clientName}_${revenue.period}_${revenue.company_id}`;
    
    if (!grouped.has(key)) {
      grouped.set(key, {
        clientName,
        items: [],
        totalAmount: 0,
        hasRecurring: false,
        categories: [],
        period: new Date(revenue.period),
        companyId: revenue.company_id,
        companyName: revenue.companies?.name || '',
      });
    }
    
    const group = grouped.get(key)!;
    group.items.push(revenue);
    group.totalAmount += Number(revenue.total_amount || 0);
    
    if (revenue.is_recurring) {
      group.hasRecurring = true;
    }
    
    if (revenue.category && !group.categories.includes(revenue.category)) {
      group.categories.push(revenue.category);
    }
  });
  
  // Ordenar por total amount descendente
  return Array.from(grouped.values()).sort((a, b) => 
    b.totalAmount - a.totalAmount
  );
}
