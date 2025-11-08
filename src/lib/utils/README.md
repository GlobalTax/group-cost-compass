# Utilidades por Dominio

Este directorio contiene utilidades organizadas por dominio funcional, facilitando su mantenimiento y reutilización.

## 📁 Estructura

```
src/lib/utils/
├── index.ts                # Barrel export (punto de entrada único)
├── array.ts                # Operaciones con arrays
├── currency.ts             # Formateo y cálculos monetarios
├── date.ts                 # Formateo y operaciones con fechas
├── dom.ts                  # Manipulación DOM y descargas
├── string.ts               # Manipulación de strings y normalización
├── templates.ts            # Generación de plantillas CSV
└── validation.ts           # Validadores (DNI, IBAN, email, teléfono)
```

## 🎯 Uso Recomendado

### Opción 1: Import desde el barrel (recomendado)
```typescript
import { formatCurrency, normalizeName, downloadCSV } from "@/lib/utils";
```

### Opción 2: Import directo desde módulo específico
```typescript
import { formatCurrency } from "@/lib/utils/currency";
import { normalizeName } from "@/lib/utils/string";
```

## 📚 Referencia por Módulo

### `array.ts` - Operaciones con Arrays
```typescript
// Eliminar duplicados por clave
const uniqueEmployees = uniqueBy(employees, "dni");

// Agrupar por propiedad
const employeesByCompany = groupBy(employees, "company_id");

// Ordenar por propiedad
const sortedByCost = sortBy(costs, "coste_empresa", "desc");

// Sumar valores
const totalCost = sumBy(costs, "coste_empresa");

// Calcular promedio
const avgSalary = averageBy(employees, "annual_salary");

// Dividir en chunks
const batches = chunk(largeArray, 100);

// Valores únicos
const uniqueCompanies = unique(companyNames);

// Compactar (eliminar valores falsy)
const cleanData = compact(dataWithNulls);
```

### `currency.ts` - Formateo Monetario
```typescript
// Formatear como euros sin decimales
formatCurrency(45000); // "45.000 €"

// Formatear con decimales
formatCurrencyWithDecimals(45123.56, 2); // "45.123,56 €"

// Formatear porcentaje
formatPercentage(12.5, 1); // "12.5%"

// Calcular cambio porcentual
calculatePercentageChange(55000, 50000); // 10

// Parsear número español
parseSpanishNumber("1.234,56"); // 1234.56
parseSpanishNumber("1,234.56"); // 1234.56 (también soporta formato anglosajón)

// Formatear número con separadores
formatNumber(1234567.89, 2); // "1.234.567,89"
```

### `date.ts` - Fechas
```typescript
// Formatear fecha española (dd/mm/yyyy)
formatDate(new Date()); // "08/11/2025"

// Formatear período largo
formatPeriod("2025-01-01"); // "enero 2025"

// Formatear período corto
formatPeriodShort("2025-01-01"); // "ene 2025"

// Solo mes
formatMonth("2025-01-01"); // "ene"

// Formato ISO
formatDateISO(new Date()); // "2025-11-08"

// Parsear fecha española
parseDateSpanish("15/03/2025"); // Date object

// Obtener primer/último día del mes
getFirstDayOfMonth("2025-01-15"); // 2025-01-01
getLastDayOfMonth("2025-01-15"); // 2025-01-31

// Días entre fechas
daysBetween("2025-01-01", "2025-01-15"); // 14
```

### `dom.ts` - DOM y Descargas
```typescript
// Descargar CSV (con BOM UTF-8 para Excel)
downloadCSV(csvContent, "empleados.csv");

// Descargar blob genérico
downloadBlob(blob, "archivo.pdf");

// Descargar texto
downloadText("contenido", "archivo.txt", "text/plain");

// Descargar JSON
downloadJSON({ data: [] }, "data.json");

// Copiar al portapapeles
await copyToClipboard("texto a copiar");

// Leer archivo como texto
const content = await readFileAsText(file);

// Leer archivo como data URL (base64)
const dataUrl = await readFileAsDataURL(imageFile);
```

