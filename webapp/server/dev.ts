import { createServer } from "http";
import { createServer as createViteServer } from "vite";
import { app } from "./app.js";
import { env } from "./lib/env.js";
import { logger } from "./lib/logger.js";

/**
 * 開発用サーバーです。
 * `/api` は Hono に流し、それ以外は Vite のミドルウェアに渡すことで
 * 「バックエンド API」と「React の HMR」を 1 つのポートで同時に扱っています。
 */
async function startDevServer() {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });

  const server = createServer(async (req, res) => {
    if (req.url?.startsWith("/api")) {
      /** Node のリクエストを Web 標準の Request に詰め替え、Hono の `fetch` へ渡します。 */
      const url = new URL(req.url, `http://localhost`);
      const headers: Record<string, string> = {};
      for (const [key, value] of Object.entries(req.headers)) {
        if (typeof value === "string") headers[key] = value;
        else if (Array.isArray(value)) headers[key] = value.join(", ");
      }

      const init: RequestInit = { method: req.method, headers };
      if (req.method !== "GET" && req.method !== "HEAD") {
        const chunks: Buffer[] = [];
        for await (const chunk of req) {
          chunks.push(chunk as Buffer);
        }
        init.body = Buffer.concat(chunks);
      }

      const request = new Request(url.toString(), init);
      const response = await app.fetch(request);

      /** Hono のレスポンスを Node のレスポンスへ戻して返します。 */
      res.writeHead(response.status, Object.fromEntries(response.headers));
      const body = await response.arrayBuffer();
      res.end(Buffer.from(body));
    } else {
      vite.middlewares(req, res, (err?: unknown) => {
        if (err) {
          logger.error("Vite middleware error", {
            error: err instanceof Error ? err.message : String(err),
          });
          res.writeHead(500);
          res.end("Internal Server Error");
        }
      });
    }
  });

  const port = parseInt(env.PORT, 10);
  server.listen(port, () => {
    logger.info(`Dev server running on port ${port}`);
  });
}

/** 開発サーバー起動中の例外を見逃さないよう、最後にまとめて捕捉します。 */
startDevServer().catch(console.error);
