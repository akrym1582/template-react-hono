import { hc } from "hono/client";
import type { AppType } from "../../server/routes/index.js";
import { acquireToken } from "./auth.js";

/**
 * Hono RPC クライアントです。
 * サーバー側の route 型をそのまま使うので、API を追加すると補完や型チェックが自動で追従します。
 * 共通ヘッダーを増やしたい場合もこの生成箇所を触れば全 API 呼び出しへ反映できます。
 */
export const apiClient = hc<AppType>("/", {
  headers: async (): Promise<Record<string, string>> => {
    const token = await acquireToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  },
});
