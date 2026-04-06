export class AppError extends Error {
  constructor(
    message: string,
    readonly status = 500
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function getErrorStatus(error: unknown): number {
  return error instanceof AppError ? error.status : 500;
}

export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Internal Server Error";
}
