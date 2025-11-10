import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Calendar, Mail, Plus, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export const ScheduledExportsManager = () => {
  const queryClient = useQueryClient();

  const { data: exports, isLoading } = useQuery({
    queryKey: ["scheduled-exports"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("scheduled_exports")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("scheduled_exports")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduled-exports"] });
      toast.success("Export programado eliminado");
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from("scheduled_exports")
        .update({ is_active: !isActive })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduled-exports"] });
      toast.success("Estado actualizado");
    },
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Exportaciones Automáticas Programadas</CardTitle>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Cargando...</p>
          ) : exports && exports.length > 0 ? (
            <div className="space-y-3">
              {exports.map((exp: any) => (
                <div
                  key={exp.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">
                          {exp.export_type.replace(/_/g, " ").toUpperCase()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Frecuencia: {exp.frequency} | Día {exp.schedule_day} a las{" "}
                          {exp.schedule_time}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Mail className="w-3 h-3" />
                          <p className="text-xs text-muted-foreground">
                            {exp.recipient_emails?.length || 0} destinatarios
                          </p>
                          {exp.last_run_status && (
                            <Badge 
                              variant={exp.last_run_status === "success" ? "default" : "destructive"}
                              className="ml-2"
                            >
                              {exp.last_run_status}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Switch
                      checked={exp.is_active}
                      onCheckedChange={() =>
                        toggleMutation.mutate({
                          id: exp.id,
                          isActive: exp.is_active,
                        })
                      }
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteMutation.mutate(exp.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No hay exportaciones programadas</p>
              <p className="text-sm mt-1">
                Crea tu primer export automático para recibir reportes por email
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
