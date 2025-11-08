import { Page } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Helper para autenticar usuario en tests E2E
 * Inyecta sesión directamente en localStorage
 */
export async function authenticatedUser(page: Page, email = 'test@example.com', password = 'TestPassword123!') {
  // Crear sesión de test en Supabase
  const { data: { session }, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !session) {
    throw new Error(`Failed to authenticate test user: ${error?.message}`);
  }

  // Inyectar sesión en localStorage del navegador
  await page.goto('/');
  await page.evaluate((sessionData) => {
    const key = `sb-${sessionData.user.app_metadata.provider}-auth-token`;
    localStorage.setItem(key, JSON.stringify(sessionData));
  }, session);

  // Recargar para activar sesión
  await page.reload();
  await page.waitForLoadState('networkidle');
}

/**
 * Limpiar sesión de autenticación
 */
export async function clearAuth(page: Page) {
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await supabase.auth.signOut();
}
