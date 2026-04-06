import { createMiddleware } from "hono/factory";
import { getErrorMessage, getErrorStatus } from "../lib/errors.js";
import { logger } from "../lib/logger.js";

/**
 * サーバー全体の最終防衛線です。
 * try/catch を各 route に毎回書かずに済むよう、共通の 500 エラーレスポンスとログ出力をここに集めています。
 */
export const errorMiddleware = createMiddleware(async (c, next) => {
  try {
    await next();
  } catch (err) {
    const message = getErrorMessage(err);
    const status = getErrorStatus(err);
    logger.error("Unhandled error", {
      error: message,
      path: c.req.path,
      method: c.req.method,
      status,
    });
    return c.body(JSON.stringify({ message }), status as never, {
      "Content-Type": "application/json",
    });
  }
});
