export function normalizeEmail(value?: string): string | undefined {
  return value?.trim().toLowerCase();
}
