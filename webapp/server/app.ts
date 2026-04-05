import { Hono } from "hono";
import { cors } from "hono/cors";
import { createMiddleware } from "hono/factory";
import {
  createServerServiceProvider,
  type ServiceProviderVariables,
} from "./lib/service-provider.js";
import { errorMiddleware } from "./middleware/error.js";
import { routes } from "./routes/index.js";

/**
 * サーバー全体の入口です。
 * ここでは「どのミドルウェアを先に通すか」「どの URL にどのルート群をぶら下げるか」をまとめます。
 * 今後 API を増やすときは `./routes/index.ts` に新しいルートを追加し、必要ならここで共通ミドルウェアを挟みます。
 */
const serviceProviderMiddleware = createMiddleware<ServiceProviderVariables>(
  async (c, next) => {
    c.set("serviceProvider", createServerServiceProvider());
    await next();
  }
);

export const app = new Hono<ServiceProviderVariables>();

/** 予期しない例外を JSON で返すため、最初に共通エラーハンドリングを登録します。 */
app.use("*", errorMiddleware);
app.use("*", serviceProviderMiddleware);
/** API 配下だけ CORS を許可し、ブラウザから別オリジンでアクセスできるようにします。 */
app.use("/api/*", cors());

/** 画面と API の両方を同じサーバーで扱えるよう、まとめたルート群を接続します。 */
app.route("/", routes);

export type AppType = typeof routes;
