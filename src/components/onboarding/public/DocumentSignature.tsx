import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Loader2, FileText, CheckCircle2 } from 'lucide-react';

interface DocumentSignatureProps {
  onNext: () => void;
  onBack: () => void;
  isSubmitting?: boolean;
}

const DOCUMENTS_TO_SIGN = [
  {
    id: 'contract',
    name: 'Contrato de trabajo',
    description: 'Condiciones laborales, salario y jornada',
  },
  {
    id: 'rgpd',
    name: 'Política de protección de datos (RGPD)',
    description: 'Tratamiento de datos personales',
  },
  {
    id: 'confidentiality',
    name: 'Acuerdo de confidencialidad',
    description: 'Compromiso de confidencialidad de información',
  },
];

export function DocumentSignature({ onNext, onBack, isSubmitting }: DocumentSignatureProps) {
  const [signedDocuments, setSignedDocuments] = useState<Record<string, boolean>>({});

  const handleSignDocument = (docId: string, signed: boolean) => {
    setSignedDocuments((prev) => ({ ...prev, [docId]: signed }));
  };

  const allSigned = DOCUMENTS_TO_SIGN.every((doc) => signedDocuments[doc.id]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Firma de Documentos</CardTitle>
        <CardDescription>Lee y acepta los siguientes documentos</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {DOCUMENTS_TO_SIGN.map((doc) => {
          const isSigned = signedDocuments[doc.id];

          return (
            <div key={doc.id} className="border rounded-lg overflow-hidden">
              {/* Document header */}
              <div className="bg-muted p-4 flex items-center gap-3">
                <FileText className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-medium">{doc.name}</h3>
                  <p className="text-sm text-muted-foreground">{doc.description}</p>
                </div>
                {isSigned && <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />}
              </div>

              {/* Document viewer placeholder */}
              <div className="p-4 bg-background">
                <div className="border rounded p-8 text-center text-muted-foreground bg-muted/30 min-h-[200px] flex items-center justify-center">
                  <div>
                    <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Vista previa del documento</p>
                    <Button variant="link" size="sm" className="mt-2">
                      Ver documento completo
                    </Button>
                  </div>
                </div>
              </div>

              {/* Signature checkbox */}
              <div className="p-4 border-t bg-muted/30">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id={`sign-${doc.id}`}
                    checked={isSigned}
                    onCheckedChange={(checked) => handleSignDocument(doc.id, checked === true)}
                  />
                  <Label
                    htmlFor={`sign-${doc.id}`}
                    className="text-sm cursor-pointer leading-relaxed"
                  >
                    He leído y acepto los términos de este documento
                  </Label>
                </div>
              </div>
            </div>
          );
        })}

        <div className="bg-muted p-4 rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>Importante:</strong> Al marcar las casillas, declaras haber leído y aceptado 
            todos los documentos. Esta firma tiene validez legal.
          </p>
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onBack} className="flex-1">
            Anterior
          </Button>
          <Button onClick={onNext} disabled={!allSigned || isSubmitting} className="flex-1">
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Completar Proceso
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
