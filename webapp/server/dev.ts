import { serve } from "@hono/node-server";
import { createServer as createViteServer } from "vite";
import { app } from "./app.js";
import { env } from "./lib/env.js";
import { logger } from "./lib/logger.js";

async function startDevServer() {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });

  app.use("*", async (c, next) => {
    if (c.req.path.startsWith("/api")) {
      return next();
    }
    return new Promise<void>((resolve, reject) => {
      vite.middlewares(c.env.incoming, c.env.outgoing, (err?: Error) => {
        if (err) reject(err);
        else resolve();
      });
    });
  });

  const port = parseInt(env.PORT, 10);
  serve({ fetch: app.fetch, port }, () => {
    logger.info(`Dev server running on port ${port}`);
  });
}

startDevServer().catch(console.error);
