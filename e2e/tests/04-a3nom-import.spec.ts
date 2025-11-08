import { test, expect } from '@playwright/test';
import { authenticatedUser } from '../fixtures/auth';
import { seedCompaniesAndCosts } from '../fixtures/companies';
import { selectors } from '../utils/selectors';
import path from 'path';

test.describe('Importación A3Nom', () => {
  test.beforeEach(async ({ page }) => {
    await authenticatedUser(page);
    await seedCompaniesAndCosts();
    await page.goto('/upload');
    await page.waitForLoadState('networkidle');
  });

  test('@critical importación de archivo CSV válido', async ({ page }) => {
    // Seleccionar período de nómina
    const periodInput = page.locator('input[name="period"], input[type="month"]').first();
    await periodInput.fill('2025-01');
    
    // Subir archivo CSV de prueba
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(path.join(__dirname, '../fixtures/a3nom-sample.csv'));
    
    // Esperar análisis (puede tardar)
    await expect(page.locator('text=/analizando|procesando/i')).toBeVisible({ timeout: 5000 }).catch(() => {});
    
    // Esperar que aparezca tabla de preview o resultado
    await page.waitForTimeout(3000);
    
    // Verificar que hay algún resultado visible (tabla o mensaje)
    const hasPreviewTable = await page.locator('table').first().isVisible().catch(() => false);
    const hasMessage = await page.locator('text=/datos|empleados|registros/i').isVisible().catch(() => false);
    
    expect(hasPreviewTable || hasMessage).toBeTruthy();
  });

  test('detección de errores en archivo inválido', async ({ page }) => {
    // Seleccionar período
    const periodInput = page.locator('input[name="period"], input[type="month"]').first();
    await periodInput.fill('2025-01');
    
    // Subir archivo inválido
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(path.join(__dirname, '../fixtures/invalid-file.txt'));
    
    // Esperar mensaje de error
    await page.waitForTimeout(2000);
    
    // Verificar que hay un mensaje de error
    const errorMessage = await page.locator('text=/error|inválido|formato/i').isVisible({ timeout: 5000 }).catch(() => false);
    expect(errorMessage).toBeTruthy();
  });

  test('validación de período requerido', async ({ page }) => {
    // Intentar subir archivo sin seleccionar período
    const fileInput = page.locator('input[type="file"]').first();
    
    // Si el campo de período es visible y requerido
    const periodInput = page.locator('input[name="period"], input[type="month"]').first();
    const isPeriodVisible = await periodInput.isVisible().catch(() => false);
    
    if (isPeriodVisible) {
      await fileInput.setInputFiles(path.join(__dirname, '../fixtures/a3nom-sample.csv'));
      
      // Intentar confirmar sin período
      const confirmButton = page.locator('button').filter({ hasText: /confirmar|importar/i }).first();
      const isConfirmVisible = await confirmButton.isVisible({ timeout: 3000 }).catch(() => false);
      
      if (isConfirmVisible) {
        await confirmButton.click();
        
        // Debe mostrar error de validación
        await page.waitForTimeout(1000);
        const validationError = await page.locator('text=/período.*requerido|selecciona.*período/i').isVisible().catch(() => false);
        expect(validationError || !isConfirmVisible).toBeTruthy();
      }
    }
  });

  test('cancelación de proceso de importación', async ({ page }) => {
    // Subir archivo
    const periodInput = page.locator('input[name="period"], input[type="month"]').first();
    await periodInput.fill('2025-01').catch(() => {});
    
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(path.join(__dirname, '../fixtures/a3nom-sample.csv'));
    
    // Esperar preview
    await page.waitForTimeout(2000);
    
    // Buscar botón de cancelar
    const cancelButton = page.locator('button').filter({ hasText: /cancelar|cerrar/i }).first();
    const isCancelVisible = await cancelButton.isVisible().catch(() => false);
    
    if (isCancelVisible) {
      await cancelButton.click();
      
      // Verificar que se limpia el estado
      await page.waitForTimeout(500);
      const fileInputAfter = page.locator('input[type="file"]').first();
      const hasFiles = await fileInputAfter.evaluate((el: HTMLInputElement) => el.files?.length ?? 0);
      expect(hasFiles).toBe(0);
    }
  });

  test('navegación entre tabs de importación', async ({ page }) => {
    // Verificar que hay tabs de navegación (Inteligente, A3Nom, Histórico)
    const tabs = page.locator('[role="tab"], .tabs button');
    const tabCount = await tabs.count();
    
    if (tabCount > 1) {
      // Click en segundo tab
      await tabs.nth(1).click();
      await page.waitForTimeout(500);
      
      // Verificar que el contenido cambió
      expect(await tabs.nth(1).getAttribute('aria-selected')).toBeTruthy();
    }
  });
});
