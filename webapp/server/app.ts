import { Hono } from "hono";
import { cors } from "hono/cors";
import { errorMiddleware } from "./middleware/error.js";
import { routes } from "./routes/index.js";

export const app = new Hono();

app.use("*", errorMiddleware);
app.use("/api/*", cors());

app.route("/", routes);

export type AppType = typeof routes;
