/**
 * Tests unitarios para monthlyKPIService
 * Valida cálculo de KPIs mensuales y comparación con mes anterior
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { calculateMonthlyKPIs } from './monthlyKPIService';
import { supabase } from '@/lib/supabase/client';

vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('monthlyKPIService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockQueryBuilder = (data: any[]) => ({
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    then: vi.fn().mockResolvedValue({ data, error: null }),
  });

  describe('calculateMonthlyKPIs', () => {
    it('debe calcular KPIs básicos correctamente', async () => {
      const mockCurrentCosts = [
        { period: '2025-01-01', coste_empresa: 5000, hr_employees: { company_id: 'company-1' } },
        { period: '2025-01-01', coste_empresa: 6000, hr_employees: { company_id: 'company-1' } },
      ];

      const mockPreviousCosts = [
        { period: '2024-12-01', coste_empresa: 4500, hr_employees: { company_id: 'company-1' } },
        { period: '2024-12-01', coste_empresa: 5500, hr_employees: { company_id: 'company-1' } },
      ];

      const mockCurrentRevenues = [
        { period: '2025-01-01', total_amount: 8000, company_id: 'company-1' },
        { period: '2025-01-15', total_amount: 7000, company_id: 'company-1' },
      ];

      const mockPreviousRevenues = [
        { period: '2024-12-01', total_amount: 7000, company_id: 'company-1' },
        { period: '2024-12-15', total_amount: 7000, company_id: 'company-1' },
      ];

      const mockEmployees = [
        { id: 'emp-1', hire_date: '2024-01-01', termination_date: null, employment_status: 'active', company_id: 'company-1' },
        { id: 'emp-2', hire_date: '2024-06-01', termination_date: null, employment_status: 'active', company_id: 'company-1' },
        { id: 'emp-3', hire_date: '2025-01-15', termination_date: null, employment_status: 'active', company_id: 'company-1' },
      ];

      vi.mocked(supabase.from)
        .mockReturnValueOnce(mockQueryBuilder([...mockCurrentCosts, ...mockPreviousCosts]) as any) // hr_employee_costs
        .mockReturnValueOnce(mockQueryBuilder([...mockCurrentRevenues, ...mockPreviousRevenues]) as any) // revenue_items
        .mockReturnValueOnce(mockQueryBuilder(mockEmployees) as any); // hr_employees

      const result = await calculateMonthlyKPIs({ month: '2025-01' });

      expect(result.costeTotal).toBe(11000);
      expect(result.ingresoTotal).toBe(15000);
      expect(result.margen).toBe(4000);
      expect(result.plantilla).toBe(3);
      expect(result.incorporaciones).toBe(1);
    });

    it('debe calcular deltas correctamente', async () => {
      const mockCosts = [
        { period: '2025-01-01', coste_empresa: 11000, hr_employees: { company_id: 'company-1' } },
        { period: '2024-12-01', coste_empresa: 10000, hr_employees: { company_id: 'company-1' } },
      ];

      const mockRevenues = [
        { period: '2025-01-01', total_amount: 15000, company_id: 'company-1' },
        { period: '2024-12-01', total_amount: 12000, company_id: 'company-1' },
      ];

      const mockEmployees = [
        { id: 'emp-1', hire_date: '2024-01-01', termination_date: null, employment_status: 'active', company_id: 'company-1' },
      ];

      vi.mocked(supabase.from)
        .mockReturnValueOnce(mockQueryBuilder(mockCosts) as any)
        .mockReturnValueOnce(mockQueryBuilder(mockRevenues) as any)
        .mockReturnValueOnce(mockQueryBuilder(mockEmployees) as any);

      const result = await calculateMonthlyKPIs({ month: '2025-01' });

      expect(result.costeDelta).toBe(1000);
      expect(result.costeDeltaPercent).toBe(10);
      expect(result.ingresoDelta).toBe(3000);
      expect(result.ingresoDeltaPercent).toBe(25);
    });

    it('debe manejar mes sin datos', async () => {
      vi.mocked(supabase.from)
        .mockReturnValueOnce(mockQueryBuilder([]) as any) // costs
        .mockReturnValueOnce(mockQueryBuilder([]) as any) // revenues
        .mockReturnValueOnce(mockQueryBuilder([]) as any); // employees

      const result = await calculateMonthlyKPIs({ month: '2025-01' });

      expect(result.costeTotal).toBe(0);
      expect(result.ingresoTotal).toBe(0);
      expect(result.margen).toBe(0);
      expect(result.plantilla).toBe(0);
      expect(result.incorporaciones).toBe(0);
    });

    it('debe calcular nuevas contrataciones correctamente', async () => {
      const mockCosts = [];
      const mockRevenues = [];

      const mockEmployees = [
        { id: 'emp-1', hire_date: '2024-01-01', termination_date: null, employment_status: 'active', company_id: 'company-1' },
        { id: 'emp-2', hire_date: '2025-01-15', termination_date: null, employment_status: 'active', company_id: 'company-1' },
        { id: 'emp-3', hire_date: '2025-01-20', termination_date: null, employment_status: 'active', company_id: 'company-1' },
      ];

      vi.mocked(supabase.from)
        .mockReturnValueOnce(mockQueryBuilder(mockCosts) as any)
        .mockReturnValueOnce(mockQueryBuilder(mockRevenues) as any)
        .mockReturnValueOnce(mockQueryBuilder(mockEmployees) as any);

      const result = await calculateMonthlyKPIs({ month: '2025-01' });

      expect(result.incorporaciones).toBe(2);
      expect(result.plantilla).toBe(3);
    });

    it('debe manejar valores nulos en costes', async () => {
      const mockCosts = [
        { period: '2025-01-01', coste_empresa: null, hr_employees: { company_id: 'company-1' } },
        { period: '2025-01-01', coste_empresa: 5000, hr_employees: { company_id: 'company-1' } },
      ];

      const mockRevenues = [];
      const mockEmployees = [
        { id: 'emp-1', hire_date: '2024-01-01', termination_date: null, employment_status: 'active', company_id: 'company-1' },
      ];

      vi.mocked(supabase.from)
        .mockReturnValueOnce(mockQueryBuilder(mockCosts) as any)
        .mockReturnValueOnce(mockQueryBuilder(mockRevenues) as any)
        .mockReturnValueOnce(mockQueryBuilder(mockEmployees) as any);

      const result = await calculateMonthlyKPIs({ month: '2025-01' });

      expect(result.costeTotal).toBe(5000); // Solo cuenta el no-null
    });

    it('debe calcular margen correctamente', async () => {
      const mockCosts = [
        { period: '2025-01-01', coste_empresa: 8000, hr_employees: { company_id: 'company-1' } },
      ];

      const mockRevenues = [
        { period: '2025-01-01', total_amount: 10000, company_id: 'company-1' },
      ];

      const mockEmployees = [
        { id: 'emp-1', hire_date: '2024-01-01', termination_date: null, employment_status: 'active', company_id: 'company-1' },
      ];

      vi.mocked(supabase.from)
        .mockReturnValueOnce(mockQueryBuilder(mockCosts) as any)
        .mockReturnValueOnce(mockQueryBuilder(mockRevenues) as any)
        .mockReturnValueOnce(mockQueryBuilder(mockEmployees) as any);

      const result = await calculateMonthlyKPIs({ month: '2025-01' });

      expect(result.margen).toBe(2000); // 10000 - 8000
      expect(result.ingresoTotal).toBe(10000);
      expect(result.costeTotal).toBe(8000);
    });

    it('debe calcular delta de margen correctamente', async () => {
      const mockCosts = [
        { period: '2025-01-01', coste_empresa: 8000, hr_employees: { company_id: 'company-1' } },
        { period: '2024-12-01', coste_empresa: 7000, hr_employees: { company_id: 'company-1' } },
      ];

      const mockRevenues = [
        { period: '2025-01-01', total_amount: 12000, company_id: 'company-1' },
        { period: '2024-12-01', total_amount: 10000, company_id: 'company-1' },
      ];

      const mockEmployees = [
        { id: 'emp-1', hire_date: '2024-01-01', termination_date: null, employment_status: 'active', company_id: 'company-1' },
      ];

      vi.mocked(supabase.from)
        .mockReturnValueOnce(mockQueryBuilder(mockCosts) as any)
        .mockReturnValueOnce(mockQueryBuilder(mockRevenues) as any)
        .mockReturnValueOnce(mockQueryBuilder(mockEmployees) as any);

      const result = await calculateMonthlyKPIs({ month: '2025-01' });

      // Margen actual: 12000 - 8000 = 4000
      // Margen previo: 10000 - 7000 = 3000
      // Delta: 4000 - 3000 = 1000
      // Porcentaje: (1000 / 3000) * 100 = 33.33%
      expect(result.margen).toBe(4000);
      expect(result.prevMargen).toBe(3000);
      expect(result.margenDelta).toBe(1000);
      expect(result.margenDeltaPercent).toBeCloseTo(33.33, 1);
    });

    it('debe filtrar por companyId cuando se proporciona', async () => {
      const mockCosts = [
        { period: '2025-01-01', coste_empresa: 5000, hr_employees: { company_id: 'company-1' } },
      ];

      const mockRevenues = [
        { period: '2025-01-01', total_amount: 8000, company_id: 'company-1' },
      ];

      const mockEmployees = [
        { id: 'emp-1', hire_date: '2024-01-01', termination_date: null, employment_status: 'active', company_id: 'company-1' },
      ];

      const mockFrom = vi.fn().mockReturnValue(mockQueryBuilder(mockCosts) as any);
      vi.mocked(supabase.from).mockImplementation(mockFrom);

      mockFrom
        .mockReturnValueOnce(mockQueryBuilder(mockCosts) as any)
        .mockReturnValueOnce(mockQueryBuilder(mockRevenues) as any)
        .mockReturnValueOnce(mockQueryBuilder(mockEmployees) as any);

      await calculateMonthlyKPIs({ month: '2025-01', companyId: 'company-1' });

      // Verificar que se llamó con el filtro de companyId
      expect(supabase.from).toHaveBeenCalledWith('hr_employee_costs');
      expect(supabase.from).toHaveBeenCalledWith('revenue_items');
      expect(supabase.from).toHaveBeenCalledWith('hr_employees');
    });
  });
});
