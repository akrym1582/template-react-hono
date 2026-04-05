import { createMiddleware } from "hono/factory";
import type { UserRole } from "../../shared/types/index.js";
import type { SessionAuthVariables } from "./session-auth.js";

export function requireRole(role: UserRole) {
  return createMiddleware<SessionAuthVariables>(async (c, next) => {
    const roles = c.get("roles");
    if (!roles?.length) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    if (!roles.includes(role)) {
      return c.json({ error: "Forbidden" }, 403);
    }

    await next();
  });
}
