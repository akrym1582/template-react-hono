import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { app } from "./app.js";
import { env } from "./lib/env.js";
import { logger } from "./lib/logger.js";

app.use("*", serveStatic({ root: "./public" }));
app.use("*", serveStatic({ path: "./public/index.html" }));

const port = parseInt(env.PORT, 10);
serve({ fetch: app.fetch, port }, () => {
  logger.info(`Server running on port ${port}`);
});
