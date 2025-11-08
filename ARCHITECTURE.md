# Arquitectura del Proyecto - Control de Costes

## 📐 Principios de Diseño

### 1. Separación de Capas (3-Layer Architecture)

```
┌─────────────────────────────────────────────────┐
│  CAPA DE PRESENTACIÓN (React)                   │
│  - src/components/** (UI pura)                   │
│  - src/hooks/** (React Query wrappers)           │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│  CAPA DE LÓGICA DE NEGOCIO (TypeScript)         │
│  - src/services/** (cálculos, orquestación)     │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│  CAPA DE ACCESO A DATOS (Supabase)              │
│  - src/lib/supabase/repositories/** (queries)   │
└─────────────────────────────────────────────────┘
```

### 2. Reglas de Oro 🔒

1. ✅ **Repositorios** → ÚNICO lugar con `supabase.from()`
2. ✅ **Servicios** → Llaman a repositorios, NUNCA a Supabase directo
3. ✅ **Hooks** → Wrappers delgados (<30 líneas) de React Query
4. ✅ **Componentes** → Solo llaman hooks, NUNCA servicios/repos directamente

### 3. Flujo de Datos

```typescript
// ❌ INCORRECTO - Violación de arquitectura
Component → supabase.from()  // NO hacer esto

// ❌ INCORRECTO - Bypass de repositorios
Service → supabase.from()    // NO hacer esto

// ✅ CORRECTO - Con lógica de negocio
Component → Hook → Service → Repository → supabase.from()

// ✅ TAMBIÉN CORRECTO - Sin lógica de negocio
Component → Hook → Repository → supabase.from()
```

---

## 📂 Estructura de Archivos

```
src/
├── components/           # UI Components (NO queries)
│   ├── dashboard/
│   ├── employees/
│   └── ...
│
├── hooks/               # React Query wrappers (<30 líneas)
│   ├── useEmployees.ts
│   ├── useCompanies.ts
│   └── ...
│
├── services/            # Business Logic (NO Supabase directo)
│   ├── analytics/
│   │   ├── monthlyKPIService.ts
│   │   └── dashboardStatsService.ts
│   └── import/
│       ├── a3nom/
│       └── intelligent/
│
├── lib/
│   ├── supabase/
│   │   ├── repositories/  # ÚNICA fuente de queries
│   │   │   ├── companies.repo.ts
│   │   │   ├── employees.repo.ts
│   │   │   └── costs.repo.ts
│   │   └── types/
│   ├── errors.ts          # Custom error classes
│   └── utils/
│
└── pages/               # Route components
```

---

## 🎯 Responsabilidades por Capa

### Capa 1: Componentes (Presentación)

**Responsabilidad:** UI pura, interacción con usuario

**Permitido:**
- Llamar a hooks personalizados
- Manejar estado local de UI (modals, tabs, etc.)
- Renderizar datos
- Capturar eventos de usuario

**Prohibido:**
- ❌ `import { supabase } from ...`
- ❌ Lógica de negocio compleja
- ❌ Cálculos matemáticos pesados
- ❌ Transformaciones de datos

**Ejemplo:**
```typescript
// ✅ CORRECTO
export const EmployeeTable = ({ filters }) => {
  const { data: employees, isLoading } = useEmployees(filters);
  
  if (isLoading) return <Skeleton />;
  return <Table data={employees} />;
};

// ❌ INCORRECTO
export const EmployeeTable = ({ filters }) => {
  const { data } = useQuery({
    queryFn: async () => {
      const { data } = await supabase.from("hr_employees").select(); // ⛔
      return data;
    }
  });
};
```

---

### Capa 2: Hooks (React Query Wrappers)

**Responsabilidad:** Conectar React Query con servicios/repositorios

**Permitido:**
- Envolver llamadas a servicios o repositorios
- Configurar React Query (cache, refetch, etc.)
- Manejar estados de carga/error

**Prohibido:**
- ❌ Lógica de negocio (>30 líneas)
- ❌ Queries directas a Supabase
- ❌ Transformaciones complejas de datos

