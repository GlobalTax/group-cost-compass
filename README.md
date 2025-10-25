# Control de Costes - Grupo Navarro | Capittal

Sistema de control de costes y gestión de recursos humanos para el grupo empresarial Navarro | Capittal.

## 🏢 Empresas del Grupo

- **Navarro Legal y Tributario, SLP** (B67261552)
- **Beglobal Worldwide, SL** (B09835315)
- **GoLooper, SL** (B02721918)
- **SPV Corporate Advisor, SL** (B09652017)

## 🎯 Funcionalidades

### Dashboard Ejecutivo
- KPIs financieros consolidados (Bruto, Coste Empresa, Empleados, Subidas)
- Gráficos de evolución mensual y anual
- Comparativas por empresa y período
- Alertas de desviaciones presupuestarias

### Gestión de Empleados
- Fichas completas con datos personales y contractuales
- Histórico de costes mensuales por empleado
- Detección automática de traslados interempresa
- Cálculo de subidas salariales reales

### Estructura del Grupo
- Vista consolidada de todas las empresas
- Métricas por empresa (plantilla, costes, tendencias)
- Análisis de distribución de costes

### Importación de Datos (ETL)
- Carga de datos desde A3Nom (CSV/Excel)
- Validación automática de formato
- Preview de datos antes de confirmar
- Detección de duplicados y conflictos

### Auditoría
- Registro completo de cambios
- Trazabilidad de movimientos
- Historial de modificaciones

## 🛠 Tecnologías

- **Frontend**: React + TypeScript + Vite
- **UI**: shadcn/ui + Tailwind CSS
- **Gráficos**: Recharts
- **Base de Datos**: Supabase (PostgreSQL)
- **Autenticación**: Supabase Auth
- **Diseño**: Liquid Glass / Mercury style

## 📊 Modelo de Datos

### Tablas Principales

- `companies` - Empresas del grupo
- `hr_employees` - Empleados y datos contractuales
- `hr_employee_costs` - Costes mensuales (bruto + coste empresa)
- `hr_transfers` - Traslados interempresa
- `audit_logs` - Auditoría de cambios

### Vistas Agregadas

- `vw_costs_by_company_year` - Consolidación de costes por empresa y año

## 🚀 Instalación y Desarrollo

```sh
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Compilar para producción
npm run build
```

## 🔐 Roles y Permisos

- **Admin**: Acceso total (importar, editar, auditar, transferir)
- **RRHH**: Gestión de empleados y visualización de costes
- **Finanzas**: Visualización de dashboards y reportes
- **Invitado/M&A**: Lectura limitada de dashboards agregados

## 📈 KPIs Principales

- **Bruto Total**: Suma de salarios brutos mensuales
- **Coste Empresa**: Bruto + Seguridad Social + otros costes
- **Subida Salarial**: Variación % año sobre año (sin promedios)
- **Empleados Activos**: A fecha de corte, considerando antigüedad y bajas
- **Traslados**: Detección automática de movimientos entre empresas del grupo

## 🎨 Diseño

Sistema de diseño corporativo basado en:
- Paleta azul profesional (#2563EB)
- Efectos glass con backdrop-filter
- Tipografía Inter (400/500/600/700)
- Sombras suaves y bordes redondeados
- Transiciones fluidas

## 📝 Casos de Uso

### RRHH
- Consultar plantilla activa y traslados internos
- Ver histórico de costes por empleado
- Detectar movimientos interempresa

### Finanzas
- Analizar costes de estructura por empresa
- Comparar Bruto vs Coste Empresa
- Generar reportes anuales

### Dirección
- Detectar subidas salariales significativas (>10%)
- Visualizar alertas de desviaciones
- Tomar decisiones estratégicas basadas en datos

### Auditoría
- Controlar trazabilidad de movimientos
- Revisar historial de cambios
- Exportar logs para due diligence

## 🔗 Enlaces Útiles

- **Proyecto Lovable**: https://lovable.dev/projects/5b9084b0-53b5-4ea6-b6b3-d66dcf768bc5
- **Documentación Supabase**: https://supabase.com/docs
- **shadcn/ui**: https://ui.shadcn.com

---

**Desarrollado con ❤️ para el Grupo Navarro | Capittal**
