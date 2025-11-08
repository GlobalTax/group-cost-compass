# 🎭 Tests E2E con Playwright - Control de Costes

## ✅ Configuración Completada

Tests E2E configurados con **Playwright** para navegador Chromium.

### Ejecutar Tests

```bash
# Instalar navegadores de Playwright (primera vez)
npx playwright install chromium

# Ejecutar todos los tests E2E
npm run test:e2e

# Ejecutar solo tests críticos (marcados con @critical)
npm run test:e2e -- --grep "@critical"

# Ver UI interactiva de Playwright
npm run test:e2e:ui

# Ejecutar en modo debug
npm run test:e2e:debug

# Ejecutar con navegador visible
npm run test:e2e:headed
```

## ⚠️ Scripts Requeridos en package.json

Añadir estos scripts a `package.json`:

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug",
    "test:e2e:headed": "playwright test --headed"
  }
}
```

## 📁 Estructura de Tests

```
e2e/
├── fixtures/              # Datos y helpers de prueba
│   ├── auth.ts           # Helper de autenticación
│   ├── companies.ts      # Seed de empresas y costes
│   ├── employees.ts      # Creación de empleados test
│   ├── a3nom-sample.csv      # Archivo CSV válido
│   ├── a3nom-duplicates.csv  # CSV con duplicados
│   └── invalid-file.txt      # Archivo inválido
├── tests/                # Suites de tests E2E
│   ├── 01-auth.spec.ts           # Autenticación (3 tests)
│   ├── 02-dashboard.spec.ts      # Dashboard y KPIs (5 tests)
│   ├── 03-employee-creation.spec.ts  # Empleados (4 tests)
│   └── 04-a3nom-import.spec.ts   # Importación A3Nom (5 tests)
└── utils/                # Utilidades reutilizables
    ├── selectors.ts      # Selectores centralizados
    └── db-cleanup.ts     # Limpieza de datos test
```

## 🧪 Cobertura de Tests (17 tests)

### 1. Autenticación (3 tests)
- ✅ Redirección cuando usuario no autenticado
- ✅ Login exitoso redirige a dashboard
- ✅ Logout cierra sesión correctamente

### 2. Dashboard Global (5 tests) 
- ✅ **@critical** Muestra KPIs correctamente
- ✅ Filtros de año cambian datos del dashboard
- ✅ Filtro por empresa actualiza vista
- ✅ Tabla de empresas es navegable
- ✅ Heatmap visible cuando no hay filtro de mes

### 3. Gestión de Empleados (4 tests)
- ✅ **@critical** Crear empleado con datos mínimos
- ✅ Validación de campos requeridos
- ✅ Búsqueda de empleado funciona
- ✅ Navegación a detalle de empleado

### 4. Importación A3Nom (5 tests)
- ✅ **@critical** Importación de archivo CSV válido
- ✅ Detección de errores en archivo inválido
- ✅ Validación de período requerido
- ✅ Cancelación de proceso de importación
- ✅ Navegación entre tabs de importación

## 🎯 Tests Críticos (@critical)

Los tests marcados con `@critical` se ejecutan en el pre-push hook:

```bash
npm run test:e2e -- --grep "@critical"
```

**Tests críticos actuales:**
1. Dashboard: Muestra KPIs correctamente
2. Empleados: Crear empleado con datos mínimos
3. Importación: Importación de archivo CSV válido

## 🔧 Variables de Entorno Requeridas

Crear archivo `.env.test` (opcional) o usar las mismas variables del `.env`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 🚀 Configuración CI/CD

### Pre-push Hook (Husky)

El archivo `.husky/pre-push` ejecuta automáticamente:
1. Tests unitarios (`npm run test`)
2. Tests E2E críticos (`npm run test:e2e -- --grep "@critical"`)

Si alguno falla, el push es cancelado.

### GitHub Actions (opcional)

Crear `.github/workflows/e2e.yml`:

```yaml
name: E2E Tests
on: [push, pull_request]
jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npx playwright install chromium
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

## 📊 Componentes con data-testid

Los siguientes componentes tienen `data-testid` para tests E2E:

### Dashboard
- `kpi-coste-total` - KPI de coste total anual
- `kpi-empleados` - KPI de empleados activos
- `kpi-coste-promedio` - KPI de coste medio por empleado
- `kpi-subidas` - KPI de % subida salarial anual
- `heatmap` - Heatmap de coste medio mensual

### Upload
- `preview-table` - Tabla de preview de costes importados
- `import-progress` - Barra de progreso de importación

## 🐛 Debugging

### Ver reporte HTML después de ejecutar tests

```bash
npm run test:e2e
npx playwright show-report
```

### Ejecutar un test específico

```bash
npm run test:e2e -- tests/02-dashboard.spec.ts
```

### Ejecutar tests en modo debug con inspector

```bash
npm run test:e2e:debug -- tests/04-a3nom-import.spec.ts
```

### Ver screenshots y videos de fallos

Los screenshots y videos se guardan automáticamente en `test-results/` cuando un test falla.

## 📝 Mejores Prácticas

1. **Tests independientes**: Cada test debe poder ejecutarse solo
2. **Cleanup después de tests**: Usar `afterEach` para limpiar datos
3. **Selectores estables**: Preferir `data-testid` sobre clases CSS
4. **Timeouts generosos**: Esperar a que los datos carguen (networkidle)
5. **Tests críticos primero**: Marcar con `@critical` los más importantes

## 🔄 Troubleshooting

### ❌ Error: Cannot find browser chromium

**Solución**: Instalar navegadores de Playwright
```bash
npx playwright install chromium
```

### ❌ Tests fallan en CI pero pasan localmente

**Solución**: Verificar que `webServer` esté configurado en `playwright.config.ts` y que las variables de entorno estén disponibles en CI.

### ❌ Timeout esperando elementos

**Solución**: Aumentar timeout en `playwright.config.ts` o usar `waitForLoadState('networkidle')` después de navegación.

### ❌ Conflictos de datos entre tests

**Solución**: Asegurar que cada test use datos únicos (timestamps en códigos/NIFs) y ejecutar cleanup en `afterEach`.

## 📚 Recursos

- [Playwright Documentation](https://playwright.dev/)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging Guide](https://playwright.dev/docs/debug)
