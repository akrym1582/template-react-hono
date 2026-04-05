import { hc } from "hono/client";
import type { AppType } from "../../server/routes/index.js";
import { acquireToken } from "./auth.js";

export const apiClient = hc<AppType>("/", {
  headers: async (): Promise<Record<string, string>> => {
    const token = await acquireToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  },
});
