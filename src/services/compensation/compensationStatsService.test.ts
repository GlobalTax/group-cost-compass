/**
 * Tests unitarios para compensationStatsService
 * Valida cálculos financieros y lógica de negocio
 */

import { describe, it, expect } from 'vitest';
import {
  calculateCompensationStats,
  calculateAvailablePool,
  validateBonusAgainstPool,
  type CompensationStatsOptions,
} from './compensationStatsService';
import type { Database } from "@/integrations/supabase/types";

type EmployeeCost = Database['public']['Tables']['hr_employee_costs']['Row'];
type BonusPayment = Database['public']['Tables']['bonus_payments']['Row'];
type Employee = Database['public']['Tables']['hr_employees']['Row'];
type Deal = Database['public']['Tables']['deals']['Row'];

describe('compensationStatsService', () => {
  describe('calculateCompensationStats', () => {
    it('debe calcular stats correctamente con datos válidos', () => {
      const mockCosts: Partial<EmployeeCost>[] = [
        { employee_id: '1', period: '2025-01-01', bruto: 3000, coste_empresa: 3600 },
        { employee_id: '2', period: '2025-02-01', bruto: 4000, coste_empresa: 4800 },
      ];

      const mockBonusPayments: Partial<BonusPayment>[] = [
        { employee_id: '1', amount: 500 },
        { employee_id: '2', amount: 300 },
      ];

      const mockEmployees: Partial<Employee>[] = [
        { id: '1', full_name: 'Juan Pérez', termination_date: null },
        { id: '2', full_name: 'Ana García', termination_date: null },
        { id: '3', full_name: 'Luis Gómez', termination_date: '2024-12-31' },
      ];

      const mockDeals: Partial<Deal>[] = [
        { id: '1', status: 'active', success_fee_pool: 10000 },
        { id: '2', status: 'pipeline', success_fee_pool: 5000 },
      ];

      const result = calculateCompensationStats({
        costs: mockCosts as EmployeeCost[],
        bonusPayments: mockBonusPayments as BonusPayment[],
        employees: mockEmployees as Employee[],
        deals: mockDeals as Deal[],
        currentYear: 2025,
      });

      expect(result.totalFixedSalary).toBe(7000); // 3000 + 4000
      expect(result.totalBonusPaid).toBe(800); // 500 + 300
      expect(result.variablePercentage).toBeCloseTo(11.43, 2); // (800/7000)*100
      expect(result.activeEmployees).toBe(2); // Solo Juan y Ana
      expect(result.poolCommitted).toBe(15000); // 10000 + 5000
      expect(result.showVariableAlert).toBe(false); // 11.43% < 15%
    });

    it('debe detectar alerta cuando variable supera umbral', () => {
      const mockCosts: Partial<EmployeeCost>[] = [
        { period: '2025-01-01', bruto: 10000 },
      ];

      const mockBonusPayments: Partial<BonusPayment>[] = [
        { amount: 2000 },
      ];

      const result = calculateCompensationStats({
        costs: mockCosts as EmployeeCost[],
        bonusPayments: mockBonusPayments as BonusPayment[],
        employees: [],
        deals: [],
        currentYear: 2025,
        variableThreshold: 15,
      });

      expect(result.variablePercentage).toBe(20); // (2000/10000)*100
      expect(result.showVariableAlert).toBe(true); // 20% > 15%
    });

    it('debe manejar arrays vacíos sin errores', () => {
      const result = calculateCompensationStats({
        costs: [],
        bonusPayments: [],
        employees: [],
        deals: [],
        currentYear: 2025,
      });

      expect(result.totalFixedSalary).toBe(0);
      expect(result.totalBonusPaid).toBe(0);
      expect(result.variablePercentage).toBe(0);
      expect(result.activeEmployees).toBe(0);
      expect(result.poolCommitted).toBe(0);
      expect(result.showVariableAlert).toBe(false);
    });

    it('debe filtrar solo costes del año actual', () => {
      const mockCosts: Partial<EmployeeCost>[] = [
        { period: '2024-12-01', bruto: 3000 },
        { period: '2025-01-01', bruto: 4000 },
      ];

      const result = calculateCompensationStats({
        costs: mockCosts as EmployeeCost[],
        bonusPayments: [],
        employees: [],
        deals: [],
        currentYear: 2025,
      });

      expect(result.totalFixedSalary).toBe(4000); // Solo 2025
    });
  });

  describe('calculateAvailablePool', () => {
    it('debe calcular pool disponible correctamente', () => {
      expect(calculateAvailablePool(10000, 3000)).toBe(7000);
      expect(calculateAvailablePool(5000, 5000)).toBe(0);
      expect(calculateAvailablePool(5000, 6000)).toBe(0); // No negativo
    });
  });

  describe('validateBonusAgainstPool', () => {
    it('debe validar bonus dentro del pool disponible', () => {
      const result = validateBonusAgainstPool(3000, 10000, 5000);
      expect(result.valid).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it('debe rechazar bonus que exceda pool disponible', () => {
      const result = validateBonusAgainstPool(8000, 10000, 5000);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('excede el pool disponible');
    });

    it('debe manejar pool agotado', () => {
      const result = validateBonusAgainstPool(1, 5000, 5000);
      expect(result.valid).toBe(false);
    });
  });
});
