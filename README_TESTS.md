# 🧪 Tests Unitarios - Control de Costes

## Configuración

Tests configurados con **Vitest** + **Testing Library** + **jsdom**.

### Ejecutar Tests

```bash
# Ejecutar todos los tests
npm run test

# Ejecutar en modo watch (desarrollo)
npm run test:watch

# Ver UI interactiva
npm run test:ui

# Generar reporte de cobertura
npm run test:coverage
```

## ⚠️ Configuración Requerida

Añadir estos scripts a `package.json`:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage"
  }
}
```

Luego ejecutar: `npm install`

## Estructura de Tests

```
src/
├── services/
│   ├── compensation/
│   │   ├── compensationStatsService.ts
│   │   └── compensationStatsService.test.ts ✅
│   ├── import/
│   │   ├── employeeMatchingService.ts
│   │   ├── employeeMatchingService.test.ts ✅
│   │   ├── costsPreparationService.ts
│   │   └── costsPreparationService.test.ts ✅
├── lib/
│   ├── errorHandler.ts
│   └── errorHandler.test.ts ✅
└── test/
    └── setup.ts (configuración global)
```

## Cobertura Actual

| Servicio | Tests | Cobertura Estimada |
|----------|-------|-------------------|
| `compensationStatsService` | 8 | ~90% |
| `employeeMatchingService` | 6 | ~85% |
| `costsPreparationService` | 6 | ~80% |
| `errorHandler` | 9 | ~75% |

## Casos de Prueba Cubiertos

### 1. compensationStatsService ✅
- ✅ Cálculo correcto de stats con datos válidos
- ✅ Detección de alerta variable > umbral
- ✅ Manejo de arrays vacíos
- ✅ Filtrado por año
- ✅ Validación de pool disponible
- ✅ Validación bonus vs pool

### 2. employeeMatchingService ✅
- ✅ Creación de mapa empleados
- ✅ Actualización con nuevos empleados
- ✅ Manejo de códigos nulos
- ✅ Detección de duplicados

### 3. costsPreparationService ✅
- ✅ Preparación de costes válidos
- ✅ Filtrado de empresas no existentes
- ✅ Filtrado de empleados no encontrados
- ✅ Normalización de período (YYYY-MM-01)
- ✅ Preservación campos opcionales
- ✅ Validación de arrays vacíos

### 4. errorHandler ✅
- ✅ Clasificación errores RLS
- ✅ Detección foreign key violations
- ✅ Errores de red
- ✅ Duplicados y not found
- ✅ Validación respuestas Supabase

## Mejores Prácticas Aplicadas

1. **Arrange-Act-Assert**: Estructura clara en cada test
2. **Partial<T> para mocks**: Evita crear objetos completos innecesarios
3. **Un concepto por test**: Tests pequeños y enfocados
4. **Nombres descriptivos**: "debe X cuando Y"
5. **Servicios puros**: Tests unitarios sin mocks de Supabase

## Integración CI/CD (opcional)

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run test:coverage
```

## Troubleshooting

### ❌ Error: Cannot find module '@/...'
**Solución**: Verificar `vitest.config.ts` tiene `resolve.alias` correctamente configurado.

### ❌ Tests lentos
**Solución**: Mover tests de integración a carpeta separada y ejecutar con `--testMatch`.

### ❌ Coverage bajo
**Solución**: Enfocarse primero en servicios críticos (lógica de negocio) antes que UI.