**Ejemplo:**
```typescript
// ✅ CORRECTO (hook delgado)
export const useMonthlyKPIs = (filters: MonthlyKPIFilters) => {
  return useQuery({
    queryKey: ["monthly-kpis", filters],
    queryFn: () => calculateMonthlyKPIs(filters), // ← Delega al servicio
    staleTime: 60000,
  });
};

// ❌ INCORRECTO (hook con 200+ líneas de lógica)
export const useMonthlyKPIs = (filters) => {
  return useQuery({
    queryFn: async () => {
      // 200 líneas de cálculos... ⛔
    }
  });
};
```

---

### Capa 3: Servicios (Lógica de Negocio)

**Responsabilidad:** Cálculos, transformaciones, orquestación

**Permitido:**
- Llamar a repositorios
- Cálculos complejos (KPIs, estadísticas)
- Orquestar múltiples repositorios
- Validaciones de negocio

**Prohibido:**
- ❌ `supabase.from()` directo
- ❌ Depender de React (hooks, context, etc.)

**Ejemplo:**
```typescript
// ✅ CORRECTO (servicio puro)
export const calculateMonthlyKPIs = async (filters) => {
  // Fetch data desde repositorios
  const costs = await fetchCosts(filters);
  const revenues = await fetchRevenues(filters);
  
  // Lógica de negocio
  const margen = revenues - costs;
  const margenPercent = (margen / revenues) * 100;
  
  return { costs, revenues, margen, margenPercent };
};

// ❌ INCORRECTO (servicio con query directa)
export const calculateMonthlyKPIs = async (filters) => {
  const { data } = await supabase.from("hr_employee_costs").select(); // ⛔
};
```

---

### Capa 4: Repositorios (Acceso a Datos)

**Responsabilidad:** Queries a Supabase, CRUD operations

**Permitido:**
- ✅ `supabase.from().select()`
- ✅ `.insert()`, `.update()`, `.delete()`
- ✅ Joins, filtros, ordenamiento
- ✅ Manejo de errores de Supabase

**Prohibido:**
- ❌ Lógica de negocio (cálculos, transformaciones)
- ❌ Llamar a otros servicios

**Ejemplo:**
```typescript
// ✅ CORRECTO (repositorio puro)
export const fetchEmployees = async (filters) => {
  let query = supabase.from("hr_employees").select("*");
  
  if (filters.companyId) {
    query = query.eq("company_id", filters.companyId);
  }
  
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
};
```

---

## 🧪 Testing Strategy

```
┌─────────────────────┬──────────────┬─────────────────┐
│ Capa                │ Test Type    │ Mock            │
├─────────────────────┼──────────────┼─────────────────┤
│ Repositorios        │ Unit         │ Supabase client │
│ Servicios           │ Unit         │ Repositorios    │
│ Hooks               │ Integration  │ Servicios       │
│ Componentes         │ Component    │ Hooks           │
└─────────────────────┴──────────────┴─────────────────┘
```

**Ejemplo:**
```typescript
// Test de servicio (mock repositorio)
import { calculateMonthlyKPIs } from "./monthlyKPIService";
import * as costsRepo from "@/lib/supabase/repositories/costs.repo";

vi.mock("@/lib/supabase/repositories/costs.repo");

test("calcula KPIs correctamente", async () => {
  vi.mocked(costsRepo.fetchCosts).mockResolvedValue([
    { coste_empresa: 5000, bruto: 4000 }
  ]);
  
  const result = await calculateMonthlyKPIs({ month: "2025-01" });
  expect(result.costeTotal).toBe(5000);
});
```

---

## 🚫 Anti-Patrones Comunes

### 1. Query Directa en Componente
```typescript
// ❌ ANTES (anti-patrón)
const CompanyDrawer = ({ companyId }) => {
  const { data } = useQuery({
    queryFn: async () => {
      const { data } = await supabase.from("companies").select();
      // 100 líneas más...
    }
  });
};

// ✅ DESPUÉS (correcto)
const CompanyDrawer = ({ companyId }) => {
  const { data, isLoading } = useCompanyMetrics(companyId);
};
```

