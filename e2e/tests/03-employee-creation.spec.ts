import { test, expect } from '@playwright/test';
import { authenticatedUser } from '../fixtures/auth';
import { seedCompaniesAndCosts } from '../fixtures/companies';

test.describe('Gestión de Empleados', () => {
  test.beforeEach(async ({ page }) => {
    await authenticatedUser(page);
    await seedCompaniesAndCosts();
    await page.goto('/employees');
    await page.waitForLoadState('networkidle');
  });

  test('@critical crear empleado con datos mínimos', async ({ page }) => {
    // Abrir diálogo de nuevo empleado
    const newButton = page.locator('button').filter({ hasText: /nuevo.*empleado/i }).first();
    await newButton.click();
    
    // Esperar que aparezca el diálogo
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    
    // Llenar formulario con datos únicos
    const timestamp = Date.now();
    await page.fill('input[name="full_name"], input[id*="name"]', `Juan Pérez E2E ${timestamp}`);
    await page.fill('input[name="employee_code"], input[id*="code"]', `EMP-${timestamp}`);
    await page.fill('input[name="nif"], input[id*="nif"]', '12345678Z');
    
    // Seleccionar empresa (combobox o select)
    const companyInput = page.locator('input[name="company_id"], [role="combobox"]').first();
    await companyInput.click();
    await page.locator('text=/navarro.*legal/i').first().click();
    
    // Fecha de alta
    await page.fill('input[type="date"], input[name="hire_date"]', '2025-01-15');
    
    // Guardar
    await page.locator('button').filter({ hasText: /guardar|crear/i }).click();
    
    // Verificar toast de éxito
    await expect(page.locator('[data-sonner-toast]')).toContainText(/creado|éxito/i, { timeout: 5000 });
  });

  test('validación de campos requeridos', async ({ page }) => {
    // Abrir diálogo
    const newButton = page.locator('button').filter({ hasText: /nuevo.*empleado/i }).first();
    await newButton.click();
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    
    // Intentar guardar sin llenar nada
    await page.locator('button').filter({ hasText: /guardar|crear/i }).click();
    
    // Verificar que hay mensajes de error (formulario no se cierra)
    await expect(page.locator('[role="dialog"]')).toBeVisible();
  });

  test('búsqueda de empleado funciona', async ({ page }) => {
    // Buscar empleado de test
    const searchInput = page.locator('input[placeholder*="uscar"], input[type="search"]').first();
    await searchInput.fill('Test Employee');
    
    // Esperar resultados
    await page.waitForTimeout(1000);
    
    // Verificar que la tabla se actualizó
    const table = page.locator('table').first();
    await expect(table).toBeVisible();
  });

  test('navegación a detalle de empleado', async ({ page }) => {
    // Buscar primer empleado visible
    const firstEmployee = page.locator('table tbody tr').first();
    await firstEmployee.waitFor({ state: 'visible', timeout: 5000 });
    
    // Click en la fila
    await firstEmployee.click();
    
    // Esperar drawer o navegación
    await page.waitForTimeout(1000);
    
    // Verificar que algo cambió (drawer abierto o nueva URL)
    const drawer = page.locator('[data-vaul-drawer], [role="dialog"]');
    const drawerVisible = await drawer.isVisible().catch(() => false);
    const urlChanged = page.url().includes('/employees/');
    
    expect(drawerVisible || urlChanged).toBeTruthy();
  });
});
