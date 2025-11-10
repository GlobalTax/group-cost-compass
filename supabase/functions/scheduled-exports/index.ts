import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ScheduledExport {
  id: string;
  export_type: string;
  company_id?: string;
  year?: number;
  recipient_emails: string[];
  org_id?: string;
  frequency: string;
  schedule_day: number;
  schedule_time: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    console.log("[Scheduled Exports] Iniciando ejecución...");

    // 1. Obtener exports programados que deben ejecutarse
    const now = new Date();
    const { data: exports, error: fetchError } = await supabase
      .from("scheduled_exports")
      .select("*")
      .eq("is_active", true)
      .lte("next_run_at", now.toISOString());

    if (fetchError) throw fetchError;

    console.log(`[Scheduled Exports] Encontrados ${exports?.length || 0} exports pendientes`);

    for (const exportConfig of exports || []) {
      try {
        await processExport(supabase, exportConfig);
        
        // Actualizar estado exitoso
        await supabase
          .from("scheduled_exports")
          .update({
            last_run_at: now.toISOString(),
            last_run_status: "success",
            next_run_at: calculateNextRun(exportConfig),
          })
          .eq("id", exportConfig.id);

        console.log(`[Scheduled Exports] Export ${exportConfig.id} completado`);
      } catch (error) {
        console.error(`[Scheduled Exports] Error en export ${exportConfig.id}:`, error);
        
        // Actualizar estado fallido
        await supabase
          .from("scheduled_exports")
          .update({
            last_run_at: now.toISOString(),
            last_run_status: "failed",
            last_run_error: (error as Error).message,
          })
          .eq("id", exportConfig.id);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: exports?.length || 0,
        timestamp: now.toISOString(),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("[Scheduled Exports] Error general:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

async function processExport(supabase: any, exportConfig: ScheduledExport) {
  console.log(`[Process Export] Tipo: ${exportConfig.export_type}`);

  // Generar export según tipo
  let fileData: Uint8Array;
  let filename: string;
  let mimeType: string;

  switch (exportConfig.export_type) {
    case "costs_excel":
      ({ fileData, filename, mimeType } = await generateCostsExcel(supabase, exportConfig));
      break;
    case "dashboard_pdf":
      ({ fileData, filename, mimeType } = await generateDashboardPDF(supabase, exportConfig));
      break;
    default:
      throw new Error(`Tipo de export no soportado: ${exportConfig.export_type}`);
  }

  // Enviar por email
  await sendEmailWithAttachment(
    exportConfig.recipient_emails,
    `Reporte Programado: ${exportConfig.export_type}`,
    `Adjunto encontrarás el reporte generado automáticamente el ${new Date().toLocaleDateString('es-ES')}.`,
    fileData,
    filename,
    mimeType
  );
}

async function generateCostsExcel(supabase: any, config: ScheduledExport) {
  const fileData = new TextEncoder().encode("Placeholder Excel Data");
  const filename = `costes_${config.year || new Date().getFullYear()}.xlsx`;
  const mimeType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  
  return { fileData, filename, mimeType };
}

async function generateDashboardPDF(supabase: any, config: ScheduledExport) {
  const fileData = new TextEncoder().encode("Placeholder PDF Data");
  const filename = `dashboard_${new Date().toISOString().slice(0, 7)}.pdf`;
  const mimeType = "application/pdf";
  
  return { fileData, filename, mimeType };
}

async function sendEmailWithAttachment(
  recipients: string[],
  subject: string,
  body: string,
  fileData: Uint8Array,
  filename: string,
  mimeType: string
) {
  console.log(`[Email] Enviando a ${recipients.join(", ")}`);
  console.log(`[Email] Adjunto: ${filename} (${fileData.length} bytes)`);
}

function calculateNextRun(exportConfig: ScheduledExport): string {
  const now = new Date();
  let nextRun = new Date(now);

  switch (exportConfig.frequency) {
    case "monthly":
      nextRun.setMonth(nextRun.getMonth() + 1);
      break;
    case "quarterly":
      nextRun.setMonth(nextRun.getMonth() + 3);
      break;
    case "yearly":
      nextRun.setFullYear(nextRun.getFullYear() + 1);
      break;
  }

  nextRun.setDate(exportConfig.schedule_day);

  return nextRun.toISOString();
}
