import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { app } from "./app.js";
import { env } from "./lib/env.js";
import { logger } from "./lib/logger.js";

/** 本番起動時はビルド済みの静的ファイルを配信します。 */
app.use("*", serveStatic({ root: "./public" }));
/** SPA のため、直接アクセスされたパスも index.html にフォールバックさせます。 */
app.use("*", serveStatic({ path: "./public/index.html" }));

const port = parseInt(env.PORT, 10);
/** Hono アプリを Node サーバーとして起動します。 */
serve({ fetch: app.fetch, port }, () => {
  logger.info(`Server running on port ${port}`);
});
