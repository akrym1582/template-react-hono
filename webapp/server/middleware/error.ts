import { createMiddleware } from "hono/factory";
import { logger } from "../lib/logger.js";

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
