import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface DuplicateGroup {
  name: string;
  companyId: string;
  companyName: string;
  employees: Array<{
    id: string;
    fullName: string;
    employeeCode: string | null;
    annualSalary: number | null;
    costsCount: number;
    createdAt: string;
  }>;
  toKeep: string | null;
  toDelete: string[];
}

export const useDuplicateCleanup = () => {
  const queryClient = useQueryClient();

  const detectDuplicates = async (): Promise<DuplicateGroup[]> => {
    // Obtener todos los empleados con su info de costes
    const { data: employees, error } = await supabase
      .from("hr_employees")
      .select(`
        id,
        full_name,
        employee_code,
        annual_salary,
        company_id,
        created_at,
        companies!inner(name)
      `)
      .order("full_name", { ascending: true });

    if (error) throw error;

    // Contar costes para cada empleado
    const employeesWithCosts = await Promise.all(
      (employees || []).map(async (emp) => {
        const { count } = await supabase
          .from("hr_employee_costs")
          .select("*", { count: "exact", head: true })
          .eq("employee_id", emp.id);

        return {
          id: emp.id,
          fullName: emp.full_name,
          employeeCode: emp.employee_code,
          annualSalary: emp.annual_salary,
          companyId: emp.company_id,
          companyName: (emp.companies as any)?.name || "—",
          costsCount: count || 0,
          createdAt: emp.created_at,
        };
      })
    );

    // Agrupar por nombre + empresa
    const grouped = new Map<string, typeof employeesWithCosts>();
    employeesWithCosts.forEach((emp) => {
      const key = `${emp.fullName}:${emp.companyId}`;
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(emp);
    });

    // Filtrar solo grupos con duplicados y determinar cuál mantener
    const duplicateGroups: DuplicateGroup[] = [];
    grouped.forEach((emps, key) => {
      if (emps.length > 1) {
        // Criterio de prioridad: costes > salario > más antiguo
        const sorted = [...emps].sort((a, b) => {
          if (a.costsCount !== b.costsCount) return b.costsCount - a.costsCount;
          if (a.annualSalary && !b.annualSalary) return -1;
          if (!a.annualSalary && b.annualSalary) return 1;
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        });

        const toKeep = sorted[0].id;
        const toDelete = sorted.slice(1).map((e) => e.id);

        duplicateGroups.push({
          name: emps[0].fullName,
          companyId: emps[0].companyId,
          companyName: emps[0].companyName,
          employees: sorted,
          toKeep,
          toDelete,
        });
      }
    });

    return duplicateGroups;
  };

  const cleanupMutation = useMutation({
    mutationFn: async (toDelete: string[]) => {
      const { error } = await supabase
        .from("hr_employees")
        .delete()
        .in("id", toDelete);

      if (error) throw error;
      return toDelete.length;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["employees-with-costs"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["costs-overview"] });
      toast.success(`${count} empleado(s) duplicado(s) eliminado(s)`);
    },
    onError: (error: Error) => {
      toast.error(`Error al limpiar duplicados: ${error.message}`);
    },
  });

  return {
    detectDuplicates,
    cleanupMutation,
  };
};
