import { ReactNode } from 'react';

interface PublicOnboardingLayoutProps {
  children: ReactNode;
  candidateName?: string;
}

export function PublicOnboardingLayout({ children, candidateName }: PublicOnboardingLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-foreground">Grupo Navarro</h1>
              <p className="text-sm text-muted-foreground">Control de Costes | Capittal</p>
            </div>
            {candidateName && (
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Bienvenido/a</p>
                <p className="font-medium text-foreground">{candidateName}</p>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t bg-card mt-12">
        <div className="container mx-auto px-4 py-6 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Grupo Navarro. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
