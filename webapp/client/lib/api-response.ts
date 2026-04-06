import { ApiError } from "./api-error.js";

async function readResponseBody(response: Response) {
  const contentType = response.headers?.get?.("content-type") ?? "";

  if (contentType.includes("application/json") || typeof response.json === "function") {
    return response.json();
  }

  const text = typeof response.text === "function" ? await response.text() : "";
  return text ? { message: text } : null;
}

export async function parseApiResponse<T>(
  response: Response,
  fallbackMessage = "Request failed"
): Promise<T> {
  const body = await readResponseBody(response);
  const status =
    "status" in response && typeof response.status === "number" ? response.status : 200;
  const isOk = "ok" in response ? response.ok : status < 400;

  if (!isOk) {
    const message =
      body && typeof body === "object"
        ? typeof (body as { message?: unknown }).message === "string"
          ? (body as { message: string }).message
          : typeof (body as { error?: unknown }).error === "string"
            ? (body as { error: string }).error
            : fallbackMessage
        : fallbackMessage;

    throw new ApiError(message, status);
  }

  return body as T;
}
