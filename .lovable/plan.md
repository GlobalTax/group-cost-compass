

### Plan de Corrección: Arreglar formato de fecha en useCostsOverview

**Problema identificado:**
- Línea 66 en `src/hooks/useCostsOverview.ts`: `.eq("period", currentMonth)`
- `currentMonth` = `"2025-11"` (formato YYYY-MM)
- La columna `period` es tipo `date` y requiere `"2025-11-01"` (formato YYYY-MM-DD)

**Solución:**
Modificar `src/hooks/useCostsOverview.ts` para normalizar el período añadiendo `-01` al final:

```typescript
// Línea 36: Normalizar período a formato date (primer día del mes)
const currentMonth = filters?.month || new Date().toISOString().slice(0, 7);
const periodDate = currentMonth.length === 7 ? `${currentMonth}-01` : currentMonth;
```

Y usar `periodDate` en la query:
```typescript
// Línea 66
.eq("period", periodDate)
```

**Archivo a modificar:**
- `src/hooks/useCostsOverview.ts` - 2 líneas

**Tiempo estimado:** 2 minutos

**Resultado esperado:**
- La página `/costs-overview` volverá a mostrar todos los datos
- El selector de mes funcionará correctamente
- Los filtros de empresa, departamento y equipo seguirán funcionando

