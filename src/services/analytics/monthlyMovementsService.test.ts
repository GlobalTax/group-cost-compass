/**
 * Tests unitarios para monthlyMovementsService
 * Valida cálculo de altas/bajas y movimientos mensuales
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { calculateMonthlyMovements } from './monthlyMovementsService';
import * as employeesRepo from '@/lib/supabase/repositories/employees.repo';

vi.mock('@/lib/supabase/repositories/employees.repo');

describe('monthlyMovementsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('calculateMonthlyMovements', () => {
    it('debe calcular altas y bajas correctamente en un mes', async () => {
      const mockEmployees = [
        {
          id: 'emp-1',
          full_name: 'Juan Pérez',
          dni: '12345678A',
          company_id: 'company-1',
          hire_date: '2025-01-15',
          termination_date: null,
          employment_status: 'active',
          companies: { name: 'Company A' },
          departments: { name: 'IT' },
          position: 'Developer',
        },
        {
          id: 'emp-2',
          full_name: 'María García',
          dni: '87654321B',
          company_id: 'company-1',
          hire_date: '2025-01-20',
          termination_date: null,
          employment_status: 'active',
          companies: { name: 'Company A' },
          departments: { name: 'HR' },
          position: 'Manager',
        },
        {
          id: 'emp-3',
          full_name: 'Pedro López',
          dni: '11111111C',
          company_id: 'company-1',
          hire_date: '2024-12-01',
          termination_date: '2025-01-10',
          employment_status: 'terminated',
          termination_reason: 'Voluntary',
          companies: { name: 'Company A' },
          departments: { name: 'Sales' },
          position: 'Sales Rep',
        },
      ];

      vi.mocked(employeesRepo.fetchEmployeesByDateRange).mockResolvedValue(mockEmployees as any);

      const result = await calculateMonthlyMovements({ month: '2025-01' });

      expect(result.totalHires).toBe(2);
      expect(result.totalTerminations).toBe(1);
      expect(result.netChange).toBe(1);
      expect(result.hires).toHaveLength(2);
      expect(result.terminations).toHaveLength(1);
    });

    it('debe manejar mes sin movimientos', async () => {
      vi.mocked(employeesRepo.fetchEmployeesByDateRange).mockResolvedValue([]);

      const result = await calculateMonthlyMovements({ month: '2025-02' });

      expect(result.totalHires).toBe(0);
      expect(result.totalTerminations).toBe(0);
      expect(result.netChange).toBe(0);
      expect(result.hires).toEqual([]);
      expect(result.terminations).toEqual([]);
    });

    it('debe filtrar por empresa correctamente', async () => {
      vi.mocked(employeesRepo.fetchEmployeesByDateRange).mockResolvedValue([]);

      await calculateMonthlyMovements({ 
        month: '2025-01', 
        companyId: 'company-uuid' 
      });

      expect(employeesRepo.fetchEmployeesByDateRange).toHaveBeenCalledWith(
        '2025-01-01',
        '2025-01-31',
        'company-uuid'
      );
    });

    it('debe ordenar movimientos por fecha ascendente', async () => {
      const mockEmployees = [
        {
          id: 'emp-1',
          full_name: 'Empleado 1',
          dni: '11111111A',
          company_id: 'company-1',
          hire_date: '2025-01-20',
          termination_date: null,
          employment_status: 'active',
          companies: { name: 'Company A' },
          departments: null,
          position: null,
        },
        {
          id: 'emp-2',
          full_name: 'Empleado 2',
          dni: '22222222B',
          company_id: 'company-1',
          hire_date: '2025-01-05',
          termination_date: null,
          employment_status: 'active',
          companies: { name: 'Company A' },
          departments: null,
          position: null,
        },
        {
          id: 'emp-3',
          full_name: 'Empleado 3',
          dni: '33333333C',
          company_id: 'company-1',
          hire_date: '2025-01-15',
          termination_date: null,
          employment_status: 'active',
          companies: { name: 'Company A' },
          departments: null,
          position: null,
        },
      ];

      vi.mocked(employeesRepo.fetchEmployeesByDateRange).mockResolvedValue(mockEmployees as any);

      const result = await calculateMonthlyMovements({ month: '2025-01' });

      expect(result.hires[0].movement_date).toBe('2025-01-05');
      expect(result.hires[1].movement_date).toBe('2025-01-15');
      expect(result.hires[2].movement_date).toBe('2025-01-20');
    });

    it('debe manejar empleados con terminación en el mes', async () => {
      const mockEmployees = [
        {
          id: 'emp-1',
          full_name: 'Empleado Terminado 1',
          dni: '11111111A',
          company_id: 'company-1',
          hire_date: '2024-06-01',
          termination_date: '2025-01-15',
          employment_status: 'terminated',
          termination_reason: 'Resignation',
          companies: { name: 'Company A' },
          departments: { name: 'IT' },
          position: 'Developer',
        },
        {
          id: 'emp-2',
          full_name: 'Empleado Terminado 2',
          dni: '22222222B',
          company_id: 'company-1',
          hire_date: '2023-01-01',
          termination_date: '2025-01-31',
          employment_status: 'terminated',
          termination_reason: 'End of contract',
          companies: { name: 'Company A' },
          departments: { name: 'HR' },
          position: 'Manager',
        },
      ];

      vi.mocked(employeesRepo.fetchEmployeesByDateRange).mockResolvedValue(mockEmployees as any);

      const result = await calculateMonthlyMovements({ month: '2025-01' });

      expect(result.totalTerminations).toBe(2);
      expect(result.terminations[0].termination_reason).toBe('Resignation');
      expect(result.terminations[1].termination_reason).toBe('End of contract');
    });

    it('debe incluir campos opcionales en movimientos', async () => {
      const mockEmployees = [
        {
          id: 'emp-1',
          full_name: 'Juan Pérez',
          dni: '12345678A',
          company_id: 'company-1',
          hire_date: '2025-01-15',
          termination_date: null,
          employment_status: 'active',
          companies: { name: 'Company A' },
          departments: { name: 'Engineering' },
          position: 'Senior Developer',
        },
      ];

      vi.mocked(employeesRepo.fetchEmployeesByDateRange).mockResolvedValue(mockEmployees as any);

      const result = await calculateMonthlyMovements({ month: '2025-01' });

      expect(result.hires[0].department).toBe('Engineering');
      expect(result.hires[0].position).toBe('Senior Developer');
      expect(result.hires[0].company_name).toBe('Company A');
    });
  });
});
