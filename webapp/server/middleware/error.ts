import { createMiddleware } from "hono/factory";
import { logger } from "../lib/logger.js";

/**
 * サーバー全体の最終防衛線です。
 * try/catch を各 route に毎回書かずに済むよう、共通の 500 エラーレスポンスとログ出力をここに集めています。
 */
export const errorMiddleware = createMiddleware(async (c, next) => {
  try {
    await next();
  } catch (err) {
    logger.error("Unhandled error", {
      error: err instanceof Error ? err.message : String(err),
      path: c.req.path,
      method: c.req.method,
    });
    return c.json({ error: "Internal Server Error" }, 500);
  }
});
