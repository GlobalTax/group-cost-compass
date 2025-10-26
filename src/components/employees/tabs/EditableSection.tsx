import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit2, Save, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FieldDefinition {
  name: string;
  label: string;
  value: any;
  type: 'text' | 'email' | 'tel' | 'date' | 'textarea' | 'select';
  options?: { value: string; label: string }[];
  placeholder?: string;
  disabled?: boolean;
}

interface EditableSectionProps {
  title: string;
  fields: FieldDefinition[];
  onSave: (data: Record<string, any>) => Promise<boolean>;
  isLoading?: boolean;
  className?: string;
}

export const EditableSection = ({ 
  title, 
  fields, 
  onSave, 
  isLoading = false,
  className 
}: EditableSectionProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSaving, setIsSaving] = useState(false);

  const handleEdit = () => {
    // Inicializar formData con valores actuales
    const initialData: Record<string, any> = {};
    fields.forEach(field => {
      initialData[field.name] = field.value || '';
    });
    setFormData(initialData);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setFormData({});
    setIsEditing(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    const success = await onSave(formData);
    setIsSaving(false);
    
    if (success) {
      setIsEditing(false);
      setFormData({});
    }
  };

  const handleFieldChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const InfoField = ({ label, value }: { label: string; value: any }) => (
    <div className="space-y-1">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-medium">{value || "—"}</p>
    </div>
  );

  return (
    <Card className={cn("transition-all", isEditing && "ring-2 ring-primary/20", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg">{title}</CardTitle>
        {!isEditing ? (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleEdit}
            disabled={isLoading}
          >
            <Edit2 className="w-4 h-4 mr-2" />
            Editar
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleCancel}
              disabled={isSaving}
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button 
              size="sm" 
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Guardar
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {fields.map(field => (
              <div 
                key={field.name} 
                className={cn(
                  field.type === 'textarea' && "md:col-span-2"
                )}
              >
                <Label htmlFor={field.name}>{field.label}</Label>
                {field.type === 'textarea' ? (
                  <Textarea
                    id={field.name}
                    value={formData[field.name] || ''}
                    onChange={(e) => handleFieldChange(field.name, e.target.value)}
                    placeholder={field.placeholder}
                    disabled={field.disabled}
                    className="mt-1.5"
                  />
                ) : field.type === 'select' ? (
                  <Select
                    value={formData[field.name] || ''}
                    onValueChange={(value) => handleFieldChange(field.name, value)}
                    disabled={field.disabled}
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder={field.placeholder} />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options?.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id={field.name}
                    type={field.type}
                    value={formData[field.name] || ''}
                    onChange={(e) => handleFieldChange(field.name, e.target.value)}
                    placeholder={field.placeholder}
                    disabled={field.disabled}
                    className="mt-1.5"
                  />
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {fields.map(field => (
              <div 
                key={field.name}
                className={cn(
                  field.type === 'textarea' && "md:col-span-2"
                )}
              >
                <InfoField label={field.label} value={field.value} />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
