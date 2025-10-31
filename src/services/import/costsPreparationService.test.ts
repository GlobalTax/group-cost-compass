/**
 * Tests unitarios para costsPreparationService
 * Valida preparación y normalización de costes
 */

import { describe, it, expect } from 'vitest';
import { prepareCostsForInsertion, validateCostsForImport, type CostInsert } from './costsPreparationService';
import type { ParsedA3NomCost } from '@/lib/parsers/a3nom/types';

describe('costsPreparationService', () => {
  describe('prepareCostsForInsertion', () => {
    it('debe preparar costes válidos correctamente', () => {
      const mockData: ParsedA3NomCost[] = [
        {
          employee_code: 'EMP001',
          employee_name: 'Juan Pérez',
          employee_nif: '12345678A',
          company_name: 'Test Company',
          company_nif: 'B12345678',
          bruto: 3000,
          coste_empresa: 3600,
        },
      ];

      const companyMap = new Map([
        ['B12345678', { id: 'company-1', name: 'Test Company', org_id: 'org-1' }]
      ]);
      
      const employeeMap = new Map([['company-1:EMP001', 'uuid-1']]);

      const result = prepareCostsForInsertion(mockData, companyMap, employeeMap, '2025-01');

      expect(result.costs).toHaveLength(1);
      expect(result.costs[0].employee_id).toBe('uuid-1');
      expect(result.costs[0].period).toBe('2025-01-01');
      expect(result.costs[0].bruto).toBe(3000);
      expect(result.costs[0].coste_empresa).toBe(3600);
      expect(result.filtered).toBe(0);
      expect(result.warnings).toHaveLength(0);
    });

    it('debe filtrar registros sin empresa en catálogo', () => {
      const mockData: ParsedA3NomCost[] = [
        {
          employee_code: 'EMP001',
          employee_name: 'Juan Pérez',
          employee_nif: '12345678A',
          company_name: 'Unknown',
          company_nif: 'B99999999',
          bruto: 3000,
          coste_empresa: 3600,
        },
      ];

      const companyMap = new Map([
        ['B12345678', { id: 'company-1', name: 'Test Company', org_id: 'org-1' }]
      ]);
      
      const employeeMap = new Map();

      const result = prepareCostsForInsertion(mockData, companyMap, employeeMap, '2025-01');

      expect(result.costs).toHaveLength(0);
      expect(result.filtered).toBe(1);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0]).toContain('B99999999');
    });

    it('debe filtrar registros sin empleado en mapa', () => {
      const mockData: ParsedA3NomCost[] = [
        {
          employee_code: 'EMP001',
          employee_name: 'Juan Pérez',
          employee_nif: '12345678A',
          company_name: 'Test Company',
          company_nif: 'B12345678',
          bruto: 3000,
          coste_empresa: 3600,
        },
      ];

      const companyMap = new Map([
        ['B12345678', { id: 'company-1', name: 'Test Company', org_id: 'org-1' }]
      ]);
      
      const employeeMap = new Map(); // Vacío - empleado no existe

      const result = prepareCostsForInsertion(mockData, companyMap, employeeMap, '2025-01');

      expect(result.costs).toHaveLength(0);
      expect(result.filtered).toBe(1);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0]).toContain('Juan Pérez');
    });

    it('debe manejar array vacío', () => {
      const result = prepareCostsForInsertion([], new Map(), new Map(), '2025-01');
      
      expect(result.costs).toHaveLength(0);
      expect(result.filtered).toBe(0);
      expect(result.warnings).toHaveLength(0);
    });

    it('debe preservar campos opcionales cuando existen', () => {
      const mockData: ParsedA3NomCost[] = [
        {
          employee_code: 'EMP001',
          employee_name: 'Juan Pérez',
          employee_nif: '12345678A',
          company_name: 'Test Company',
          company_nif: 'B12345678',
          bruto: 3000,
          coste_empresa: 3600,
          sal_neto: 2200,
          irpf_dinero: 500,
          ss_trabajador: 300,
        },
      ];

      const companyMap = new Map([
        ['B12345678', { id: 'company-1', name: 'Test Company', org_id: 'org-1' }]
      ]);
      
      const employeeMap = new Map([['company-1:EMP001', 'uuid-1']]);

      const result = prepareCostsForInsertion(mockData, companyMap, employeeMap, '2025-01');

      expect(result.costs[0].sal_neto).toBe(2200);
      expect(result.costs[0].irpf_dinero).toBe(500);
      expect(result.costs[0].ss_trabajador).toBe(300);
    });
  });

  describe('validateCostsForImport', () => {
    it('debe pasar con costes válidos', () => {
      const costs: CostInsert[] = [
        {
          employee_id: 'uuid-1',
          period: '2025-01-01',
          bruto: 3000,
          coste_empresa: 3600,
        } as CostInsert,
      ];

      expect(() => validateCostsForImport(costs)).not.toThrow();
    });

    it('debe lanzar error con array vacío', () => {
      expect(() => validateCostsForImport([])).toThrow('No hay datos válidos para importar');
    });
  });
});
