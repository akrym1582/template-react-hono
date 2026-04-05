import { createServer } from "http";
import { createServer as createViteServer } from "vite";
import { app } from "./app.js";
import { env } from "./lib/env.js";
import { logger } from "./lib/logger.js";

async function startDevServer() {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });

  const server = createServer(async (req, res) => {
    if (req.url?.startsWith("/api")) {
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

startDevServer().catch(console.error);
