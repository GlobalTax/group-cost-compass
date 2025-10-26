import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatDate } from "@/lib/formatters";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AuditLog {
  id: string;
  action: string;
  table_name: string;
  record_id: string | null;
  old_data: any;
  new_data: any;
  created_at: string;
  user_id: string | null;
}

interface AuditDrawerProps {
  log: AuditLog | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ACTION_VARIANTS: Record<string, "default" | "success" | "warning" | "destructive"> = {
  INSERT: "success",
  UPDATE: "warning",
  DELETE: "destructive",
};

const ENTITY_LABELS: Record<string, string> = {
  hr_employees: "Empleado",
  hr_employee_costs: "Coste",
  hr_transfers: "Traslado",
  companies: "Empresa",
};

const formatJsonDiff = (oldData: any, newData: any) => {
  if (!oldData && newData) {
    return Object.entries(newData).map(([key, value]) => ({
      key,
      old: null,
      new: value,
      changed: true,
    }));
  }

  if (oldData && !newData) {
    return Object.entries(oldData).map(([key, value]) => ({
      key,
      old: value,
      new: null,
      changed: true,
    }));
  }

  const allKeys = new Set([...Object.keys(oldData || {}), ...Object.keys(newData || {})]);
  return Array.from(allKeys).map((key) => ({
    key,
    old: oldData?.[key],
    new: newData?.[key],
    changed: JSON.stringify(oldData?.[key]) !== JSON.stringify(newData?.[key]),
  }));
};

export const AuditDrawer = ({ log, open, onOpenChange }: AuditDrawerProps) => {
  if (!log) return null;

  const diff = formatJsonDiff(log.old_data, log.new_data);

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="h-[90vh]">
        <DrawerHeader>
          <div className="flex items-center gap-3">
            <Badge variant={ACTION_VARIANTS[log.action] || "default"}>
              {log.action}
            </Badge>
            <DrawerTitle>
              {ENTITY_LABELS[log.table_name] || log.table_name}
            </DrawerTitle>
          </div>
          <DrawerDescription>
            Sistema · {formatDate(log.created_at)}
          </DrawerDescription>
        </DrawerHeader>

        <ScrollArea className="flex-1 px-6">
          <div className="space-y-6 pb-6">
            <div className="glass-card p-4">
              <p className="text-sm text-muted-foreground">
                🕒 Se registró una {log.action === "UPDATE" ? "actualización" : log.action === "INSERT" ? "creación" : "eliminación"} por Sistema.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Cambios detectados</h3>
              <div className="space-y-2">
                {diff.map((item) => (
                  <div
                    key={item.key}
                    className={`glass-card p-4 ${item.changed ? "border-l-4 border-warning" : ""}`}
                  >
                    <div className="font-mono text-sm font-medium mb-2">{item.key}</div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Antes</div>
                        <div className="font-mono bg-muted/50 p-2 rounded">
                          {item.old !== null && item.old !== undefined
                            ? JSON.stringify(item.old, null, 2)
                            : "—"}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Después</div>
                        <div className="font-mono bg-muted/50 p-2 rounded">
                          {item.new !== null && item.new !== undefined
                            ? JSON.stringify(item.new, null, 2)
                            : "—"}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {log.record_id && (
              <div className="glass-card p-4">
                <div className="text-xs text-muted-foreground">ID de registro</div>
                <div className="font-mono text-sm">{log.record_id}</div>
              </div>
            )}
          </div>
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  );
};
