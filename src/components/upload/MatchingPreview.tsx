import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle, Loader2, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface MatchingPreviewProps {
  rows: Array<{
    employee_id?: string;
    nif?: string;
    name?: string;
    company?: string;
  }>;
  companies: Array<{ id: string; name: string }>;
}

interface MatchingStats {
  totalRows: number;
  matchedByCode: number;
  matchedByNif: number;
  matchedByName: number;
  unmapped: number;
  examples: string[];
}

export const MatchingPreview = ({ rows, companies }: MatchingPreviewProps) => {
  const [isChecking, setIsChecking] = useState(false);
  const [stats, setStats] = useState<MatchingStats | null>(null);

  const handleCheckMatching = async () => {
    setIsChecking(true);
    try {
      const companyByName = new Map(companies.map(c => [c.name.toLowerCase().trim(), c.id]));

      // Recopilar identificadores únicos
      const codes = new Set<string>();
      const nifs = new Set<string>();
      const names = new Set<string>();

      rows.forEach(row => {
        if (row.employee_id?.trim()) codes.add(row.employee_id.trim());
        if (row.nif?.trim()) nifs.add(row.nif.trim());
        if (row.name?.trim() && !row.employee_id?.trim() && !row.nif?.trim()) {
          names.add(row.name.trim());
        }
      });

      let matchedByCode = 0;
      let matchedByNif = 0;
      let matchedByName = 0;

      // Chequear códigos
      if (codes.size > 0) {
        const { data: empsByCode } = await supabase
          .from("hr_employees")
          .select("employee_code")
          .in("employee_code", Array.from(codes));
        
        const foundCodes = new Set(empsByCode?.map(e => e.employee_code) || []);
        matchedByCode = Array.from(codes).filter(c => foundCodes.has(c)).length;
      }

      // Chequear NIFs
      if (nifs.size > 0) {
        const { data: empsByNif } = await supabase
          .from("hr_employees")
          .select("dni")
          .in("dni", Array.from(nifs));
        
        const foundNifs = new Set(empsByNif?.map(e => e.dni) || []);
        matchedByNif = Array.from(nifs).filter(n => foundNifs.has(n)).length;
      }

      // Chequear nombres (simplificado: solo match exacto para preview)
      if (names.size > 0) {
        const { data: empsByName } = await supabase
          .from("hr_employees")
          .select("full_name");
        
        const normalizedDbNames = new Set(
          empsByName?.map(e => e.full_name.toLowerCase().trim()) || []
        );
        matchedByName = Array.from(names).filter(n => 
          normalizedDbNames.has(n.toLowerCase().trim())
        ).length;
      }

      const totalIdentifiers = codes.size + nifs.size + names.size;
      const totalMatched = matchedByCode + matchedByNif + matchedByName;
      const unmapped = totalIdentifiers - totalMatched;

      // Ejemplos de no mapeados (primeros 5)
      const examples: string[] = [];
      if (unmapped > 0) {
        const allIdentifiers = [...codes, ...nifs, ...names];
        examples.push(...allIdentifiers.slice(0, 5));
      }

      setStats({
        totalRows: rows.length,
        matchedByCode,
        matchedByNif,
        matchedByName,
        unmapped,
        examples,
      });

      if (totalMatched === totalIdentifiers) {
        toast.success("✅ Todos los identificadores se mapearán correctamente");
      } else {
        toast.warning(`⚠️ ${unmapped} identificadores no se encontraron en la BD`);
      }
    } catch (error) {
      console.error("Error checking matching:", error);
      toast.error("Error al verificar matching");
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-sm">Pre-chequeo de Matching</h4>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCheckMatching}
          disabled={isChecking || rows.length === 0}
        >
          {isChecking ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Verificando...
            </>
          ) : (
            <>
              <Search className="w-4 h-4 mr-2" />
              Probar matching
            </>
          )}
        </Button>
      </div>

      {stats && (
        <div className="space-y-3">
          <Alert className={stats.unmapped === 0 ? "border-green-200 bg-green-50 dark:bg-green-950" : "border-orange-200 bg-orange-50 dark:bg-orange-950"}>
            {stats.unmapped === 0 ? (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-orange-600" />
            )}
            <AlertDescription className="text-xs space-y-2">
              <div className="font-semibold">
                {stats.unmapped === 0 
                  ? "✅ Cobertura completa" 
                  : `⚠️ ${stats.unmapped} identificadores sin mapear`}
              </div>
              <div className="space-y-1 text-muted-foreground">
                {stats.matchedByCode > 0 && (
                  <div>• {stats.matchedByCode} por código empleado</div>
                )}
                {stats.matchedByNif > 0 && (
                  <div>• {stats.matchedByNif} por NIF/DNI</div>
                )}
                {stats.matchedByName > 0 && (
                  <div>• {stats.matchedByName} por nombre</div>
                )}
                {stats.unmapped > 0 && (
                  <div className="text-orange-700 dark:text-orange-400">
                    • {stats.unmapped} sin coincidencia
                  </div>
                )}
              </div>
              {stats.examples.length > 0 && (
                <div className="text-xs mt-2 p-2 bg-background/50 rounded border">
                  <div className="font-medium mb-1">Ejemplos sin mapear:</div>
                  {stats.examples.map((ex, i) => (
                    <div key={i} className="truncate">• {ex}</div>
                  ))}
                </div>
              )}
            </AlertDescription>
          </Alert>
        </div>
      )}

      {!stats && (
        <p className="text-xs text-muted-foreground">
          Haz clic en "Probar matching" para verificar cuántos empleados se encontrarán en la base de datos.
        </p>
      )}
    </Card>
  );
};
