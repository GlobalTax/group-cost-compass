import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, Upload, X, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface DocumentUploadZoneProps {
  onNext: () => void;
  onBack: () => void;
  isSubmitting?: boolean;
}

interface UploadedFile {
  name: string;
  size: number;
  type: string;
  url?: string;
}

const REQUIRED_DOCUMENTS = [
  { id: 'dni_front', label: 'DNI/NIE (anverso)', required: true },
  { id: 'dni_back', label: 'DNI/NIE (reverso)', required: true },
  { id: 'social_security', label: 'Número Seguridad Social', required: true },
  { id: 'certificate', label: 'Título universitario/certificados', required: false },
];

export function DocumentUploadZone({ onNext, onBack, isSubmitting }: DocumentUploadZoneProps) {
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, UploadedFile>>({});
  const [uploading, setUploading] = useState<Record<string, boolean>>({});

  const handleFileChange = async (docId: string, file: File | null) => {
    if (!file) return;

    // Validaciones
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];

    if (file.size > maxSize) {
      toast.error('El archivo es demasiado grande. Máximo 10MB.');
      return;
    }

    if (!allowedTypes.includes(file.type)) {
      toast.error('Tipo de archivo no permitido. Solo PDF, JPG o PNG.');
      return;
    }

    setUploading((prev) => ({ ...prev, [docId]: true }));

    try {
      // Simular upload (aquí iría la lógica real de Supabase Storage)
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setUploadedFiles((prev) => ({
        ...prev,
        [docId]: {
          name: file.name,
          size: file.size,
          type: file.type,
          url: URL.createObjectURL(file),
        },
      }));

      toast.success('Documento subido correctamente');
    } catch (error) {
      toast.error('Error al subir el documento');
    } finally {
      setUploading((prev) => ({ ...prev, [docId]: false }));
    }
  };

  const handleRemove = (docId: string) => {
    setUploadedFiles((prev) => {
      const updated = { ...prev };
      delete updated[docId];
      return updated;
    });
    toast.success('Documento eliminado');
  };

  const canProceed = REQUIRED_DOCUMENTS
    .filter((doc) => doc.required)
    .every((doc) => uploadedFiles[doc.id]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Documentación</CardTitle>
        <CardDescription>Sube los documentos requeridos para tu incorporación</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {REQUIRED_DOCUMENTS.map((doc) => {
          const uploaded = uploadedFiles[doc.id];
          const isUploading = uploading[doc.id];

          return (
            <div key={doc.id} className="space-y-2">
              <Label>
                {doc.label} {doc.required && <span className="text-destructive">*</span>}
              </Label>

              {!uploaded ? (
                <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                  <Input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange(doc.id, e.target.files?.[0] || null)}
                    disabled={isUploading}
                    className="hidden"
                    id={`file-${doc.id}`}
                  />
                  <label htmlFor={`file-${doc.id}`} className="cursor-pointer">
                    {isUploading ? (
                      <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin text-muted-foreground" />
                    ) : (
                      <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    )}
                    <p className="text-sm text-muted-foreground">
                      {isUploading ? 'Subiendo...' : 'Click para seleccionar archivo'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">PDF, JPG o PNG (máx. 10MB)</p>
                  </label>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                  <FileText className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{uploaded.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(uploaded.size / 1024).toFixed(0)} KB
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemove(doc.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          );
        })}

        <div className="bg-muted p-4 rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>Importante:</strong> Los documentos marcados con * son obligatorios. 
            Asegúrate de que sean legibles y estén completos.
          </p>
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onBack} className="flex-1">
            Anterior
          </Button>
          <Button onClick={onNext} disabled={!canProceed || isSubmitting} className="flex-1">
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Siguiente
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
