/**
 * Tests unitarios para errorHandler
 * Valida clasificación y formateo de errores
 */

import { describe, it, expect } from 'vitest';
import { handleError, validateSupabaseResponse } from './errorHandler';

describe('errorHandler', () => {
  describe('handleError', () => {
    it('debe detectar errores RLS', () => {
      const error = new Error('new row violates row-level security policy');
      const result = handleError(error, 'testContext');

      expect(result.severity).toBe('critical');
      expect(result.code).toBe('RLS_ERROR');
      expect(result.message).toContain('permisos');
    });

    it('debe detectar errores de foreign key', () => {
      const error = new Error('violates foreign key constraint');
      const result = handleError(error, 'testContext');

      expect(result.severity).toBe('error');
      expect(result.code).toBe('FK_VIOLATION');
      expect(result.message).toContain('integridad');
    });

    it('debe detectar errores de red', () => {
      const error = new Error('network request failed');
      const result = handleError(error, 'testContext');

      expect(result.severity).toBe('error');
      expect(result.code).toBe('NETWORK_ERROR');
      expect(result.message).toContain('conexión');
    });

    it('debe detectar duplicados', () => {
      const error = new Error('duplicate key value violates unique constraint');
      const result = handleError(error, 'testContext');

      expect(result.severity).toBe('warning');
      expect(result.code).toBe('DUPLICATE_ENTRY');
      expect(result.message).toContain('existe');
    });

    it('debe detectar not found', () => {
      const error = new Error('Resource not found (404)');
      const result = handleError(error, 'testContext');

      expect(result.severity).toBe('warning');
      expect(result.code).toBe('NOT_FOUND');
      expect(result.message).toContain('no encontrado');
    });

    it('debe manejar strings como error', () => {
      const result = handleError('Error genérico', 'testContext');

      expect(result.severity).toBe('error');
      expect(result.message).toBe('Error genérico');
    });

    it('debe manejar errores desconocidos', () => {
      const result = handleError({ unknown: 'object' }, 'testContext');

      expect(result.severity).toBe('error');
      expect(result.message).toContain('inesperado');
    });
  });

  describe('validateSupabaseResponse', () => {
    it('debe pasar con data válida', () => {
      const data = [{ id: '1', name: 'Test' }];
      expect(() => {
        validateSupabaseResponse(data, null, 'testContext');
      }).not.toThrow();
    });

    it('debe lanzar error si hay error de Supabase', () => {
      const error = { message: 'Supabase error', code: '500' };
      expect(() => {
        validateSupabaseResponse(null, error, 'testContext');
      }).toThrow();
    });

    it('debe lanzar error si data es null', () => {
      expect(() => {
        validateSupabaseResponse(null, null, 'testContext');
      }).toThrow('No se recibieron datos');
    });

    it('debe aceptar arrays vacíos como válidos', () => {
      const data: any[] = [];
      expect(() => {
        validateSupabaseResponse(data, null, 'testContext');
      }).not.toThrow();
    });
  });
});
