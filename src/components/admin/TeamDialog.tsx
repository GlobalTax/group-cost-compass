import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateTeam, useUpdateTeam } from "@/hooks/useTeams";
import { useDepartments } from "@/hooks/useDepartments";
import { teamSchema, type TeamFormData } from "@/lib/validators/teamSchema";
import type { Team, TeamInsert } from "@/lib/supabase/repositories/teams.repo";
import { supabase } from "@/lib/supabase/client";

interface TeamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  team?: Team;
}

export const TeamDialog = ({ open, onOpenChange, team }: TeamDialogProps) => {
  const [orgId, setOrgId] = useState<string>("");
  const { data: departments } = useDepartments();
  const createTeam = useCreateTeam();
  const updateTeam = useUpdateTeam();

  const form = useForm<TeamFormData>({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      name: "",
      department_id: "",
      description: "",
      is_active: true,
      org_id: "",
    },
  });

  useEffect(() => {
    const getOrgId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: userData } = await supabase
          .from('users')
          .select('org_id')
          .eq('id', user.id)
          .single();
        if (userData?.org_id) {
          setOrgId(userData.org_id);
          form.setValue('org_id', userData.org_id);
        }
      }
    };
    getOrgId();
  }, [form]);

  useEffect(() => {
    if (team && open) {
      form.reset({
        name: team.name,
        department_id: team.department_id,
        description: team.description || "",
        is_active: team.is_active,
        org_id: team.org_id,
      });
    } else if (!team && open && orgId) {
      form.reset({
        name: "",
        department_id: "",
        description: "",
        is_active: true,
        org_id: orgId,
      });
    }
  }, [team, open, form, orgId]);

  const onSubmit = async (data: TeamFormData) => {
    if (team) {
      const updates = {
        name: data.name,
        org_id: data.org_id,
        department_id: data.department_id,
        description: data.description,
        is_active: data.is_active,
      };
      await updateTeam.mutateAsync({ id: team.id, updates });
    } else {
      await createTeam.mutateAsync(data as TeamInsert);
    }
    onOpenChange(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{team ? 'Editar Equipo' : 'Nuevo Equipo'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del equipo</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Equipo Backend" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="department_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Departamento</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona departamento" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {departments?.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción (opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descripción del equipo..."
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <FormLabel>Estado activo</FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createTeam.isPending || updateTeam.isPending}
              >
                {team ? 'Guardar cambios' : 'Crear equipo'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