### 2. Lógica de Negocio en Hook
```typescript
// ❌ ANTES (hook gordo con lógica)
export const useMonthlyKPIs = (filters) => {
  return useQuery({
    queryFn: async () => {
      // 200 líneas de cálculos...
      const delta = (current - prev) / prev * 100;
      // más lógica...
    }
  });
};

// ✅ DESPUÉS (hook delgado)
export const useMonthlyKPIs = (filters) => {
  return useQuery({
    queryFn: () => calculateMonthlyKPIs(filters), // ← Servicio
  });
};
```

### 3. Servicio con Query Directa
```typescript
// ❌ ANTES (servicio con Supabase directo)
export const importFromAI = async (data) => {
  const { data: companies } = await supabase.from("companies").select();
};

// ✅ DESPUÉS (servicio usa repositorio)
export const importFromAI = async (data) => {
  const companies = await fetchCompanies(); // ← Repositorio
};
```

---

## 📊 Métricas de Calidad

### Objetivos Actuales (Post-Refactoring)

```bash
# Verificar que no hay queries en componentes
grep -r "supabase\.from" src/components/ | wc -l
# Resultado esperado: 0 ✅

# Verificar que no hay queries en hooks
grep -r "\.from\(" src/hooks/ | wc -l
# Resultado esperado: 0 ✅

# Verificar que no hay queries en servicios
grep -r "supabase\.from" src/services/ | wc -l
# Resultado esperado: 0 ✅

# Verificar hooks delgados
find src/hooks -name "*.ts" -exec wc -l {} \; | awk '$1 > 30'
# Resultado esperado: 0 archivos ✅
```

---

## 🔧 Herramientas de Enforcement

### ESLint Rule

Añadir a `.eslintrc.js` para prevenir violaciones:

```javascript
module.exports = {
  rules: {
    "no-restricted-imports": ["error", {
      "paths": [{
        "name": "@/integrations/supabase/client",
        "importNames": ["supabase"],
        "message": "⛔ No importes 'supabase' directamente. Usa repositorios en src/lib/supabase/repositories/"
      }],
      "patterns": [
        {
          "group": ["**/components/**/*supabase*"],
          "message": "⛔ Los componentes NO deben acceder a Supabase. Usa hooks."
        },
        {
          "group": ["**/services/**/*supabase*"],
          "message": "⛔ Los servicios NO deben acceder a Supabase. Usa repositorios."
        }
      ]
    }]
  }
};
```

### Pre-commit Hook

Crear `.git/hooks/pre-commit`:

```bash
#!/bin/bash

echo "🔍 Verificando arquitectura..."

# Verificar queries en componentes
COMPONENT_VIOLATIONS=$(grep -r "supabase\.from" src/components/ 2>/dev/null | wc -l)
if [ "$COMPONENT_VIOLATIONS" -gt 0 ]; then
  echo "❌ ERROR: Encontradas $COMPONENT_VIOLATIONS queries a Supabase en componentes"
  echo "   Los componentes deben usar hooks, no acceder a Supabase directamente."
  exit 1
fi

# Verificar queries en servicios
SERVICE_VIOLATIONS=$(grep -r "supabase\.from" src/services/ 2>/dev/null | wc -l)
if [ "$SERVICE_VIOLATIONS" -gt 0 ]; then
  echo "❌ ERROR: Encontradas $SERVICE_VIOLATIONS queries a Supabase en servicios"
  echo "   Los servicios deben usar repositorios."
  exit 1
fi

echo "✅ Arquitectura correcta"
exit 0
```

---

## 📚 Referencias y Documentación

- **Supabase Best Practices**: https://supabase.com/docs/guides/getting-started/architecture
- **React Query Patterns**: https://tanstack.com/query/latest/docs/react/guides/query-functions
- **Repository Pattern**: https://martinfowler.com/eaaCatalog/repository.html
- **Custom Knowledge**: Ver `/custom-knowledge` para convenciones específicas del proyecto

---

## 🔄 Changelog

### 2025-01 - Refactorización Arquitectónica v1.0
- ✅ Eliminadas queries directas en componentes (8 → 0)
- ✅ Extraída lógica de negocio de hooks a servicios
- ✅ Eliminado código duplicado en repositorios
- ✅ Estandarizada capa de servicios
- ✅ Reorganizados servicios de importación
- ✅ Añadidos custom errors y documentación
