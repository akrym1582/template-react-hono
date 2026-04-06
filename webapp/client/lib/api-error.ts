export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function getApiErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Request failed";
}
