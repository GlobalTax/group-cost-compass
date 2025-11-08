/**
 * Tests unitarios para costsEvolutionService
 * Valida agrupación mensual y evolución histórica de costes
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { calculateCostsEvolution } from './costsEvolutionService';
import * as costsRepo from '@/lib/supabase/repositories/costs.repo';

vi.mock('@/lib/supabase/repositories/costs.repo');

describe('costsEvolutionService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('calculateCostsEvolution', () => {
    it('debe generar 12 meses de datos históricos', async () => {
      const mockCosts = [
        {
          period: '2024-10-01',
          bruto: 5000,
          coste_empresa: 6000,
          employee_id: 'emp-1',
        },
        {
          period: '2024-11-01',
          bruto: 5200,
          coste_empresa: 6200,
          employee_id: 'emp-1',
        },
        {
          period: '2025-01-01',
          bruto: 5400,
          coste_empresa: 6400,
          employee_id: 'emp-1',
        },
      ];

      vi.mocked(costsRepo.fetchCostsByPeriodRange).mockResolvedValue(mockCosts as any);

      const result = await calculateCostsEvolution({ month: '2025-01' });

      expect(result).toHaveLength(12);
      // Verificar que incluye meses en español
      expect(result.some(d => d.month.toLowerCase().includes('ene'))).toBe(true);
      expect(result.some(d => d.month.toLowerCase().includes('feb'))).toBe(true);
    });

    it('debe agrupar costes por mes correctamente', async () => {
      const mockCosts = [
        {
          period: '2025-01-01',
          bruto: 3000,
          coste_empresa: 3500,
          employee_id: 'emp-1',
        },
        {
          period: '2025-01-01',
          bruto: 4000,
          coste_empresa: 4500,
          employee_id: 'emp-2',
        },
        {
          period: '2025-01-01',
          bruto: 2000,
          coste_empresa: 2300,
          employee_id: 'emp-3',
        },
      ];

      vi.mocked(costsRepo.fetchCostsByPeriodRange).mockResolvedValue(mockCosts as any);

      const result = await calculateCostsEvolution({ month: '2025-01' });
      const enero = result.find(d => d.month.toLowerCase().includes('ene'));

      expect(enero?.bruto).toBe(9000); // 3000 + 4000 + 2000
      expect(enero?.coste).toBe(10300); // 3500 + 4500 + 2300
      expect(enero?.employees).toBe(3);
    });

    it('debe manejar meses sin datos (ceros)', async () => {
      vi.mocked(costsRepo.fetchCostsByPeriodRange).mockResolvedValue([]);

      const result = await calculateCostsEvolution({ month: '2025-01' });

      expect(result).toHaveLength(12);
      result.forEach(dataPoint => {
        expect(dataPoint.bruto).toBe(0);
        expect(dataPoint.coste).toBe(0);
        expect(dataPoint.employees).toBe(0);
      });
    });

    it('debe contar empleados únicos por mes', async () => {
      const mockCosts = [
        {
          period: '2025-01-01',
          bruto: 1000,
          coste_empresa: 1200,
          employee_id: 'emp-1',
        },
        {
          period: '2025-01-01',
          bruto: 1500,
          coste_empresa: 1800,
          employee_id: 'emp-1', // Duplicado
        },
        {
          period: '2025-01-01',
          bruto: 2000,
          coste_empresa: 2400,
          employee_id: 'emp-2',
        },
        {
          period: '2025-01-01',
          bruto: 2500,
          coste_empresa: 3000,
          employee_id: 'emp-3',
        },
      ];

      vi.mocked(costsRepo.fetchCostsByPeriodRange).mockResolvedValue(mockCosts as any);

      const result = await calculateCostsEvolution({ month: '2025-01' });
      const enero = result.find(d => d.month.toLowerCase().includes('ene'));

      expect(enero?.employees).toBe(3); // Solo 3 empleados únicos (emp-1, emp-2, emp-3)
    });

    it('debe filtrar por empresa si se proporciona companyId', async () => {
      vi.mocked(costsRepo.fetchCostsByPeriodRange).mockResolvedValue([]);

      await calculateCostsEvolution({ 
        month: '2025-01', 
        companyId: 'company-uuid' 
      });

      expect(costsRepo.fetchCostsByPeriodRange).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        'company-uuid'
      );
    });

    it('debe calcular correctamente el rango de 12 meses hacia atrás', async () => {
      vi.mocked(costsRepo.fetchCostsByPeriodRange).mockResolvedValue([]);

      await calculateCostsEvolution({ month: '2025-01' });

      expect(costsRepo.fetchCostsByPeriodRange).toHaveBeenCalledWith(
        '2024-02-01', // 11 meses atrás desde 2025-01
        '2025-01-31',
        undefined
      );
    });

    it('debe manejar valores nulos en costes', async () => {
      const mockCosts = [
        {
          period: '2025-01-01',
          bruto: null,
          coste_empresa: null,
          employee_id: 'emp-1',
        },
        {
          period: '2025-01-01',
          bruto: 5000,
          coste_empresa: 6000,
          employee_id: 'emp-2',
        },
      ];

      vi.mocked(costsRepo.fetchCostsByPeriodRange).mockResolvedValue(mockCosts as any);

      const result = await calculateCostsEvolution({ month: '2025-01' });
      const enero = result.find(d => d.month.toLowerCase().includes('ene'));

      expect(enero?.bruto).toBe(5000); // Solo cuenta el no-null
      expect(enero?.coste).toBe(6000);
      expect(enero?.employees).toBe(2); // Cuenta ambos empleados
    });

    it('debe agrupar costes de diferentes meses correctamente', async () => {
      const mockCosts = [
        { period: '2024-12-01', bruto: 1000, coste_empresa: 1200, employee_id: 'emp-1' },
        { period: '2024-12-01', bruto: 1500, coste_empresa: 1800, employee_id: 'emp-2' },
        { period: '2025-01-01', bruto: 2000, coste_empresa: 2400, employee_id: 'emp-1' },
        { period: '2025-01-01', bruto: 2500, coste_empresa: 3000, employee_id: 'emp-2' },
      ];

      vi.mocked(costsRepo.fetchCostsByPeriodRange).mockResolvedValue(mockCosts as any);

      const result = await calculateCostsEvolution({ month: '2025-01' });
      
      const diciembre = result.find(d => d.month.toLowerCase().includes('dic'));
      const enero = result.find(d => d.month.toLowerCase().includes('ene'));

      expect(diciembre?.bruto).toBe(2500);
      expect(diciembre?.coste).toBe(3000);
      expect(diciembre?.employees).toBe(2);

      expect(enero?.bruto).toBe(4500);
      expect(enero?.coste).toBe(5400);
      expect(enero?.employees).toBe(2);
    });
  });
});
