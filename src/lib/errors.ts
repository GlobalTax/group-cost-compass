/**
 * Custom error classes for better error handling
 * Permite diferenciar tipos de errores y aplicar estrategias específicas
 */

export class RepositoryError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "RepositoryError";
  }
}

export class ServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "ServiceError";
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "ValidationError";
  }
}

export class ImportError extends Error {
  constructor(
    message: string,
    public stage: "parsing" | "validation" | "matching" | "insertion",
    public details?: unknown
  ) {
    super(message);
    this.name = "ImportError";
  }
}
