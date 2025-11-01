import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AIParseRequest {
  rows: Array<Record<string, any>>;
  fileName: string;
  companyCatalog: Array<{ id: string; name: string; nif: string }>;
}

interface AIParseResponse {
  detected_type: "employees" | "costs" | "payroll" | "mixed";
  confidence: number;
  column_mapping: Record<string, string>;
  companies_detected: Array<{
    original: string;
    normalized: string;
    nif: string;
    confidence: number;
  }>;
  preview: Array<Record<string, any>>;
  warnings: string[];
  errors: string[];
  suggested_period?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { rows, fileName, companyCatalog }: AIParseRequest = await req.json();

    if (!OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "OpenAI API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Limitar a primeras 25 filas para análisis
    const sampleRows = rows.slice(0, 25);

    const systemPrompt = `Eres un experto en importación de datos de RRHH para empresas españolas.

**Catálogo de empresas del Grupo Navarro:**
${JSON.stringify(companyCatalog, null, 2)}

**Tarea:**
Analiza las siguientes filas de un archivo (${fileName}) y determina:

1. **Tipo de datos** (employees/costs/payroll/mixed):
   - employees: Datos de alta de empleados (nombre, empresa, fecha_alta, dni)
   - costs: Costes mensuales (nif, nombre, empresa, período, bruto, coste_empresa)
   - payroll: Nómina A3Nom completa (código empleado, nif empresa, bruto, SS, IRPF, etc.)
   - mixed: Contiene tanto empleados como costes

2. **Mapeo de columnas** a campos estándar. Campos posibles:
   **Para empleados:**
   - employee_code, name, nif, company, hire_date, termination_date, department, position, seniority_date
   
   **Para costes:**
   - employee_nif, employee_name, company, period (formato YYYY-MM), bruto, coste_empresa
   
   **Para nóminas A3Nom:**
   - employee_code, employee_name, employee_nif, company_nif, bruto, coste_empresa, sal_neto, ss_empresa, irpf_dinero, ss_trabajador

3. **Empresas detectadas**: Normaliza variantes de nombres contra el catálogo. Ejemplos:
   - "NAVARRO LEGAL SLP" → "Navarro Legal y Tributario, SLP" (B67261552)
   - "BEGLOBAL" → "Beglobal Worldwide, SL" (B09835315)
   - "GOLOOPER SL" → "GoLooper, SL" (B02721918)
   - "SPV CORPORATE" → "SPV Corporate Advisor, SL" (B09652017)

4. **Validaciones:**
   - NIFs españoles: 12345678A o NIE X1234567A
   - Fechas: DD/MM/YYYY o YYYY-MM-DD
   - Números: Admite formato español (123.456,78) o inglés (123,456.78)
   - Si detectas columna "fecha_cobro" o "period", sugiere período YYYY-MM

5. **Warnings:**
   - Columnas ambiguas o con múltiples interpretaciones
   - Valores faltantes en campos críticos
   - Formatos de fecha inconsistentes

**IMPORTANTE:** 
- Si una columna tiene valores como "B67261552" (formato NIF), es "company_nif" NO "nif" de empleado
- Si ves código numérico corto (1-999), es "employee_code"
- Si ves NIF largo (12345678A), es "employee_nif"

**Formato de salida:** JSON estricto según esta estructura:
{
  "detected_type": "employees" | "costs" | "payroll" | "mixed",
  "confidence": 0.95,
  "column_mapping": {
    "TRABAJADOR": "employee_name",
    "N.I.F.": "employee_nif",
    "BRUTO": "bruto"
  },
  "companies_detected": [
    {
      "original": "NAVARRO LEGAL SLP",
      "normalized": "Navarro Legal y Tributario, SLP",
      "nif": "B67261552",
      "confidence": 1.0
    }
  ],
  "preview": [...],
  "warnings": [],
  "errors": [],
  "suggested_period": "2024-10"
}

**Datos a analizar:**`;

    const userPrompt = JSON.stringify(sampleRows, null, 2);

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_completion_tokens: 4000,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: `OpenAI API error: ${response.status}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const aiResult: AIParseResponse = JSON.parse(data.choices[0].message.content);

    console.log("[AI Parse] Result:", JSON.stringify(aiResult, null, 2));

    return new Response(JSON.stringify(aiResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in ai-parse-upload:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