### `string.ts` - Strings y Normalización
```typescript
// Normalizar nombre (quitar acentos, mayúsculas)
normalizeName("María José García López"); // "MARIA JOSE GARCIA LOPEZ"

// Comparar nombres normalizados
areNamesEqual("María García", "MARIA GARCIA"); // true

// Capitalizar palabras
capitalizeWords("juan pérez martínez"); // "Juan Pérez Martínez"

// Truncar texto
truncate("Texto muy largo...", 10); // "Texto m..."

// Obtener iniciales
getInitials("Juan Pérez López"); // "JP"

// Slug a título
slugToTitle("navarro-legal-tributario"); // "Navarro Legal Tributario"

// Título a slug
titleToSlug("Navarro Legal y Tributario"); // "navarro-legal-y-tributario"

// Normalizar nombre de empresa (quitar sufijos legales)
normalizeCompanyName("Beglobal Worldwide, S.L."); // "BEGLOBAL WORLDWIDE"
```

### `templates.ts` - Plantillas CSV
```typescript
// Plantilla de empleados
const employeesCSV = generateEmployeeTemplate();

// Plantilla de costes
const costsCSV = generateCostsTemplate();

// Plantilla de ingresos
const revenueCSV = generateRevenueTemplate();

// CSV genérico
const csv = generateCSV(
  ["Nombre", "Email", "Edad"],
  [
    ["Juan", "juan@example.com", 30],
    ["María", "maria@example.com", 25]
  ]
);

// Generar nombre de archivo con timestamp
const filename = generateFilename("export_empleados"); // "export_empleados_2025-11-08.csv"
```

### `validation.ts` - Validadores
```typescript
// Validar DNI/NIE español
isValidDNI("12345678Z"); // true
isValidDNI("X1234567L"); // true (NIE)

// Normalizar DNI
normalizeDNI("12.345.678-A"); // "12345678A"

// Validar email
isValidEmail("usuario@dominio.com"); // true

// Validar teléfono español
isValidSpanishPhone("+34 600 123 456"); // true
isValidSpanishPhone("600123456"); // true

// Validar IBAN español
isValidIBAN("ES91 2100 0418 4502 0005 1332"); // true
```

## 🔄 Retrocompatibilidad

Para mantener compatibilidad con código existente:

1. **`src/lib/utils.ts`** sigue exportando `cn()` directamente
2. **`src/lib/formatters.ts`** re-exporta funciones comunes desde los nuevos módulos:
   - `formatCurrency`, `formatPercentage`, `calculatePercentageChange` → `utils/currency`
   - `formatDate`, `formatPeriod`, `formatPeriodShort`, `formatMonth` → `utils/date`

Esto significa que **todo el código existente sigue funcionando** sin cambios:
```typescript
// ✅ Sigue funcionando
import { cn } from "@/lib/utils";
import { formatCurrency, formatDate } from "@/lib/formatters";
```

## 🎨 Convenciones

1. **Nombres descriptivos**: Funciones con verbos (`formatCurrency`, `normalizeName`)
2. **Type-safe**: Uso de TypeScript estricto con tipos explícitos
3. **Null-safe**: Manejo de valores `null`/`undefined`
4. **Locale-aware**: Formatos españoles por defecto
5. **Pure functions**: Sin efectos secundarios (excepto DOM)

## 🧪 Tests

Los tests unitarios se encuentran en `src/services/*/` y cubren:
- Parseo de números españoles (`parseSpanishNumber`)
- Normalización de nombres (`normalizeName`)
- Validación de DNI (`isValidDNI`)
- Formateo de fechas y moneda

Para ejecutar tests:
```bash
npm run test              # Ejecutar todos los tests
npm run test:ui           # Interfaz visual
npm run test:coverage     # Ver cobertura
```

## 📝 Mantenimiento

Al añadir nuevas utilidades:
1. Colocar en el módulo apropiado según su dominio
2. Documentar con JSDoc el propósito y ejemplos
3. Añadir tests si la lógica es compleja
4. Exportar desde `index.ts` para acceso unificado
5. Actualizar este README con ejemplos

---

**Nota**: Si necesitas funcionalidades más complejas (autenticación, queries DB, analytics), considera crear un servicio dedicado en `src/services/`.
