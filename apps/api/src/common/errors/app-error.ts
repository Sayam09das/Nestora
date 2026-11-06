export type AppErrorOptions = {
  statusCode: number;
  code: string;
  message: string;
  details?: Record<string, unknown>;
  cause?: unknown;
};

export class AppError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly details?: Record<string, unknown>;

  constructor(options: AppErrorOptions) {
    super(options.message, options.cause !== undefined ? { cause: options.cause } : undefined);
    this.name = new.target.name;
    this.statusCode = options.statusCode;
    this.code = options.code;
    this.details = options.details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export function isAppError(value: unknown): value is AppError {
  return value instanceof AppError;
}
