import { Component, ReactNode, ErrorInfo } from "react";
import { handleError, type AppError } from "@/lib/errorHandler";
import { logErrorToService } from "@/lib/errorLogging";
import { DefaultErrorFallback } from "./ErrorFallbacks";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  context?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary genérico para capturar errores de renderizado en React
 * 
 * @example
 * <ErrorBoundary fallback={<CustomFallback />} context="Dashboard">
 *   <MyComponent />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const context = this.props.context || "ErrorBoundary";
    
    // Clasificar y formatear error
    const appError: AppError = handleError(error, context);
    
    // Log a Supabase (audit_logs) y consola
    logErrorToService(appError, errorInfo, context);
    
    // Callback personalizado
    this.props.onError?.(error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <DefaultErrorFallback 
          error={this.state.error}
          resetError={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}
