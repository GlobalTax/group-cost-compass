import { test, expect } from '@playwright/test';
import { clearAuth } from '../fixtures/auth';

test.describe('Autenticación', () => {
  test.beforeEach(async ({ page }) => {
    await clearAuth(page);
  });

  test('usuario no autenticado es redirigido a login', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Debe redirigir a página de inicio
    await expect(page).toHaveURL('/', { timeout: 5000 });
  });

  test('login exitoso redirige a dashboard', async ({ page }) => {
    await page.goto('/');
    
    // Esperar a que cargue el formulario de login
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    
    // Llenar formulario de login
    await page.fill('input[type="email"]', 'admin@test.com');
    await page.fill('input[type="password"]', 'TestPassword123!');
    
    // Hacer clic en botón de login
    await page.click('button[type="submit"]');
    
    // Verificar redirección a dashboard
    await expect(page).toHaveURL('/dashboard', { timeout: 10000 });
    await expect(page.getByText(/dashboard global/i)).toBeVisible();
  });

  test('logout cierra sesión correctamente', async ({ page }) => {
    // Primero hacer login
    await page.goto('/');
    await page.fill('input[type="email"]', 'admin@test.com');
    await page.fill('input[type="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard', { timeout: 10000 });
    
    // Buscar y hacer clic en botón de logout
    // Puede estar en un menú desplegable o sidebar
    const logoutButton = page.locator('button').filter({ hasText: /cerrar sesión|logout/i }).first();
    
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
    } else {
      // Intentar abrir menú de usuario si está oculto
      await page.click('[data-testid="user-menu"]').catch(() => {});
      await page.click('button:has-text("Cerrar sesión")').catch(() => {});
    }
    
    // Verificar redirección a login
    await expect(page).toHaveURL('/', { timeout: 5000 });
  });
});
