/**
 * Constantes centralizadas del proyecto
 * Evita magic numbers y strings hardcodeados
 */

export const COMPANIES = {
  NAVARRO_LEGAL: {
    name: "Navarro Legal y Tributario, SLP",
    nif: "B67261552",
  },
  BEGLOBAL: {
    name: "Beglobal Worldwide, SL",
    nif: "B09835315",
  },
  GOLOOPER: {
    name: "GoLooper, SL",
    nif: "B02721918",
  },
  SPV: {
    name: "SPV Corporate Advisor, SL",
    nif: "B09652017",
  },
} as const;

export const PERIODS = {
  CURRENT_YEAR: new Date().getFullYear(),
  PREVIOUS_YEAR: new Date().getFullYear() - 1,
} as const;

export const VALIDATION = {
  MIN_NAME_LENGTH: 3,
  MIN_EMPLOYEE_NAME_LENGTH: 3,
  MAX_NAME_LENGTH: 200,
  MAX_ADDRESS_LENGTH: 500,
  MAX_NOTES_LENGTH: 1000,
  NSS_REGEX: /^(?:\d{11,12}|\d{2}\/\d{8}-\d{2})$/,
  NIF_REGEX: /^[0-9]{8}[A-Z]$|^[XYZ][0-9]{7}[A-Z]$/i,
  EMPLOYEE_CODE_REGEX: /^[A-Z0-9]{3,10}$/,
  PERIOD_FORMAT_REGEX: /^\d{4}-\d{2}-\d{2}$/,
} as const;

export const IMPORT = {
  BATCH_SIZE: 50,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_FILE_SIZE_MB: 50,
  SUPPORTED_FORMATS: [".xls", ".xlsx", ".txt", ".csv"] as const,
  A3NOM_REQUIRED_COLUMNS: [
    "Código Trabajador",
    "Nombre Apellidos",
    "NIF Empresa",
    "Mes",
    "Bruto",
    "Coste Empresa",
  ] as const,
} as const;

export const COMPENSATION = {
  VARIABLE_THRESHOLD_PERCENT: 15,
  MIN_BONUS_AMOUNT: 100,
  MAX_BONUS_PERCENT: 200,
} as const;

export const DASHBOARD = {
  DEFAULT_YEAR: new Date().getFullYear(),
  HEATMAP_COLOR_SCALE: ["#10b981", "#f59e0b", "#ef4444"] as const,
  MAX_COMPANIES_CHART: 10,
  STALE_TIME_MS: 60000,
} as const;

export const QUERY = {
  STALE_TIME: 60000, // 1 minuto
  RETRY: 1,
} as const;

export const RECRUITMENT = {
  PIPELINE_STAGES: [
    'new', 'screening', 'phone_interview', 
    'technical_interview', 'final_interview', 
    'offer_sent', 'accepted', 'rejected'
  ],
  CANDIDATE_STATUS: ['new', 'in_process', 'hired', 'rejected', 'on_hold'],
  EVALUATION_TYPES: ['phone', 'technical', 'cultural', 'final'],
  SOURCES: ['linkedin', 'referral', 'website', 'job_board', 'headhunter', 'manual'],
  EMPLOYMENT_TYPES: ['full-time', 'part-time', 'contract', 'internship'],
  POSITION_LEVELS: ['junior', 'mid', 'senior', 'lead', 'director'],
} as const;

export const REVENUE_VIEW_MODES = {
  ASSIGNEE: 'assignee',
  CLIENT: 'client',
  COMPANY: 'company',
} as const;

export type RevenueViewMode = typeof REVENUE_VIEW_MODES[keyof typeof REVENUE_VIEW_MODES];

export const REVENUE_VIEW_LABELS: Record<RevenueViewMode, string> = {
  assignee: 'Por Empleado/Equipo',
  client: 'Por Cliente',
  company: 'Por Empresa',
};

export const MONTH_PRESETS = {
  Q1: { label: 'Q1', startMonth: 1, endMonth: 3 },
  Q2: { label: 'Q2', startMonth: 4, endMonth: 6 },
  Q3: { label: 'Q3', startMonth: 7, endMonth: 9 },
  Q4: { label: 'Q4', startMonth: 10, endMonth: 12 },
  S1: { label: 'S1', startMonth: 1, endMonth: 6 },
  S2: { label: 'S2', startMonth: 7, endMonth: 12 },
  YEAR: { label: 'Todo el año', startMonth: 1, endMonth: 12 },
} as const;

export const MONTHS = [
  { value: 1, label: 'Enero' },
  { value: 2, label: 'Febrero' },
  { value: 3, label: 'Marzo' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Mayo' },
  { value: 6, label: 'Junio' },
  { value: 7, label: 'Julio' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Septiembre' },
  { value: 10, label: 'Octubre' },
  { value: 11, label: 'Noviembre' },
  { value: 12, label: 'Diciembre' },
] as const;
