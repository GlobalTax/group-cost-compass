/**
 * Tests unitarios para employeeMatchingService
 * Valida lógica de matching y mapeo de empleados
 */

import { describe, it, expect } from 'vitest';
import { createEmployeeMap, updateEmployeeMapWithNew } from './employeeMatchingService';

describe('employeeMatchingService', () => {
  describe('createEmployeeMap', () => {
    it('debe crear mapa con clave companyId:code', () => {
      const employees = [
        { id: 'uuid-1', employee_code: 'EMP001', company_id: 'company-1' },
        { id: 'uuid-2', employee_code: 'EMP002', company_id: 'company-2' },
      ];

      const map = createEmployeeMap(employees as any);

      expect(map.size).toBe(2);
      expect(map.get('company-1:EMP001')).toBe('uuid-1');
      expect(map.get('company-2:EMP002')).toBe('uuid-2');
    });

    it('debe manejar empleados sin código', () => {
      const employees = [
        { id: 'uuid-1', employee_code: null, company_id: 'company-1' },
        { id: 'uuid-2', employee_code: 'EMP002', company_id: 'company-2' },
      ];

      const map = createEmployeeMap(employees as any);

      expect(map.size).toBe(1);
      expect(map.has('company-1:null')).toBe(false);
      expect(map.get('company-2:EMP002')).toBe('uuid-2');
    });

    it('debe manejar array vacío', () => {
      const map = createEmployeeMap([]);
      expect(map.size).toBe(0);
    });
  });

  describe('updateEmployeeMapWithNew', () => {
    it('debe actualizar mapa con empleados nuevos', () => {
      const existingMap = new Map([['company-1:EMP001', 'uuid-1']]);
      
      const newEmployees = [
        { id: 'uuid-2', employee_code: 'EMP002', company_id: 'company-2' },
        { id: 'uuid-3', employee_code: 'EMP003', company_id: 'company-1' },
      ];

      updateEmployeeMapWithNew(existingMap, newEmployees as any);

      expect(existingMap.size).toBe(3);
      expect(existingMap.get('company-1:EMP001')).toBe('uuid-1'); // Original
      expect(existingMap.get('company-2:EMP002')).toBe('uuid-2'); // Nuevo
      expect(existingMap.get('company-1:EMP003')).toBe('uuid-3'); // Nuevo
    });

    it('debe mantener mapa original si newEmployees vacío', () => {
      const existingMap = new Map([['company-1:EMP001', 'uuid-1']]);
      
      updateEmployeeMapWithNew(existingMap, []);

      expect(existingMap.size).toBe(1);
      expect(existingMap.get('company-1:EMP001')).toBe('uuid-1');
    });

    it('no debe duplicar empleados existentes', () => {
      const existingMap = new Map([['company-1:EMP001', 'uuid-1']]);
      
      const newEmployees = [
        { id: 'uuid-1-duplicado', employee_code: 'EMP001', company_id: 'company-1' },
      ];

      updateEmployeeMapWithNew(existingMap, newEmployees as any);

      // El último sobrescribe
      expect(existingMap.size).toBe(1);
      expect(existingMap.get('company-1:EMP001')).toBe('uuid-1-duplicado');
    });
  });
});
