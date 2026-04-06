import { Hono, type Context } from "hono";
import { zValidator } from "@hono/zod-validator";
import type { AuthResponse, CurrentSessionResponse } from "../../shared/types/index.js";
import { localLoginSchema, msalLoginSchema } from "../../shared/validators/index.js";
import { clearSessionCookie, setSessionCookie } from "../lib/auth/session.js";
import { logger } from "../lib/logger.js";
import {
  getRequestAuthUser,
  type SessionAuthVariables,
} from "../middleware/session-auth.js";
import { serverContainer } from "../container.js";
import { AuthService, isAuthError } from "../services/auth.service.js";

const authService = serverContainer.get(AuthService);

function handleAuthError(c: Context, error: unknown) {
  if (isAuthError(error)) {
    return c.json({ error: error.message }, { status: error.status });
  }

  logger.error("Authentication route failed", {
    error: error instanceof Error ? error.message : String(error),
    path: c.req.path,
    method: c.req.method,
  });
  return c.json({ error: "Authentication failed" }, 500);
}

/**
 * 認証 API 群です。
 * local / MSAL の入口は分かれていても、成功後は同じ Cookie セッションへそろえます。
 */
export const authRoute = new Hono<SessionAuthVariables>()
  .post("/login", zValidator("json", localLoginSchema), async (c) => {
    try {
      const body = c.req.valid("json");
      const result = await authService.loginWithPassword(body);
      setSessionCookie(c, result.token);
      return c.json<AuthResponse>({ ok: true, user: result.user });
    } catch (error) {
      return handleAuthError(c, error);
    }
  })
  .post("/msal/login", zValidator("json", msalLoginSchema), async (c) => {
    try {
      const body = c.req.valid("json");
      const result = await authService.loginWithMsal(body);
      setSessionCookie(c, result.token);
      return c.json<AuthResponse>({ ok: true, user: result.user });
    } catch (error) {
      return handleAuthError(c, error);
    }
  })
  .post("/logout", (c) => {
    clearSessionCookie(c);
    return c.json({ ok: true });
  })
  .get("/me", async (c) => {
    const authUser = await getRequestAuthUser(c);
    if (!authUser) {
      return c.json<CurrentSessionResponse>({ authenticated: false });
    }

    return c.json<CurrentSessionResponse>({
      authenticated: true,
      user: AuthService.toPublicUser(authUser),
    });
  });
