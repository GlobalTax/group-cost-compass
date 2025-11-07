import { useState, useMemo } from "react";
import { Check, Search, Users as UsersIcon } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useEmployees } from "@/hooks/useEmployees";
import { useTeams } from "@/hooks/useTeams";

interface SearchableAssigneeSelectorProps {
  value?: { type?: "employee" | "team"; id?: string; name?: string } | null;
  onSelect: (value: { type: "employee" | "team"; id: string; name: string }) => void;
  placeholder?: string;
  className?: string;
}

export const SearchableAssigneeSelector = ({
  value,
  onSelect,
  placeholder = "Buscar persona o equipo...",
  className,
}: SearchableAssigneeSelectorProps) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: employees } = useEmployees({ activeOnly: true });
  const { data: teams } = useTeams();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const filteredEmployees = useMemo(() => {
    if (!employees) return [];
    if (!searchTerm) return employees;
    
    const term = searchTerm.toLowerCase();
    return employees.filter((emp) => 
      emp.full_name.toLowerCase().includes(term) ||
      emp.companies?.name?.toLowerCase().includes(term) ||
      emp.dni?.toLowerCase().includes(term)
    );
  }, [employees, searchTerm]);

  const filteredTeams = useMemo(() => {
    if (!teams) return [];
    if (!searchTerm) return teams;
    
    const term = searchTerm.toLowerCase();
    return teams.filter((team) => 
      team.name.toLowerCase().includes(term) ||
      team.departments?.name?.toLowerCase().includes(term)
    );
  }, [teams, searchTerm]);

  const handleSelect = (type: "employee" | "team", id: string, name: string) => {
    onSelect({ type, id, name });
    setOpen(false);
    setSearchTerm("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          {value ? (
            <div className="flex items-center gap-2">
              {value.type === "employee" ? (
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs">
                    {getInitials(value.name)}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <UsersIcon className="h-3 w-3 text-primary" />
                </div>
              )}
              <span className="truncate">{value.name}</span>
              <Badge variant="outline" className="text-xs">
                {value.type === "employee" ? "Empleado" : "Equipo"}
              </Badge>
            </div>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Buscar por nombre, equipo o departamento..."
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
          <CommandList>
            <CommandEmpty>No se encontraron resultados</CommandEmpty>
            
            {filteredEmployees.length > 0 && (
              <CommandGroup heading="Empleados">
                {filteredEmployees.map((emp) => (
                  <CommandItem
                    key={emp.id}
                    value={emp.id}
                    onSelect={() => handleSelect("employee", emp.id, emp.full_name)}
                    className="cursor-pointer"
                  >
                    <Avatar className="h-8 w-8 mr-3">
                      <AvatarFallback className="text-xs">
                        {getInitials(emp.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col flex-1">
                      <span className="font-medium">{emp.full_name}</span>
                      <span className="text-xs text-muted-foreground">
                        {emp.companies?.name}
                      </span>
                    </div>
                    {value?.type === "employee" && value.id === emp.id && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            
            {filteredTeams.length > 0 && (
              <CommandGroup heading="Equipos">
                {filteredTeams.map((team) => (
                  <CommandItem
                    key={team.id}
                    value={team.id}
                    onSelect={() => handleSelect("team", team.id, team.name)}
                    className="cursor-pointer"
                  >
                    <div className="h-8 w-8 mr-3 rounded-full bg-primary/10 flex items-center justify-center">
                      <UsersIcon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex flex-col flex-1">
                      <span className="font-medium">{team.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {team.departments?.name}
                        {team.member_count && ` · ${team.member_count} miembros`}
                      </span>
                    </div>
                    {value?.type === "team" && value.id === team.id && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
