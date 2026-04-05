import { Hono } from "hono";
import { healthRoute } from "./health.js";
import { authRoute } from "./auth.js";
import { usersRoute } from "./users.js";

/**
 * API ルートの集約ポイントです。
 * 新しい機能を追加するときは、まず個別の route ファイルを作り、ここで `/api/...` に接続すると
 * 「どの API が存在するか」を一か所で追えるようになります。
 */
const routes = new Hono()
  .route("/api/health", healthRoute)
  .route("/api/auth", authRoute)
  .route("/api/users", usersRoute);

export { routes };
export type AppType = typeof routes;
