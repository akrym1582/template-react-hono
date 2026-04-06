import { Hono } from "hono";
import {
  AUTH_ROUTE,
  HEALTH_ROUTE,
  SAMPLE_ITEMS_ROUTE,
  USERS_ROUTE,
} from "../../shared/constants/routes.js";
import { healthRoute } from "./health.js";
import { authRoute } from "./auth.js";
import { sampleItemsRoute } from "./sample-items.js";
import { usersRoute } from "./users.js";

/**
 * API ルートの集約ポイントです。
 * 新しい機能を追加するときは、まず個別の route ファイルを作り、ここで `/api/...` に接続すると
 * 「どの API が存在するか」を一か所で追えるようになります。
 */
const routes = new Hono()
  .route(HEALTH_ROUTE.base, healthRoute)
  .route(AUTH_ROUTE.base, authRoute)
  .route(SAMPLE_ITEMS_ROUTE.base, sampleItemsRoute)
  .route(USERS_ROUTE.base, usersRoute);

export { routes };
export type AppType = typeof routes;
