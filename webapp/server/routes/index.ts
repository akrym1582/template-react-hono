import { Hono } from "hono";
import { healthRoute } from "./health.js";
import { authRoute } from "./auth.js";
import { usersRoute } from "./users.js";

const routes = new Hono()
  .route("/api/health", healthRoute)
  .route("/api/auth", authRoute)
  .route("/api/users", usersRoute);

export { routes };
export type AppType = typeof routes;
