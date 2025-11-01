export type DataType = "employees" | "costs" | "payroll" | "mixed";

export interface CompanyDetection {
  original: string;
  normalized: string;
  nif: string;
  confidence: number;
}

export interface AIParseResponse {
  detected_type: DataType;
  confidence: number;
  column_mapping: Record<string, string>;
  companies_detected: CompanyDetection[];
  preview: Array<Record<string, any>>;
  warnings: string[];
  errors: string[];
  suggested_period?: string;
}

export interface AIParseRequest {
  rows: Array<Record<string, any>>;
  fileName: string;
  companyCatalog: Array<{ id: string; name: string; nif: string }>;
}
