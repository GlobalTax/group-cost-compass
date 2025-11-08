# Guía de Usuario - Control de Costes | Grupo Navarro

## 📖 Índice
1. [Introducción](#introducción)
2. [Primeros Pasos](#primeros-pasos)
3. [Gestión de Empleados](#gestión-de-empleados)
4. [Importación de Datos A3Nom](#importación-de-datos-a3nom)
5. [Dashboard y Reportes](#dashboard-y-reportes)
6. [Gestión de Empresas](#gestión-de-empresas)
7. [Auditoría y Trazabilidad](#auditoría-y-trazabilidad)
8. [Preguntas Frecuentes](#preguntas-frecuentes)

---

## 🚀 Introducción

Sistema de control de costes de personal para el **Grupo Navarro | Capittal**, diseñado para:

- ✅ Consolidar costes de estructura de 4 empresas
- ✅ Detectar subidas salariales significativas
- ✅ Rastrear traslados interempresa
- ✅ Generar reportes ejecutivos para Dirección

### Usuarios Objetivo

| Perfil | Permisos | Casos de Uso |
|--------|----------|--------------|
| **RRHH** | Gestión completa de empleados | Altas, bajas, importar nóminas |
| **Finanzas** | Lectura de dashboards y reportes | Analizar costes, exportar datos |
| **Dirección** | Lectura ejecutiva | Ver KPIs consolidados, desviaciones |
| **Auditoría** | Lectura de logs | Rastrear cambios, due diligence |

---

## 🏁 Primeros Pasos

### 1. Acceso al Sistema

1. Ve a la URL del proyecto (proporcionada por IT)
2. Introduce tus credenciales de acceso
3. Si es tu primera vez, se te pedirá cambiar la contraseña

### 2. Navegación Principal

La barra lateral izquierda contiene:

- **Dashboard**: Vista consolidada de KPIs
- **Empleados**: Gestión de plantilla
- **Empresas**: Catálogo de empresas del grupo
- **Importar**: Carga de datos desde A3Nom
- **Auditoría**: Registro de cambios

### 3. Filtros Globales

En la parte superior de cada página encontrarás filtros para:

- **Año**: Selecciona el año a analizar
- **Mes**: Opcional, si quieres ver un mes específico
- **Empresa**: Opcional, para filtrar por empresa

---

## 👥 Gestión de Empleados

### Crear un Empleado Manualmente

#### Paso 1: Abrir el formulario

1. Ve a **Empleados** en la barra lateral
2. Haz clic en el botón **"+ Nuevo Empleado"** (esquina superior derecha)

#### Paso 2: Completar datos obligatorios (*)

**Campos mínimos requeridos:**

- **Nombre Completo**: Apellidos, Nombre (ej: García Pérez, Juan)
- **Empresa**: Selecciona de la lista desplegable
- **Fecha de Alta**: Fecha de inicio del contrato

**Campos opcionales recomendados:**

- **Código Empleado**: Código de A3Nom (si lo conoces)
- **DNI/NIE**: Para exportaciones a Seguridad Social
- **NSS**: Número de Seguridad Social
- **Salario Base Anual**: Usado para cálculo de desviaciones

💡 **Tip:** Si importas nóminas desde A3Nom, muchos de estos datos se rellenarán automáticamente.

#### Paso 3: Guardar

- Haz clic en **"Crear Empleado"**
- Verás una notificación de confirmación en la esquina superior derecha

**Captura de pantalla sugerida:**
![Formulario de creación de empleado](./screenshots/employee-create-form.png)

---

### Buscar y Editar Empleados

#### Búsqueda rápida

1. Usa el campo de búsqueda en la parte superior de la tabla
2. Puedes buscar por:
   - Nombre
   - Código de empleado
   - DNI/NIE

#### Editar datos

1. Haz clic en cualquier fila de la tabla
2. Se abrirá un panel lateral con toda la información
3. Haz clic en **"Editar"** (icono de lápiz)
4. Modifica los campos necesarios
5. Haz clic en **"Guardar cambios"**

**Captura de pantalla sugerida:**
![Vista de detalle de empleado](./screenshots/employee-detail-drawer.png)

---

### Ver Histórico de Costes

En el panel de detalle del empleado:

1. Ve a la pestaña **"Costes"**
2. Verás una tabla con:
   - **Período**: Mes de la nómina
   - **Bruto**: Salario bruto del mes
   - **Coste Empresa**: Bruto + Seg. Social + otros costes
   - **Δ Bruto**: Variación respecto al mes anterior

#### Añadir un coste manualmente

Si necesitas corregir un mes específico:

1. Haz clic en **"+ Añadir Coste"**
2. Completa:
   - **Período** (YYYY-MM, ej: 2025-01)
   - **Bruto Mensual** (€)
   - **Coste Empresa** (€)
3. Guarda

⚠️ **Importante:** Si el período ya existe, se sobrescribirá el valor anterior.

**Captura de pantalla sugerida:**
![Histórico de costes de empleado](./screenshots/employee-costs-tab.png)

---

## 📥 Importación de Datos A3Nom

### Flujo Completo de Importación

Este es el proceso **MÁS IMPORTANTE** del sistema para mantener los datos actualizados.

#### **Preparación (A3Nom)**

1. Abre A3Nom
2. Ve a **Exportar** → **Nóminas**
3. Selecciona el mes a exportar (ej: Octubre 2024)
4. Marca **"Incluir todas las empresas"**
5. Exporta a **Excel (.xlsx)** o **Texto (.txt con tabs)**
6. Guarda el archivo con un nombre descriptivo (ej: `nominas_oct2024.xlsx`)

#### **Importación (Sistema)**

##### **Paso 1: Seleccionar período**

1. Ve a **Importar** → **"Importación A3Nom"**
2. En el campo **"Período de Nómina"**, selecciona el mes (YYYY-MM)
   - Ejemplo: Si importas Octubre 2024, selecciona `2024-10`

##### **Paso 2: Subir archivo**

1. Arrastra el archivo a la zona de carga
2. O haz clic en **"Seleccionar archivo"**
3. Espera a que el sistema analice el archivo (5-30 segundos según tamaño)

##### **Paso 3: Revisar validación**

El sistema mostrará un resumen con:

- ✅ **Empleados encontrados**: Total de registros
- ✅ **Empresas detectadas**: Número de empresas en el archivo
- ⚠️ **Duplicados**: Empleados que ya existen para ese período
- ❌ **Errores**: Filas con datos faltantes o inválidos

**Validaciones automáticas:**

- ✅ Todas las empresas existen en el catálogo
- ✅ Formato de fechas correcto (YYYY-MM)
- ✅ Coste empresa >= Bruto
- ✅ Empleados consolidados (si aparecen varias veces)

##### **Paso 4: Confirmar importación**

1. Si todo está correcto, haz clic en **"Importar X Registros"**
2. Verás una barra de progreso
3. Al finalizar:
   - Se crearán empleados nuevos (si no existían)
   - Se insertarán los costes del mes
   - Se sobrescribirán duplicados (si los marcaste)

##### **Paso 5: Verificar**

1. Ve a **Dashboard** → Filtra por el mes importado
2. Verifica que los KPIs coinciden con tus expectativas
3. Si hay discrepancias, revisa la pestaña **Auditoría**

**Capturas de pantalla sugeridas:**

1. ![Selección de período](./screenshots/a3nom-period-select.png)
2. ![Validación de archivo](./screenshots/a3nom-validation.png)
3. ![Importación en progreso](./screenshots/a3nom-importing.png)
4. ![Importación completada](./screenshots/a3nom-success.png)

---

### Errores Comunes y Soluciones

| Error | Causa | Solución |
|-------|-------|----------|
| "Empresa no encontrada: B12345678" | El NIF no existe en el catálogo | Ve a **Empresas** → **"+ Nueva Empresa"** y créala |
| "Coste empresa menor que bruto" | Error en el archivo de A3Nom | Corrige el archivo Excel manualmente |
| "Formato de fecha inválido" | Columna de fecha mal formateada | Asegúrate de usar YYYY-MM (ej: 2024-10) |
| "Duplicados detectados" | Ya importaste este mes | Confirma si quieres sobrescribir |

---

## 📊 Dashboard y Reportes

### Vista del Dashboard Global

El dashboard muestra **4 KPIs principales**:

1. **Coste Total** (€)
   - Suma de costes empresa del período
   - **Cálculo:** `SUM(coste_empresa)` de empleados activos

2. **Empleados Activos** (#)
   - Número de empleados con contrato activo
   - **Cálculo:** Empleados con `hire_date <= período` y `(termination_date IS NULL OR termination_date > período)`

3. **Coste Medio por Empleado** (€)
   - Promedio de coste por empleado
   - **Cálculo:** `Coste Total / Empleados Activos`

4. **Subida Salarial** (%)
   - Variación año sobre año del coste empresa
   - **Cálculo:** `((coste_actual - coste_año_anterior) / coste_año_anterior) * 100`
   - ⚠️ **Alerta si > 10%**: Se resalta en naranja/rojo

**Captura de pantalla sugerida:**
![Dashboard global con KPIs](./screenshots/dashboard-kpis.png)

---

### Gráficos y Heatmaps

#### **Evolución Mensual**

- Muestra tendencia de costes mes a mes
- Línea azul: Coste empresa
- Línea gris: Bruto

#### **Distribución por Empresa**

- Gráfico de barras con % de coste por empresa
- Útil para ver distribución de plantilla

#### **Heatmap Mensual**

- Vista de 12 meses × empresas
- Colores:
  - 🟢 Verde: Costes normales
  - 🟡 Amarillo: Incremento moderado (+5-10%)
  - 🔴 Rojo: Incremento significativo (>10%)

**Captura de pantalla sugerida:**
![Heatmap de costes mensuales](./screenshots/dashboard-heatmap.png)

---

### Exportar Reportes

Para exportar datos a Excel:

1. Ve a la página que quieras exportar (Dashboard, Empleados, etc.)
2. Haz clic en **"Exportar"** (icono de descarga)
3. Selecciona el formato:
   - **Excel (.xlsx)**: Para análisis en Excel
   - **CSV (.csv)**: Para importar en otros sistemas
4. El archivo se descargará automáticamente

**Contenido del Excel:**

- **Dashboard**: KPIs + tabla de empresas
- **Empleados**: Listado completo con costes
- **Auditoría**: Registro de cambios

---

## 🏢 Gestión de Empresas

### Crear una Nueva Empresa

Si necesitas añadir una empresa al catálogo:

1. Ve a **Empresas** → **"+ Nueva Empresa"**
2. Completa:
   - **Nombre**: Razón social completa
   - **NIF**: 9 caracteres (8 números + letra)
   - **Fecha de Constitución** (opcional)
   - **Dirección Fiscal** (opcional)
3. Haz clic en **"Crear"**

⚠️ **Importante:** El NIF debe coincidir exactamente con el del archivo A3Nom para que la importación funcione.

**Captura de pantalla sugerida:**
![Formulario de creación de empresa](./screenshots/company-create-form.png)

---

## 🔍 Auditoría y Trazabilidad

### Ver Registro de Cambios

Para auditar quién hizo qué:

1. Ve a **Auditoría** en la barra lateral
2. Usa los filtros:
   - **Fecha**: Rango de fechas a revisar
   - **Usuario**: Quién hizo el cambio
   - **Acción**: Tipo de cambio (Crear, Editar, Eliminar, Importar)
   - **Entidad**: Empleado, Empresa, Coste, etc.

3. Haz clic en cualquier fila para ver detalles completos del cambio

**Información disponible:**

- ✅ Qué se cambió (valores antes/después)
- ✅ Quién lo cambió (usuario autenticado)
- ✅ Cuándo se cambió (fecha y hora exacta)
- ✅ Desde dónde (IP del usuario, si está disponible)

**Captura de pantalla sugerida:**
![Tabla de auditoría](./screenshots/audit-table.png)

---

## ❓ Preguntas Frecuentes

### ¿Con qué frecuencia debo importar nóminas?

**Recomendado:** Mensualmente, dentro de los primeros 5 días tras el cierre contable del mes.

---

### ¿Qué pasa si me equivoco al importar?

El sistema guarda un registro en **Auditoría**. Si necesitas revertir:

1. Ve a Auditoría → Filtra por la fecha de la importación
2. Identifica los registros afectados
3. Contacta con IT para revertir (no hay función automática)

⚠️ **Prevención:** Siempre revisa el preview antes de confirmar.

---

### ¿Cómo sé si un empleado es un traslado interno?

En la ficha del empleado:

1. Ve a la pestaña **"Transferencias"**
2. Si aparece una fila, significa que el empleado fue trasladado entre empresas
3. Detalles:
   - Empresa origen
   - Empresa destino
   - Fecha del traspaso
   - Razón (si está documentada)

**Captura de pantalla sugerida:**
![Detección de transferencias](./screenshots/employee-transfers-tab.png)

---

### ¿Puedo editar costes manualmente después de importar?

Sí:

1. Ve al empleado → Pestaña **"Costes"**
2. Haz clic en el mes que quieras editar
3. Modifica el **Bruto** o **Coste Empresa**
4. Guarda

⚠️ **Importante:** Esto no afecta los datos en A3Nom, solo en este sistema.

---

### ¿Cómo se calculan las subidas salariales?

Comparamos el **mismo mes** del año anterior:

```
Subida % = ((Coste Octubre 2024 - Coste Octubre 2023) / Coste Octubre 2023) × 100
```

**No se usan promedios**, solo comparación directa mes a mes.

---

### ¿Qué hacer si veo un error 500 o pantalla blanca?

1. Recarga la página (F5)
2. Si persiste, haz logout y vuelve a entrar
3. Si sigue sin funcionar, contacta con IT con:
   - Hora exacta del error
   - Qué estabas haciendo (ej: "Importando nóminas de Octubre")
   - Captura de pantalla del error (si es posible)

---

### ¿Los tooltips (iconos ℹ️) me ayudan?

Sí, todos los formularios complejos tienen tooltips informativos:

- **Hover** sobre el icono ℹ️ junto a campos complejos
- Verás una explicación contextual
- Ejemplos: "Código Empleado", "NSS", "Coste Empresa", etc.

---

## 📞 Soporte

**Contacto IT:**
- Email: it@gruponavarro.com
- Horario: L-V 9:00-18:00

**Repositorio (para desarrolladores):**
https://github.com/GlobalTax/group-cost-compass

**Documentación Adicional:**
- [Flujos de Trabajo](./WORKFLOWS.md) - Diagramas detallados de procesos
- [README Principal](../README.md) - Información técnica del proyecto

---

**Última actualización:** 2025-01-15  
**Versión:** 1.0.0
