import { hc } from "hono/client";
import type { AppType } from "../../server/routes/index.js";

/**
 * Hono RPC クライアントです。
 * サーバー側の route 型をそのまま使うので、API を追加すると補完や型チェックが自動で追従します。
 * Cookie 認証へ統一したため、以後の API 呼び出しは `credentials: include` だけを共通設定します。
 */
export const apiClient = hc<AppType>("/", {
  init: {
    credentials: "include",
  },
});
