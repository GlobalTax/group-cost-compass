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

export interface RevenueFilters {
  amountMin: number | null;
  amountMax: number | null;
  allocationStatus: 'all' | 'with' | 'without';
  recurrence: 'all' | 'recurring' | 'one-time';
}

/**
 * Filtra grupos de clientes según los criterios especificados
 */
export function filterClientGroups(
  groups: ClientGroup[],
  filters: RevenueFilters
): ClientGroup[] {
  return groups.filter(group => {
    // Filtro por rango de importes
    if (filters.amountMin !== null && group.totalAmount < filters.amountMin) {
      return false;
    }
    if (filters.amountMax !== null && group.totalAmount > filters.amountMax) {
      return false;
    }
    
    // Filtro por presencia de asignaciones
    if (filters.allocationStatus !== 'all') {
      const hasAllocations = group.items.some(
        item => item.revenue_allocations && item.revenue_allocations.length > 0
      );
      
      if (filters.allocationStatus === 'with' && !hasAllocations) {
        return false;
      }
      if (filters.allocationStatus === 'without' && hasAllocations) {
        return false;
      }
    }
    
    // Filtro por recurrencia
    if (filters.recurrence !== 'all') {
      if (filters.recurrence === 'recurring' && !group.hasRecurring) {
        return false;
      }
      if (filters.recurrence === 'one-time' && group.hasRecurring) {
        return false;
      }
    }
    
    return true;
  });
}

/**
 * Filtra items individuales de revenue según los criterios especificados
 */
export function filterRevenueItems(
  items: any[],
  filters: RevenueFilters
): any[] {
  return items.filter(item => {
    // Filtro por rango de importes
    if (filters.amountMin !== null && Number(item.total_amount) < filters.amountMin) {
      return false;
    }
    if (filters.amountMax !== null && Number(item.total_amount) > filters.amountMax) {
      return false;
    }
    
    // Filtro por presencia de asignaciones
    if (filters.allocationStatus !== 'all') {
      const hasAllocations = item.revenue_allocations && item.revenue_allocations.length > 0;
      
      if (filters.allocationStatus === 'with' && !hasAllocations) {
        return false;
      }
      if (filters.allocationStatus === 'without' && hasAllocations) {
        return false;
      }
    }
    
    // Filtro por recurrencia
    if (filters.recurrence !== 'all') {
      if (filters.recurrence === 'recurring' && !item.is_recurring) {
        return false;
      }
      if (filters.recurrence === 'one-time' && item.is_recurring) {
        return false;
      }
    }
    
    return true;
  });
}
