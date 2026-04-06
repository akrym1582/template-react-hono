const encoder = new TextEncoder();

function escapeCsvValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  const normalized = String(value);
  return /[",\r\n]/.test(normalized)
    ? `"${normalized.replace(/"/g, "\"\"")}"`
    : normalized;
}

export function createCsvStream<T>(options: {
  headers: string[];
  rows: AsyncIterable<T>;
  mapRow: (row: T) => Array<string | number | boolean | null | undefined>;
}) {
  return new ReadableStream<Uint8Array>({
    async start(controller) {
      controller.enqueue(encoder.encode("\uFEFF"));
      controller.enqueue(encoder.encode(`${options.headers.join(",")}\r\n`));

      for await (const row of options.rows) {
        const values = options.mapRow(row).map(escapeCsvValue).join(",");
        controller.enqueue(encoder.encode(`${values}\r\n`));
      }

      controller.close();
    },
  });
}
