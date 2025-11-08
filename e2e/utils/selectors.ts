/**
 * Selectores reutilizables para tests E2E de Playwright
 * Centraliza todos los selectores para facilitar mantenimiento
 */

export const selectors = {
  auth: {
    emailInput: 'input[type="email"]',
    passwordInput: 'input[type="password"]',
    loginButton: 'button[type="submit"]',
    logoutButton: 'button:has-text("Cerrar sesión")',
  },

  dashboard: {
    kpiCosteTotal: '[data-testid="kpi-coste-total"]',
    kpiEmpleados: '[data-testid="kpi-empleados"]',
    kpiCostePromedio: '[data-testid="kpi-coste-promedio"]',
    kpiSubidas: '[data-testid="kpi-subidas"]',
    yearFilter: '[data-testid="year-filter"]',
    companyFilter: '[data-testid="company-filter"]',
    monthFilter: '[data-testid="month-filter"]',
    heatmap: '[data-testid="heatmap"]',
    companyChart: '[data-testid="company-chart"]',
    companiesTable: '[data-testid="companies-table"]',
  },

  employees: {
    table: '[data-testid="employees-table"]',
    newButton: 'button:has-text("Nuevo Empleado")',
    searchInput: 'input[placeholder*="Buscar"]',
    editButton: 'button:has-text("Editar")',
    saveButton: 'button:has-text("Guardar")',
    deleteButton: 'button:has-text("Eliminar")',
  },

  upload: {
    periodInput: 'input[name="period"]',
    fileInput: 'input[type="file"]',
    confirmButton: 'button:has-text("Confirmar")',
    cancelButton: 'button:has-text("Cancelar")',
    previewTable: '[data-testid="preview-table"]',
    progressBar: '[data-testid="import-progress"]',
    duplicateWarning: '[data-testid="duplicate-warning"]',
  },

  common: {
    toast: '[data-sonner-toast]',
    dialog: '[role="dialog"]',
    drawer: '[data-vaul-drawer]',
    loading: 'text=/cargando/i',
  },
};
