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
  MAX_NAME_LENGTH: 200,
  MAX_ADDRESS_LENGTH: 500,
  MAX_NOTES_LENGTH: 1000,
  NSS_REGEX: /^(?:\d{11,12}|\d{2}\/\d{8}-\d{2})$/,
  NIF_REGEX: /^[0-9]{8}[A-Z]$|^[XYZ][0-9]{7}[A-Z]$/i,
  EMPLOYEE_CODE_REGEX: /^[A-Z0-9]{3,10}$/,
} as const;

export const IMPORT = {
  BATCH_SIZE: 50,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
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
